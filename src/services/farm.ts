import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { AnchorProvider, Program, Wallet, BN } from '@coral-xyz/anchor';
import * as spl from '@solana/spl-token';
import { FARM_PROGRAM_IDS, MODE, FARM_IDL } from '../constants';
import { SarosAPIService, type SarosAPIFarmInfo, type SarosAPIStakeInfo } from './api';
import { SarosAMMError } from '../utils/errors';
import {
  deriveFarmUserPoolAddress,
  deriveFarmUserPoolRewardAddress,
  deriveFarmPoolAuthority,
  deriveFarmPoolRewardAuthority,
} from '../utils/pda';
import type { PoolAccount, StakeParams, UnstakeParams, ClaimRewardParams, UserPosition } from '../types/farm';

/**
 * Pool type for API filtering only.
 * On-chain, both farm and stake use the same Pool account structure.
 * - 'farm': LP token staking pools (from /api/saros/information?type=farm)
 * - 'stake': Single token staking pools (from /api/saros/information?type=stake)
 */
export type PoolType = 'farm' | 'stake';

export interface SarosFarmConfig {
  mode: MODE;
  connection: Connection;
}

/**
 * Unified farming service for both LP token farming and single token staking
 *
 * @example
 * ```typescript
 * // Farm (LP tokens)
 * const farm = new SarosFarm(
 *   { mode: MODE.MAINNET, connection },
 *   farmPoolAddress,
 *   'farm'
 * );
 *
 * // Stake (single tokens)
 * const stake = new SarosFarm(
 *   { mode: MODE.MAINNET, connection },
 *   stakePoolAddress,
 *   'stake'
 * );
 *
 * await farm.refreshState();
 * const stakeTx = await farm.stake({
 *   payer: wallet.publicKey,
 *   amount: 1_000_000n
 * });
 * ```
 */
export class SarosFarm {
  private config: SarosFarmConfig;
  private connection: Connection;
  private program: Program;
  private poolAddress: PublicKey;
  private poolType: PoolType;

  private poolAccount?: PoolAccount;
  private apiInfo?: SarosAPIFarmInfo | SarosAPIStakeInfo;

  constructor(config: SarosFarmConfig, poolAddress: PublicKey, poolType: PoolType = 'farm') {
    this.config = config;
    this.connection = config.connection;
    this.poolAddress = poolAddress;
    this.poolType = poolType;

    const provider = new AnchorProvider(this.connection, {} as Wallet, AnchorProvider.defaultOptions());

    // Get program ID for the specified network
    const programId = FARM_PROGRAM_IDS[config.mode];

    // Create program instance with network-specific program ID
    // Note: We use the IDL from mainnet but override the program ID for devnet
    this.program = new Program({ ...FARM_IDL, address: programId.toBase58() } as any, provider);
  }

  /**
   * Refresh pool state from on-chain and API
   */
  public async refreshState(): Promise<void> {
    try {
      // Fetch on-chain pool account
      const poolAccountData = await (this.program.account as any).pool.fetch(this.poolAddress);

      this.poolAccount = {
        nonce: poolAccountData.nonce,
        authorityNonce: poolAccountData.authorityNonce,
        stakingTokenMint: poolAccountData.stakingTokenMint,
        stakingTokenAccount: poolAccountData.stakingTokenAccount,
        state: poolAccountData.state,
      };

      // Fetch API info with fallback
      this.apiInfo =
        this.poolType === 'farm'
          ? (await SarosAPIService.getFarmByPool(this.poolAddress.toBase58())) || undefined
          : (await SarosAPIService.getStakeByPool(this.poolAddress.toBase58())) || undefined;
    } catch (_error) {
      throw SarosAMMError.PoolFetchFailed(this.poolType);
    }
  }

  /**
   * Get raw API info (direct from Saros API)
   */
  public getApiInfo(): SarosAPIFarmInfo | SarosAPIStakeInfo | undefined {
    return this.apiInfo;
  }

  /**
   * Get pool account
   */
  public getPoolAccount(): PoolAccount {
    if (!this.poolAccount) {
      throw SarosAMMError.PoolNotInitialized();
    }
    return this.poolAccount;
  }

