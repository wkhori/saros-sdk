import { Keypair, PublicKey, Transaction } from '@solana/web3.js';
import type { BN } from '@coral-xyz/anchor';

/**
 * AMM Pair account structure
 */
export interface AMMPairAccount {
  version: number;
  isInitialized: boolean;
  bumpSeed: number;
  tokenProgramId: PublicKey;
  tokenA: PublicKey;
  tokenB: PublicKey;
  poolMint: PublicKey;
  tokenAMint: PublicKey;
  tokenBMint: PublicKey;
  poolFeeAccount: PublicKey;
  fees: Fees;
  swapCurve: SwapCurve;
}

/**
 * Fee structure for AMM pair
 */
export interface Fees {
  tradeFeeNumerator: BN;
  tradeFeeDenominator: BN;
  ownerTradeFeeNumerator: BN;
  ownerTradeFeeDenominator: BN;
  ownerWithdrawFeeNumerator: BN;
  ownerWithdrawFeeDenominator: BN;
  hostFeeNumerator: BN;
  hostFeeDenominator: BN;
}

/**
 * Swap curve types
 */
export enum SwapCurveType {
  ConstantProduct = 'ConstantProduct',
  ConstantPrice = 'ConstantPrice',
  Stable = 'Stable',
  Offset = 'Offset',
}

export type SwapCurve = { constantProduct: {} } | { constantPrice: {} } | { stable: {} } | { offset: {} };

/**
 * Pair metadata (includes current state + derived data)
 */
export interface PairMetadata {
  pair: PublicKey;
  tokenX: TokenInfo;
  tokenY: TokenInfo;
  lpToken: TokenInfo;
  feeAccount: PublicKey;
  curve: SwapCurveType;
  fees: FeeMetadata;
}

export interface TokenInfo {
  mint: PublicKey;
  decimals: number;
  reserve?: bigint;
}

export interface FeeMetadata {
  tradeFee: number; // percentage
  ownerTradeFee: number;
  ownerWithdrawFee: number;
  hostFee: number;
}

/**
 * Parameters for creating a new AMM pair
 */
export interface CreatePairParams {
  /** Payer and initial liquidity provider */
  payer: PublicKey;
  /** Fee recipient address */
  feeOwner: PublicKey;
  /** Token A mint address */
  tokenAMint: PublicKey;
  /** Token B mint address */
  tokenBMint: PublicKey;
  /** Initial amount of token A to deposit */
  initialTokenAAmount: bigint;
  /** Initial amount of token B to deposit */
  initialTokenBAmount: bigint;
  /** Swap curve type (ConstantProduct, Stable, etc.) */
  curveType: SwapCurveType;
  /** Optional curve parameters (32 bytes) */
  curveParameters?: Buffer;
}

/**
 * Result from pair creation
 */
export interface CreatePairResult {
  /** Transaction to create the pair */
  transaction: Transaction;
  /** Pair account keypair (signer required) */
  pairKeypair: Keypair;
  /** LP token mint keypair (signer required) */
  lpMintKeypair: Keypair;
  /** Pool token A ATA address (derived from pool authority) */
  poolTokenA: PublicKey;
  /** Pool token B ATA address (derived from pool authority) */
  poolTokenB: PublicKey;
  /** Fee account ATA address (LP mint ATA owned by feeOwner) */
  feeAccount: PublicKey;
  /** Pair address */
  pairAddress: PublicKey;
  /** LP token mint address */
  lpTokenMint: PublicKey;
  /** Pair authority PDA */
  pairAuthority: PublicKey;
  /** Signers required for the transaction */
  signers: Keypair[];
}

/**
 * Parameters for adding liquidity to a pool
 */
export interface AddLiquidityParams {
  /** Payer and liquidity provider */
  payer: PublicKey;
  /** Desired amount of LP tokens to receive */
  poolTokenAmount: bigint;
  /** Maximum amount of token A willing to deposit (slippage protection) */
  maximumTokenA: bigint;
  /** Maximum amount of token B willing to deposit (slippage protection) */
  maximumTokenB: bigint;
  /** Optional: User's token A account (defaults to ATA) */
  userTokenX?: PublicKey;
  /** Optional: User's token B account (defaults to ATA) */
  userTokenY?: PublicKey;
  /** Optional: User's LP token account (defaults to ATA) */
  userLpToken?: PublicKey;
  /** Optional: existing transaction to append to */
  transaction?: Transaction;
}

/**
 * Parameters for removing liquidity from a pool
 */
export interface RemoveLiquidityParams {
  /** Payer and liquidity provider */
  payer: PublicKey;
  /** Amount of LP tokens to burn */
  poolTokenAmount: bigint;
  /** Minimum amount of token A to receive (slippage protection) */
  minimumTokenA: bigint;
  /** Minimum amount of token B to receive (slippage protection) */
  minimumTokenB: bigint;
  /** Optional: User's token A account (defaults to ATA) */
  userTokenX?: PublicKey;
  /** Optional: User's token B account (defaults to ATA) */
  userTokenY?: PublicKey;
  /** Optional: User's LP token account (defaults to ATA) */
  userLpToken?: PublicKey;
  /** Optional: existing transaction to append to */
  transaction?: Transaction;
}
