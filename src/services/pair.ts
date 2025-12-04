import { BN } from '@coral-xyz/anchor';
import { Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
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
import { derivePoolAuthority } from '../utils/pda';
import { SarosAMMError } from '../utils/errors';
import { decodePairAccount } from '../utils/legacyAccountDecoder';
import { POOL_ACCOUNT_SIZE, MINT_ACCOUNT_SIZE, DEFAULT_FEES } from '../constants/config';

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
   * Create a new AMM liquidity pair
   *
   * @example
   * ```typescript
   * const pair = new SarosAMMPair({ mode: MODE.DEVNET, connection }, PublicKey.default);
   * const result = await pair.createPair({
   *   payer: wallet.publicKey,
   *   feeOwner: wallet.publicKey,
   *   tokenAMint: tokenA.mint,
   *   tokenBMint: tokenB.mint,
   *   initialTokenAAmount: 1_000_000_000n,
   *   initialTokenBAmount: 1_000_000n,
   *   curveType: SwapCurveType.ConstantProduct
   * });
   *
   * await connection.sendTransaction(result.transaction, [
   *   wallet,
   *   result.pairKeypair,
   *   result.lpMintKeypair
   * ]);
   * ```
   */
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

      // Generate pair account and LP mint keypairs from seeds
      const pairSeed = Keypair.generate();
      const [pairAuthority] = derivePoolAuthority(pairSeed.publicKey, this.ammProgram.programId);
      const authorityBytes = pairAuthority.toBytes();
      const lpMintKeypair = Keypair.fromSeed(authorityBytes.slice(0, 32));

      // Get or create token accounts for pool authority
      const poolTokenAAccount = spl.getAssociatedTokenAddressSync(tokenAMint, pairAuthority, true);
      const poolTokenBAccount = spl.getAssociatedTokenAddressSync(tokenBMint, pairAuthority, true);

      // Create associated token accounts if they don't exist
      const poolTokenAInfo = await this.connection.getAccountInfo(poolTokenAAccount);
      if (!poolTokenAInfo) {
        tx.add(
          spl.createAssociatedTokenAccountInstruction(payer, poolTokenAAccount, pairAuthority, tokenAMint)
        );
      }

      const poolTokenBInfo = await this.connection.getAccountInfo(poolTokenBAccount);
      if (!poolTokenBInfo) {
        tx.add(
          spl.createAssociatedTokenAccountInstruction(payer, poolTokenBAccount, pairAuthority, tokenBMint)
        );
      }

      // User's token accounts
      const userTokenAAccount = spl.getAssociatedTokenAddressSync(tokenAMint, payer);
      const userTokenBAccount = spl.getAssociatedTokenAddressSync(tokenBMint, payer);

      // User's LP token account
      const userLpTokenAccount = spl.getAssociatedTokenAddressSync(lpMintKeypair.publicKey, payer);
      const userLpInfo = await this.connection.getAccountInfo(userLpTokenAccount);
      if (!userLpInfo) {
        tx.add(
          spl.createAssociatedTokenAccountInstruction(payer, userLpTokenAccount, payer, lpMintKeypair.publicKey)
        );
      }

      // Fee owner's LP token account
      const feeLpTokenAccount = spl.getAssociatedTokenAddressSync(lpMintKeypair.publicKey, feeOwner);
      if (!payer.equals(feeOwner)) {
        const feeLpInfo = await this.connection.getAccountInfo(feeLpTokenAccount);
        if (!feeLpInfo) {
          tx.add(
            spl.createAssociatedTokenAccountInstruction(payer, feeLpTokenAccount, feeOwner, lpMintKeypair.publicKey)
          );
        }
      }

      // Transfer initial liquidity from user to pool
      tx.add(
        spl.createTransferInstruction(userTokenAAccount, poolTokenAAccount, payer, initialTokenAAmount)
      );
      tx.add(
        spl.createTransferInstruction(userTokenBAccount, poolTokenBAccount, payer, initialTokenBAmount)
      );

      // Create LP mint account
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

      // Initialize LP mint
      tx.add(
        spl.createInitializeMint2Instruction(lpMintKeypair.publicKey, 9, pairAuthority, null, spl.TOKEN_PROGRAM_ID)
      );

      // Create pair account
      const pairRent = await this.connection.getMinimumBalanceForRentExemption(POOL_ACCOUNT_SIZE);
      tx.add(
        SystemProgram.createAccount({
          fromPubkey: payer,
          newAccountPubkey: pairSeed.publicKey,
          lamports: pairRent,
          space: POOL_ACCOUNT_SIZE,
          programId: this.ammProgram.programId,
        })
      );

      // Encode curve type
      let curveData: any;
      switch (curveType) {
        case SwapCurveType.ConstantProduct:
          curveData = { constantProduct: {} };
          break;
        case SwapCurveType.ConstantPrice:
          curveData = { constantPrice: {} };
          break;
        case SwapCurveType.Stable:
          curveData = { stable: {} };
          break;
        case SwapCurveType.Offset:
          curveData = { offset: {} };
          break;
        default:
          curveData = { constantProduct: {} };
      }

      // Initialize pair instruction
      const initIx = await this.ammProgram.methods
        .initialize(
          {
            tradeFeeNumerator: new BN(DEFAULT_FEES.tradingFeeNumerator.toString()),
            tradeFeeDenominator: new BN(DEFAULT_FEES.tradeFeeDenominator.toString()),
            ownerTradeFeeNumerator: new BN(DEFAULT_FEES.ownerTradingFeeNumerator.toString()),
            ownerTradeFeeDenominator: new BN(DEFAULT_FEES.ownerTradingFeeDenominator.toString()),
            ownerWithdrawFeeNumerator: new BN(DEFAULT_FEES.ownerWithdrawFeeNumerator.toString()),
            ownerWithdrawFeeDenominator: new BN(DEFAULT_FEES.ownerWithdrawFeeDenominator.toString()),
            hostFeeNumerator: new BN(DEFAULT_FEES.hostFeeNumerator.toString()),
            hostFeeDenominator: new BN(DEFAULT_FEES.hostFeeDenominator.toString()),
          },
          curveData,
          Array.from(curveParameters)
        )
        .accountsPartial({
          swapInfo: pairSeed.publicKey,
          authorityInfo: pairAuthority,
          tokenAInfo: poolTokenAAccount,
          tokenBInfo: poolTokenBAccount,
          poolMintInfo: lpMintKeypair.publicKey,
          feeAccountInfo: feeLpTokenAccount,
          destinationInfo: userLpTokenAccount,
          tokenProgramInfo: spl.TOKEN_PROGRAM_ID,
        })
        .instruction();

      tx.add(initIx);

      return {
        transaction: tx,
        pairKeypair: pairSeed,
        lpMintKeypair,
        pairAddress: pairSeed.publicKey,
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
