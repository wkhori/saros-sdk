/**
 * Saros public API response types (`api.saros.xyz`).
 *
 * These types are schema-coupled and may change if the API payload changes.
 * Prefer treating them as "best effort" shapes for convenience
 */

export interface SarosAPIFarmInfo {
  isAmountBase: boolean;
  volume24h: number;
  feeAPR: number;
  rewards: Array<{
    poolRewardAddress: string;
    rewardTokenMint: string;
    rewardPerBlock: string;
    rewardTokenAccount: string;
    rewardEndBlock: string;
    totalShares: string;
    accumulatedRewardPerShare: string;
    lastUpdatedBlock: string;
    authorityAddress: string;
  }>;
  dataPoolInfo: {
    mint: string;
    owner: string;
    amount: string;
  };
  poolAddress: string;
  poolLpAddress?: string;
  startBlock: number;
  endBlock: number;
  lpInfo?: {
    address: string;
    supply: string;
    decimals: number;
    mintAuthority: string;
  };
  infoPoolLiquidity?: {
    lpTokenMint: string;
    token0Mint: string;
    token0Account: {
      mint: string;
      owner: string;
      amount: string;
      address: string;
    };
    token1Mint: string;
    token1Account: {
      mint: string;
      owner: string;
      amount: string;
      address: string;
    };
  };
}

export interface SarosAPIStakeInfo {
  isAmountBase: boolean;
  volume24h: number;
  feeAPR: number;
  rewards: Array<{
    poolRewardAddress: string;
    rewardTokenMint: string;
    rewardPerBlock: string;
    rewardTokenAccount: string;
    rewardEndBlock: string;
    totalShares: string;
    accumulatedRewardPerShare: string;
    lastUpdatedBlock: string;
    authorityAddress: string;
  }>;
  dataPoolInfo: {
    mint: string;
    owner: string;
    amount: string;
  };
  poolAddress: string;
  startBlock: number;
  endBlock: number;
}

