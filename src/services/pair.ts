import { BN } from '@coral-xyz/anchor';
import { PublicKey, Transaction } from '@solana/web3.js';
import * as spl from '@solana/spl-token';
import { SarosBaseService, SarosAMMConfig } from './base';
import {
  AMMPairAccount,
  PairMetadata,
  QuoteParams,
  QuoteResponse,
  SwapParams,
  SwapCurveType,
  FeeMetadata,
  AddLiquidityParams,
  RemoveLiquidityParams,
} from '../types';
import { calculateSwapOutput, calculatePriceImpact, getMinOutputWithSlippage } from '../utils/calculations';
import { derivePoolAuthority } from '../utils/pda';
import { SarosAMMError } from '../utils/errors';
import { decodePairAccount } from '../utils/legacyAccountDecoder';

export class SarosAMMPair extends SarosBaseService {
  private pairAddress: PublicKey;
  private pairAccount!: AMMPairAccount;
  private metadata!: PairMetadata;

  private poolAuthority?: PublicKey;

  constructor(config: SarosAMMConfig, pairAddress: PublicKey) {
    super(config);
    this.pairAddress = pairAddress;
  }

  /**
   * Get the pair address
   */
  public getPairAddress(): PublicKey {
    return this.pairAddress;
  }

  /**
   * Get the pair account data
   */
  public getPairAccount(): AMMPairAccount {
    if (!this.pairAccount) {
      throw SarosAMMError.PairNotInitialized();
    }
    return this.pairAccount;
  }

  /**
   * Get the pair metadata
   */
  public getPairMetadata(): PairMetadata {
    if (!this.metadata) {
      throw SarosAMMError.PairNotInitialized();
    }
    return this.metadata;
  }

  /**
   * Fetch and refresh pair state from chain
   */
  public async refreshState(): Promise<void> {
    try {
      const accountInfo = await this.connection.getAccountInfo(this.pairAddress);
      if (!accountInfo) {
        throw SarosAMMError.PairFetchFailed();
      }

      // Use legacy decoder since Saros AMM doesn't use discriminators
      this.pairAccount = decodePairAccount(accountInfo.data);

      // Derive pool authority
      const [poolAuthority] = derivePoolAuthority(this.pairAddress, this.ammProgram.programId);
      this.poolAuthority = poolAuthority;

      // Build metadata with current reserves
      this.metadata = await this.buildPairMetadata();
    } catch (error) {
      SarosAMMError.handleError(error, SarosAMMError.PairFetchFailed());
    }
  }

  /**
   * Get a quote for a swap
   */
  public async getQuote(params: QuoteParams): Promise<QuoteResponse> {
    if (params.amount <= 0n) throw SarosAMMError.ZeroAmount();
    if (params.slippage < 0 || params.slippage >= 100) {
      throw SarosAMMError.InvalidSlippage();
    }

    try {
      const { amount, swapForY, slippage } = params;

      // Get current reserves
      const { tokenX, tokenY } = this.metadata;
      if (!tokenX.reserve || !tokenY.reserve) {
        throw SarosAMMError.PairNotInitialized();
      }

      const reserveIn = swapForY ? tokenX.reserve : tokenY.reserve;
      const reserveOut = swapForY ? tokenY.reserve : tokenX.reserve;

      // Calculate output
      const { tradeFeeNumerator, tradeFeeDenominator } = this.pairAccount.fees;

      const amountOut = calculateSwapOutput(
        amount,
        reserveIn,
        reserveOut,
        BigInt(tradeFeeNumerator.toString()),
        BigInt(tradeFeeDenominator.toString())
      );

      // Apply slippage
      const minAmountOut = getMinOutputWithSlippage(amountOut, slippage);

      // Calculate price impact
      const priceImpact = calculatePriceImpact(amount, amountOut, reserveIn, reserveOut);

      // Calculate rate
      const rate = Number(amountOut) / Number(amount);

      return {
        amountIn: amount,
        amountOut,
        minAmountOut,
        priceImpact,
        rate,
      };
    } catch (error) {
      SarosAMMError.handleError(error, SarosAMMError.QuoteCalculationFailed());
    }
  }

