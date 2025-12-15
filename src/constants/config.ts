import BN from 'bn.js';
import { PublicKey } from '@solana/web3.js';
import { SwapCurveType } from '../types/pair';

/**
 * Supported network modes (devnet, mainnet)
 */
export enum MODE {
  DEVNET = 'devnet',
  MAINNET = 'mainnet',
}

/**
 * AMM Program IDs across networks
 * Note: Devnet version does not include latest pool metadata features.
 */
export const AMM_PROGRAM_IDS: Record<MODE, PublicKey> = {
  [MODE.MAINNET]: new PublicKey('SSwapUtytfBdBn1b9NUGG6foMVPtcWgpRU32HToDUZr'),
  [MODE.DEVNET]: new PublicKey('SSStkgZHW17LRbGUFSDQqzZ4jMXpfmVxHDbWwMaFEXE'),
};

/**
 * Farm Program IDs across networks
 * LP token farming and single token staking
 */
export const FARM_PROGRAM_IDS: Record<MODE, PublicKey> = {
  [MODE.MAINNET]: new PublicKey('FARMr8rFJohG2CXFWKKmj8Z3XAhZNdYZ5CE3TKeWpump'),
  [MODE.DEVNET]: new PublicKey('SFFxHvYKTBgC7XYEZDua6m28NZo9fNnDRCEtM7AHR4m'),
};

// Legacy Saros swap account size
export const SWAP_ACCOUNT_SIZE = 324;

// Default fees for AMM pairs
export const DEFAULT_FEES = {
  tradeFeeNumerator: new BN(0),
  tradeFeeDenominator: new BN(10000),

  ownerTradeFeeNumerator: new BN(30),
  ownerTradeFeeDenominator: new BN(10000),

  ownerWithdrawFeeNumerator: new BN(0),
  ownerWithdrawFeeDenominator: new BN(0),

  hostFeeNumerator: new BN(20),
  hostFeeDenominator: new BN(100),
};

/**
 * Anchor-compatible curve type encoding
 * Used by AMM initialize instruction
 */
export const CURVE_TYPE_MAP: Record<SwapCurveType, any> = {
  [SwapCurveType.ConstantProduct]: { constantProduct: {} },
  [SwapCurveType.ConstantPrice]: { constantPrice: {} },
  [SwapCurveType.Stable]: { stable: {} },
  [SwapCurveType.Offset]: { offset: {} },
};
// Default swap calculator (32 bytes of zero)
export const DEFAULT_SWAP_CALCULATOR = Array.from(new Uint8Array(32));
