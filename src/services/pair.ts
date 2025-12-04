import { BN } from '@coral-xyz/anchor';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
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
  CreatePairParams,
  CreatePairResult,
} from '../types';
import { calculateSwapOutput, calculatePriceImpact, getMinOutputWithSlippage } from '../utils/calculations';
import { derivePoolAuthority, derivePoolSeed, lpMintFromAuthority, poolKeypairFromSeed } from '../utils/pda';
import { SarosAMMError } from '../utils/errors';
import { decodePairAccount, encodeCurveType } from '../utils/legacyAccountDecoder';
import { POOL_ACCOUNT_SIZE, MINT_ACCOUNT_SIZE, DEFAULT_FEES } from '../constants/config';
import { createInitSwapInstruction } from '../utils/legacyInstructions';

export class SarosAMMPair extends SarosBaseService {
  private pairAddress: PublicKey;
  private pairAccount!: AMMPairAccount;
  private metadata!: PairMetadata;

  private poolAuthority?: PublicKey;

  constructor(config: SarosAMMConfig, pairAddress: PublicKey) {
    super(config);
    this.pairAddress = pairAddress;
  }

  public async createPair(params: CreatePairParams): Promise<CreatePairResult> {
    const {
      payer,
      feeOwner,
      tokenAMint,
      tokenBMint,
      initialTokenAAmount,
      initialTokenBAmount,
      curveType,
      curveParameters = Buffer.alloc(32),
    } = params;

    if (initialTokenAAmount <= 0n) throw SarosAMMError.ZeroAmount();
    if (initialTokenBAmount <= 0n) throw SarosAMMError.ZeroAmount();

    try {
      const tx = new Transaction();

      // -----------------------------------------
      // 1. POOL SEED => POOL KEYPAIR
      // -----------------------------------------
      const [poolSeedPda] = derivePoolSeed(this.ammProgram.programId);

      const pairKeypair = poolKeypairFromSeed(poolSeedPda);

      // -----------------------------------------
      // 2. POOL AUTHORITY PDA
      // -----------------------------------------
      const [pairAuthority] = derivePoolAuthority(pairKeypair.publicKey, this.ammProgram.programId);

      // -----------------------------------------
      // 3. LP MINT = seeded keypair
      // -----------------------------------------
      const lpMintKeypair = lpMintFromAuthority(pairAuthority);

      const mintRent = await this.connection.getMinimumBalanceForRentExemption(MINT_ACCOUNT_SIZE);

      tx.add(
        SystemProgram.createAccount({
          fromPubkey: payer,
          newAccountPubkey: lpMintKeypair.publicKey,
          lamports: mintRent,
          space: MINT_ACCOUNT_SIZE,
          programId: spl.TOKEN_PROGRAM_ID,
        })
      );

      tx.add(
        spl.createInitializeMint2Instruction(lpMintKeypair.publicKey, 9, pairAuthority, null, spl.TOKEN_PROGRAM_ID)
      );

      // -----------------------------------------
      // 4. Pool token A/B accounts (ATAs)
      // -----------------------------------------
      const poolTokenAAccount = spl.getAssociatedTokenAddressSync(tokenAMint, pairAuthority, true);

      const poolTokenBAccount = spl.getAssociatedTokenAddressSync(tokenBMint, pairAuthority, true);

      if (!(await this.connection.getAccountInfo(poolTokenAAccount))) {
        tx.add(spl.createAssociatedTokenAccountInstruction(payer, poolTokenAAccount, pairAuthority, tokenAMint));
      }

      if (!(await this.connection.getAccountInfo(poolTokenBAccount))) {
        tx.add(spl.createAssociatedTokenAccountInstruction(payer, poolTokenBAccount, pairAuthority, tokenBMint));
      }

      // -----------------------------------------
      // 5. User LP ATA
      // -----------------------------------------
      const userLpTokenAccount = spl.getAssociatedTokenAddressSync(lpMintKeypair.publicKey, payer);

      if (!(await this.connection.getAccountInfo(userLpTokenAccount))) {
        tx.add(spl.createAssociatedTokenAccountInstruction(payer, userLpTokenAccount, payer, lpMintKeypair.publicKey));
      }

      // Fee-owner LP ATA
      const feeLpTokenAccount = spl.getAssociatedTokenAddressSync(lpMintKeypair.publicKey, feeOwner);

      if (!feeOwner.equals(payer)) {
        if (!(await this.connection.getAccountInfo(feeLpTokenAccount))) {
          tx.add(
            spl.createAssociatedTokenAccountInstruction(payer, feeLpTokenAccount, feeOwner, lpMintKeypair.publicKey)
          );
        }
      }

      // -----------------------------------------
      // 6. Transfer initial liquidity
      // -----------------------------------------
      const userTokenA = spl.getAssociatedTokenAddressSync(tokenAMint, payer);
      const userTokenB = spl.getAssociatedTokenAddressSync(tokenBMint, payer);

      tx.add(spl.createTransferInstruction(userTokenA, poolTokenAAccount, payer, initialTokenAAmount));

      tx.add(spl.createTransferInstruction(userTokenB, poolTokenBAccount, payer, initialTokenBAmount));

      // -----------------------------------------
      // 7. Create pool account
      // -----------------------------------------
      const pairRent = await this.connection.getMinimumBalanceForRentExemption(POOL_ACCOUNT_SIZE);

      tx.add(
        SystemProgram.createAccount({
          fromPubkey: payer,
          newAccountPubkey: pairKeypair.publicKey,
          lamports: pairRent,
          space: POOL_ACCOUNT_SIZE,
          programId: this.ammProgram.programId,
        })
      );
      // -----------------------------------------
      // 8. Initialize pool (legacy instruction)
      // -----------------------------------------

      const curveData = encodeCurveType(curveType);

      tx.add(
        createInitSwapInstruction({
          swapAccount: pairKeypair.publicKey,
          authority: pairAuthority,
          tokenA: poolTokenAAccount,
          tokenB: poolTokenBAccount,
          poolMint: lpMintKeypair.publicKey,
          feeAccount: feeLpTokenAccount,
          destination: userLpTokenAccount,
          tokenProgram: spl.TOKEN_PROGRAM_ID,
          programId: this.ammProgram.programId,
          fees: DEFAULT_FEES,
          curveType: curveData,
          curveParameters,
        })
      );

      return {
        transaction: tx,
        pairKeypair,
        lpMintKeypair,
        pairAddress: pairKeypair.publicKey,
        lpTokenMint: lpMintKeypair.publicKey,
        pairAuthority,
      };
    } catch (error) {
      SarosAMMError.handleError(error, SarosAMMError.PairCreationFailed());
    }
  }