  /**
   * Stake tokens into the pool
   *
   * @returns Transaction to be signed and sent by the user
   */
  public async stake(params: StakeParams): Promise<Transaction> {
    if (!this.poolAccount) {
      throw SarosAMMError.PoolNotInitialized();
    }

    const { payer, amount } = params;
    const transaction = new Transaction();

    // Derive user pool address
    const [userPoolAddress, userPoolNonce] = deriveFarmUserPoolAddress(payer, this.poolAddress, this.program.programId);

    // Derive or use provided user staking token account
    const userStakingTokenAccount =
      params.userStakingTokenAccount || (await spl.getAssociatedTokenAddress(this.poolAccount.stakingTokenMint, payer));

    // Check if user pool account exists, create if not
    const userPoolAccountInfo = await this.connection.getAccountInfo(userPoolAddress);
    if (!userPoolAccountInfo) {
      const createUserPoolIx = await this.program.methods
        .createUserPool(userPoolNonce)
        .accounts({
          user: payer,
          pool: this.poolAddress,
          userPool: userPoolAddress,
          systemProgram: SystemProgram.programId,
        })
        .instruction();

      transaction.add(createUserPoolIx);
    }

    // Create stake pool instruction
    const stakeIx = await this.program.methods
      .stakePool(new BN(amount.toString()))
      .accounts({
        pool: this.poolAddress,
        poolStakingTokenAccount: this.poolAccount.stakingTokenAccount,
        user: payer,
        userPool: userPoolAddress,
        userStakingTokenAccount,
        tokenProgram: spl.TOKEN_PROGRAM_ID,
      })
      .instruction();

    transaction.add(stakeIx);

    // If there are rewards, stake pool reward for each
    if (this.apiInfo?.rewards) {
      for (const reward of this.apiInfo.rewards) {
        const poolRewardAddress = new PublicKey(reward.poolRewardAddress);
        const [userPoolRewardAddress, userPoolRewardNonce] = deriveFarmUserPoolRewardAddress(
          payer,
          poolRewardAddress,
          this.program.programId
        );

        // Check if user pool reward exists, create if not
        const userPoolRewardInfo = await this.connection.getAccountInfo(userPoolRewardAddress);
        if (!userPoolRewardInfo) {
          const createUserPoolRewardIx = await this.program.methods
            .createUserPoolReward(userPoolRewardNonce)
            .accounts({
              user: payer,
              poolReward: poolRewardAddress,
              userPoolReward: userPoolRewardAddress,
              systemProgram: SystemProgram.programId,
            })
            .instruction();

          transaction.add(createUserPoolRewardIx);
        }

        // Stake pool reward
        const stakePoolRewardIx = await this.program.methods
          .stakePoolReward()
          .accounts({
            pool: this.poolAddress,
            poolReward: poolRewardAddress,
            user: payer,
            userPool: userPoolAddress,
            userPoolReward: userPoolRewardAddress,
          })
          .instruction();

        transaction.add(stakePoolRewardIx);
      }
    }

    return transaction;
  }

  /**
   * Unstake tokens from the pool
   *
   * @returns Transaction to be signed and sent by the user
   */
  public async unstake(params: UnstakeParams): Promise<Transaction> {
    if (!this.poolAccount) {
      throw SarosAMMError.PoolNotInitialized();
    }

    const { payer, amount } = params;
    const transaction = new Transaction();

    // Derive addresses
    const [userPoolAddress] = deriveFarmUserPoolAddress(payer, this.poolAddress, this.program.programId);
    const [poolAuthority] = deriveFarmPoolAuthority(this.poolAddress, this.program.programId);

    const userStakingTokenAccount =
      params.userStakingTokenAccount || (await spl.getAssociatedTokenAddress(this.poolAccount.stakingTokenMint, payer));

    // Unstake pool rewards first
    if (this.apiInfo?.rewards) {
      for (const reward of this.apiInfo.rewards) {
        const poolRewardAddress = new PublicKey(reward.poolRewardAddress);
        const [userPoolRewardAddress] = deriveFarmUserPoolRewardAddress(
          payer,
          poolRewardAddress,
          this.program.programId
        );

        const unstakePoolRewardIx = await this.program.methods
          .unstakePoolReward()
          .accounts({
            pool: this.poolAddress,
            poolReward: poolRewardAddress,
            user: payer,
            userPool: userPoolAddress,
            userPoolReward: userPoolRewardAddress,
          })
          .instruction();

        transaction.add(unstakePoolRewardIx);
      }
    }

    // Unstake pool
    const unstakeIx = await this.program.methods
      .unstakePool(new BN(amount.toString()))
      .accounts({
        pool: this.poolAddress,
        poolAuthority,
        poolStakingTokenAccount: this.poolAccount.stakingTokenAccount,
        user: payer,
        userPool: userPoolAddress,
        userStakingTokenAccount,
        tokenProgram: spl.TOKEN_PROGRAM_ID,
      })
      .instruction();

    transaction.add(unstakeIx);

    return transaction;
  }

