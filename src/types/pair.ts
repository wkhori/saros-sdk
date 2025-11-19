import { PublicKey } from '@solana/web3.js';
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