  /** Get pair metadata */
  public getPairMetadata(): PairMetadata {
    return this.metadata;
  }

  /** Get pair account data */
  public getPairAccount(): AMMPairAccount {
    return this.pairAccount;
  }

  /** Get pair address */
  public getPairAddress(): PublicKey {
    return this.pairAddress;
  }

  /** Refresh pair state data (reserves, fees, etc.) */
  public async refreshState(): Promise<void> {
    try {
      // For legacy Anchor programs without discriminators
      const accountInfo = await this.connection.getAccountInfo(this.pairAddress);

      if (!accountInfo) {
        throw SarosAMMError.PairNotInitialized();
      }

      // Manually decode using custom Borsh layout for legacy programs
      // The Saros AMM program doesn't use Anchor discriminators
      this.pairAccount = decodePairAccount(accountInfo.data);

      if (!this.pairAccount || !this.pairAccount.isInitialized) {
        throw SarosAMMError.PairNotInitialized();
      }

      // Derive pool authority
      const [authority] = derivePoolAuthority(this.pairAddress, this.ammProgram.programId);
      this.poolAuthority = authority;

      this.metadata = await this.buildPairMetadata();
    } catch (error) {
      console.error('Error refreshing pair state:', error);
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
    const [mintAInfo, mintBInfo] = await Promise.all([
      spl.getMint(this.connection, tokenAMint),
      spl.getMint(this.connection, tokenBMint),
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
        decimals: 9, // LP tokens typically have 9 decimals
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