  /**
   * Claim rewards from a specific pool reward
   *
   * @returns Transaction to be signed and sent by the user
   */
  public async claimReward(params: ClaimRewardParams): Promise<Transaction> {
    const { payer, poolRewardAddress } = params;
    const transaction = new Transaction();

    // Fetch pool reward to get reward token mint
    const poolRewardAccount = await (this.program.account as any).poolReward.fetch(poolRewardAddress);

    // Derive addresses
    const [userPoolRewardAddress] = deriveFarmUserPoolRewardAddress(payer, poolRewardAddress, this.program.programId);
    const [poolRewardAuthority] = deriveFarmPoolRewardAuthority(poolRewardAddress, this.program.programId);

    const userRewardTokenAccount =
      params.userRewardTokenAccount || (await spl.getAssociatedTokenAddress(poolRewardAccount.rewardTokenMint, payer));

    // Check if user reward token account exists, create if not
    const userRewardAccountInfo = await this.connection.getAccountInfo(userRewardTokenAccount);
    if (!userRewardAccountInfo) {
      const createATAIx = spl.createAssociatedTokenAccountInstruction(
        payer,
        userRewardTokenAccount,
        payer,
        poolRewardAccount.rewardTokenMint
      );
      transaction.add(createATAIx);
    }

    // Claim reward
    const claimIx = await this.program.methods
      .claimReward()
      .accounts({
        poolReward: poolRewardAddress,
        poolRewardAuthority,
        poolRewardTokenAccount: poolRewardAccount.rewardTokenAccount,
        user: payer,
        userPoolReward: userPoolRewardAddress,
        userRewardTokenAccount,
        tokenProgram: spl.TOKEN_PROGRAM_ID,
      })
      .instruction();

    transaction.add(claimIx);

    return transaction;
  }

  /**
   * Get user's staking position
   */
  public async getUserPosition(user: PublicKey): Promise<UserPosition> {
    const [userPoolAddress] = deriveFarmUserPoolAddress(user, this.poolAddress, this.program.programId);

    const userPoolAccount = await (this.program.account as any).userPool.fetch(userPoolAddress);

    const rewards = [];
    if (this.apiInfo?.rewards) {
      for (const reward of this.apiInfo.rewards) {
        const poolRewardAddress = new PublicKey(reward.poolRewardAddress);
        const [userPoolRewardAddress] = deriveFarmUserPoolRewardAddress(
          user,
          poolRewardAddress,
          this.program.programId
        );

        try {
          const userPoolRewardAccount = await (this.program.account as any).userPoolReward.fetch(userPoolRewardAddress);

          rewards.push({
            poolRewardAddress,
            userPoolRewardAddress,
            rewardTokenMint: new PublicKey(reward.rewardTokenMint),
            amount: BigInt(userPoolRewardAccount.amount.toString()),
            rewardDebt: BigInt(userPoolRewardAccount.rewardDebt.toString()),
            rewardPending: BigInt(userPoolRewardAccount.rewardPending.toString()),
          });
        } catch {
          // User pool reward doesn't exist yet
        }
      }
    }

    return {
      userPoolAddress,
      stakedAmount: BigInt(userPoolAccount.amount.toString()),
      totalStaked: BigInt(userPoolAccount.totalStaked.toString()),
      rewards,
    };
  }
}