  /**
   * Execute a swap transaction
   *
   * @example
   * // Always get a quote first
   * const quote = await pair.getQuote({
   *   amount: 1_000_000n,
   *   swapForY: true,
   *   slippage: 1
   * });
   *
   * // Then execute swap with slippage protection
   * const tx = await pair.swap({
   *   payer: wallet.publicKey,
   *   amount: 1_000_000n,
   *   minAmountOut: quote.minAmountOut,
   *   swapForY: true
   * });
   */
  public async swap(params: SwapParams): Promise<Transaction> {
    try {
      const { amount, minAmountOut, swapForY, payer, transaction } = params;

      if (amount <= 0n) throw SarosAMMError.ZeroAmount();
      if (minAmountOut < 0n) throw SarosAMMError.InvalidSlippage();

      const tx = transaction || new Transaction();

      const { tokenAMint, tokenBMint, tokenA, tokenB, poolMint } = this.pairAccount;

      // Get or create user token accounts
      const userTokenA = params.userTokenX || (await spl.getAssociatedTokenAddress(tokenAMint, payer, true));
      const userTokenB = params.userTokenY || (await spl.getAssociatedTokenAddress(tokenBMint, payer, true));

      // Determine source and destination based on swap direction
      const [sourceToken, destToken, poolSource, poolDest] = swapForY
        ? [userTokenA, userTokenB, tokenA, tokenB]
        : [userTokenB, userTokenA, tokenB, tokenA];

      // Build swap instruction
      const swapIx = await this.ammProgram.methods
        .swap(new BN(amount.toString()), new BN(minAmountOut.toString()))
        .accountsPartial({
          swapInfo: this.pairAddress,
          authorityInfo: this.poolAuthority,
          userTransferAuthorityInfo: payer,
          sourceInfo: sourceToken,
          swapSourceInfo: poolSource,
          swapDestinationInfo: poolDest,
          destinationInfo: destToken,
          poolMintInfo: poolMint,
          poolFeeAccountInfo: this.pairAccount.poolFeeAccount,
          tokenProgramInfo: spl.TOKEN_PROGRAM_ID,
        })
        .instruction();

      tx.add(swapIx);
      return tx;
    } catch (error) {
      SarosAMMError.handleError(error, SarosAMMError.SwapFailed());
    }
  }

  /**
   * Add liquidity to an existing pool
   *
   * Calculates required token amounts based on current pool ratios and creates
   * a transaction to deposit tokens and mint LP tokens.
   *
   * @param params - Liquidity addition parameters
   * @returns Transaction for user to sign and send
   *
   * @example
   * const tx = await pair.addLiquidity({
   *   payer: wallet.publicKey,
   *   poolTokenAmount: 1_000_000_000n,
   *   maximumTokenA: 10_000_000n,
   *   maximumTokenB: 10_000_000n
   * });
   *
   * const signature = await connection.sendTransaction(tx, [wallet]);
   */
  public async addLiquidity(params: AddLiquidityParams): Promise<Transaction> {
    try {
      const { poolTokenAmount, maximumTokenA, maximumTokenB, payer, transaction } = params;

      if (poolTokenAmount <= 0n) throw SarosAMMError.ZeroAmount();
      if (maximumTokenA <= 0n || maximumTokenB <= 0n) throw SarosAMMError.InvalidSlippage();

      const tx = transaction || new Transaction();

      const { tokenAMint, tokenBMint, tokenA, tokenB, poolMint } = this.pairAccount;

      const userTokenA = params.userTokenX || (await spl.getAssociatedTokenAddress(tokenAMint, payer, true));
      const userTokenB = params.userTokenY || (await spl.getAssociatedTokenAddress(tokenBMint, payer, true));
      const userLpToken = params.userLpToken || (await spl.getAssociatedTokenAddress(poolMint, payer, true));

      const depositIx = await this.ammProgram.methods
        .depositAllTokenTypes(
          new BN(poolTokenAmount.toString()),
          new BN(maximumTokenA.toString()),
          new BN(maximumTokenB.toString())
        )
        .accountsPartial({
          swapInfo: this.pairAddress,
          authorityInfo: this.poolAuthority,
          userTransferAuthorityInfo: payer,
          sourceAInfo: userTokenA,
          sourceBInfo: userTokenB,
          tokenAInfo: tokenA,
          tokenBInfo: tokenB,
          poolMintInfo: poolMint,
          destInfo: userLpToken,
          tokenProgramInfo: spl.TOKEN_PROGRAM_ID,
        })
        .instruction();

      tx.add(depositIx);
      return tx;
    } catch (error) {
      SarosAMMError.handleError(error, SarosAMMError.AddLiquidityFailed());
    }
  }

