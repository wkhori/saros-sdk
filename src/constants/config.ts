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
 * (SSStkgZHW17LRGbGUFSDQqzZ4jMXpfmVxHDbWwMaFEXE)
 */
export const AMM_PROGRAM_IDS: Record<MODE, PublicKey> = {
  [MODE.MAINNET]: new PublicKey('SSwapUtytfBdBn1b9NUGG6foMVPtcWgpRU32HToDUZr'),
  [MODE.DEVNET]: new PublicKey('SSStkgZHW17LRGbGUFSDQqzZ4jMXpfmVxHDbWwMaFEXE'),
};

/**
 * Farm Program IDs across networks
 * LP token farming and single token staking
 */
export const FARM_PROGRAM_IDS: Record<MODE, PublicKey> = {
  [MODE.MAINNET]: new PublicKey('FARMr8rFJohG2CXFWKKmj8Z3XAhZNdYZ5CE3TKeWpump'),
  [MODE.DEVNET]: new PublicKey('SFFxHvYKTBgC7XYEZDua6m28NZo9fNnDRCEtM7AHR4m'),
};
