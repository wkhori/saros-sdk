import { PublicKey } from '@solana/web3.js';

// On-chain account structures (shared by Farm and Stake)
export interface PoolAccount {
  nonce: number;
  authorityNonce: number;
  stakingTokenMint: PublicKey;
  stakingTokenAccount: PublicKey;
  state: PoolState;
}

export type PoolState = { paused: {} } | { unpaused: {} };

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