  /**
   * Remove liquidity from a pool
   *
   * Burns LP tokens and withdraws proportional amounts of underlying tokens.
   *
   * @param params - Liquidity removal parameters
   * @returns Transaction for user to sign and send
   *
   * @example
   * const tx = await pair.removeLiquidity({
   *   payer: wallet.publicKey,
   *   poolTokenAmount: 1_000_000_000n,
   *   minimumTokenA: 9_500_000n,
   *   minimumTokenB: 9_500_000n
   * });
   *
   * const signature = await connection.sendTransaction(tx, [wallet]);
   */
  public async removeLiquidity(params: RemoveLiquidityParams): Promise<Transaction> {
    try {
      const { poolTokenAmount, minimumTokenA, minimumTokenB, payer, transaction } = params;

      if (poolTokenAmount <= 0n) throw SarosAMMError.ZeroAmount();
      if (minimumTokenA < 0n || minimumTokenB < 0n) throw SarosAMMError.InvalidSlippage();

      const tx = transaction || new Transaction();

      const { tokenAMint, tokenBMint, tokenA, tokenB, poolMint, poolFeeAccount } = this.pairAccount;

      const userTokenA = params.userTokenX || (await spl.getAssociatedTokenAddress(tokenAMint, payer, true));
      const userTokenB = params.userTokenY || (await spl.getAssociatedTokenAddress(tokenBMint, payer, true));
      const userLpToken = params.userLpToken || (await spl.getAssociatedTokenAddress(poolMint, payer, true));

      const withdrawIx = await this.ammProgram.methods
        .withdrawAllTokenTypes(
          new BN(poolTokenAmount.toString()),
          new BN(minimumTokenA.toString()),
          new BN(minimumTokenB.toString())
        )
        .accountsPartial({
          swapInfo: this.pairAddress,
          authorityInfo: this.poolAuthority,
          userTransferAuthorityInfo: payer,
          poolMintInfo: poolMint,
          sourceInfo: userLpToken,
          tokenAInfo: tokenA,
          tokenBInfo: tokenB,
          destTokenAInfo: userTokenA,
          destTokenBInfo: userTokenB,
          poolFeeAccountInfo: poolFeeAccount,
          tokenProgramInfo: spl.TOKEN_PROGRAM_ID,
        })
        .instruction();

      tx.add(withdrawIx);
      return tx;
    } catch (error) {
      SarosAMMError.handleError(error, SarosAMMError.RemoveLiquidityFailed());
    }
  }

  // -----------------------------------------------------------------------------
  // Private helpers
  // -----------------------------------------------------------------------------
  private async buildPairMetadata(): Promise<PairMetadata> {
    const { tokenAMint, tokenBMint, tokenA, tokenB, poolMint, poolFeeAccount, fees, swapCurve } = this.pairAccount;

    // Fetch token account data for reserves
    const [tokenAInfo, tokenBInfo] = await Promise.all([
      this.connection.getAccountInfo(tokenA),
      this.connection.getAccountInfo(tokenB),
    ]);

    const tokenAData = tokenAInfo ? spl.AccountLayout.decode(tokenAInfo.data) : null;
    const tokenBData = tokenBInfo ? spl.AccountLayout.decode(tokenBInfo.data) : null;

    // Fetch mint info for decimals
    const [mintAInfo, mintBInfo, poolMintInfo] = await Promise.all([
      spl.getMint(this.connection, tokenAMint),
      spl.getMint(this.connection, tokenBMint),
      spl.getMint(this.connection, poolMint),
    ]);

    const curveType = this.getCurveType(swapCurve);

    return {
      pair: this.pairAddress,
      tokenX: {
        mint: tokenAMint,
        decimals: mintAInfo.decimals,
        reserve: tokenAData ? BigInt(tokenAData.amount.toString()) : 0n,
      },
      tokenY: {
        mint: tokenBMint,
        decimals: mintBInfo.decimals,
        reserve: tokenBData ? BigInt(tokenBData.amount.toString()) : 0n,
      },
      lpToken: {
        mint: poolMint,
        decimals: poolMintInfo.decimals,
      },
      feeAccount: poolFeeAccount,
      curve: curveType,
      fees: this.calculateFeePercentages(fees),
    };
  }

  private getCurveType(curve: any): SwapCurveType {
    if ('constantProduct' in curve) return SwapCurveType.ConstantProduct;
    if ('constantPrice' in curve) return SwapCurveType.ConstantPrice;
    if ('stable' in curve) return SwapCurveType.Stable;
    if ('offset' in curve) return SwapCurveType.Offset;
    return SwapCurveType.ConstantProduct;
  }

  private calculateFeePercentages(fees: any): FeeMetadata {
    // Helper to calculate fee percentage, returns 0 if denominator is 0
    const calcFee = (numerator: BN, denominator: BN): number => {
      const denom = Number(denominator);
      return denom === 0 ? 0 : (Number(numerator) / denom) * 100;
    };

    return {
      tradeFee: calcFee(fees.tradeFeeNumerator, fees.tradeFeeDenominator),
      ownerTradeFee: calcFee(fees.ownerTradeFeeNumerator, fees.ownerTradeFeeDenominator),
      ownerWithdrawFee: calcFee(fees.ownerWithdrawFeeNumerator, fees.ownerWithdrawFeeDenominator),
      hostFee: calcFee(fees.hostFeeNumerator, fees.hostFeeDenominator),
    };
  }
}
