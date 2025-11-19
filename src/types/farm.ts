import { PublicKey } from '@solana/web3.js';
import type { BN } from '@coral-xyz/anchor';

// On-chain account structures (shared by Farm and Stake)
export interface PoolAccount {
  nonce: number;
  authorityNonce: number;
  stakingTokenMint: PublicKey;
  stakingTokenAccount: PublicKey;
  state: PoolState;
}

export interface PoolRewardAccount {
  nonce: number;
  authorityNonce: number;
  rewardTokenMint: PublicKey;
  rewardTokenAccount: PublicKey;
  rewardPerBlock: BN;
  rewardEndBlock: BN;
  totalShares: BN;
  accumulatedRewardPerShare: BN;
  lastUpdatedBlock: BN;
  totalClaimed: BN;
  state: PoolState;
}

export interface UserPoolAccount {
  nonce: number;
  amount: BN;
  totalStaked: BN;
}

export interface UserPoolRewardAccount {
  nonce: number;
  amount: BN;
  rewardDebt: BN;
  rewardPending: BN;
}

export type PoolState = { paused: {} } | { unpaused: {} };

// Token and LP info
export interface FarmTokenInfo {
  mint: PublicKey;
  decimals: number;
  balance?: bigint;
}

export interface LPInfo {
  mint: PublicKey;
  supply: bigint;
  decimals: number;
  token0: FarmTokenInfo;
  token1: FarmTokenInfo;
}

export interface RewardInfo {
  poolRewardAddress: PublicKey;
  rewardTokenMint: PublicKey;
  rewardTokenAccount: PublicKey;
  rewardPerBlock: bigint;
  rewardEndBlock: bigint;
  totalShares: bigint;
  accumulatedRewardPerShare: bigint;
  lastUpdatedBlock: bigint;
  totalClaimed: bigint;
  apr?: number;
}

// Base pool metadata (shared structure)
export interface BasePoolMetadata {
  poolAddress: PublicKey;
  stakingToken: FarmTokenInfo;
  rewards: RewardInfo[];
  state: PoolState;
  startBlock?: number;
  endBlock?: number;
}

// Farm-specific metadata (includes LP and trading metrics)
export interface FarmPoolMetadata extends BasePoolMetadata {
  lpInfo: LPInfo;
  volume24h?: number;
  feeAPR?: number;
}

// Stake-specific metadata (single token, no LP/trading metrics)
export interface StakePoolMetadata extends BasePoolMetadata {}

// Operation params
export interface StakeParams {
  payer: PublicKey;
  amount: bigint;
  userStakingTokenAccount?: PublicKey;
}

export interface UnstakeParams {
  payer: PublicKey;
  amount: bigint;
  userStakingTokenAccount?: PublicKey;
}

export interface ClaimRewardParams {
  payer: PublicKey;
  poolRewardAddress: PublicKey;
  userRewardTokenAccount?: PublicKey;
}

// User position types
export interface UserRewardPosition {
  poolRewardAddress: PublicKey;
  userPoolRewardAddress: PublicKey;
  rewardTokenMint: PublicKey;
  amount: bigint;
  rewardDebt: bigint;
  rewardPending: bigint;
  pendingRewards?: bigint;
}

export interface UserPosition {
  userPoolAddress: PublicKey;
  stakedAmount: bigint;
  totalStaked: bigint;
  rewards: UserRewardPosition[];
}
