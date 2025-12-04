import BN from "bn.js";
import { PublicKey } from '@solana/web3.js';

/**
 * Supported network modes (devnet, mainnet)
 */
export enum MODE {
  DEVNET = 'devnet',
  MAINNET = 'mainnet',
}

/**
 * AMM Program IDs across networks
 *
 * Note: Devnet version does not include pool metadata feature
 * (SSStkgZHW17LRbGUFSDQqzZ4jMXpfmVxHDbWwMaFEXE)
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

// Sizes for accounts
export const MINT_ACCOUNT_SIZE = 82; // standard SPL mint
export const POOL_ACCOUNT_SIZE = 324; // legacy Saros pool account size

// Default fees for AMM pairs
// 4 basis points = 0.04%
// 0.02% to LPs, 0.02% to Saros
export const DEFAULT_FEES = {
  tradeFeeNumerator: new BN(2),
  tradeFeeDenominator: new BN(10000),

  ownerTradeFeeNumerator: new BN(2),
  ownerTradeFeeDenominator: new BN(10000),

  ownerWithdrawFeeNumerator: new BN(0),
  ownerWithdrawFeeDenominator: new BN(1),

  hostFeeNumerator: new BN(20),
  hostFeeDenominator: new BN(100),
};
