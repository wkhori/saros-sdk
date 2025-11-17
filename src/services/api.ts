/**
 * Saros API Service
 *
 * Wraps the Saros REST API endpoints for farm and stake data.
 * Includes fallback handling for when the API is unavailable.
 *
 * ⚠️ WARNING: This service is tightly coupled to the Saros API schema.
 * Any changes to https://api.saros.xyz response structure will break this code.
 * Update SarosAPIFarmInfo and SarosAPIStakeInfo interfaces if the API changes.
 */

const SAROS_API_BASE = 'https://api.saros.xyz/api/saros';

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

interface SarosAPIResponse<T> {
  status: number;
  success: boolean;
  data: T[];
}

/**
 * Saros API client with automatic fallback handling
 */
export class SarosAPIService {
  private static async fetchWithFallback<T>(
    url: string,
    timeoutMs: number = 5000
  ): Promise<T[] | null> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeout);

      if (!response.ok) {
        console.warn(`Saros API returned ${response.status} for ${url}`);
        return null;
      }

      const json: SarosAPIResponse<T> = await response.json();

      if (!json.success || !Array.isArray(json.data)) {
        console.warn('Saros API returned invalid response format');
        return null;
      }

      return json.data;
    } catch (error) {
      // API is down or unreachable - fail silently and return null
      if (error instanceof Error) {
        console.warn(`Saros API unavailable: ${error.message}`);
      }
      return null;
    }
  }

  /**
   * Fetch all farm information from Saros API
   * Returns null if API is unavailable
   */
  static async getFarmInfo(
    page: number = 1,
    size: number = 100
  ): Promise<SarosAPIFarmInfo[] | null> {
    const url = `${SAROS_API_BASE}/information?page=${page}&size=${size}&type=farm`;
    return this.fetchWithFallback<SarosAPIFarmInfo>(url);
  }

  /**
   * Fetch all stake information from Saros API
   * Returns null if API is unavailable
   */
  static async getStakeInfo(
    page: number = 1,
    size: number = 100
  ): Promise<SarosAPIStakeInfo[] | null> {
    const url = `${SAROS_API_BASE}/information?page=${page}&size=${size}&type=stake`;
    return this.fetchWithFallback<SarosAPIStakeInfo>(url);
  }

  /**
   * Fetch farm info for a specific pool address
   * Returns null if not found or API unavailable
   */
  static async getFarmByPool(poolAddress: string): Promise<SarosAPIFarmInfo | null> {
    const farms = await this.getFarmInfo();
    if (!farms) return null;

    return farms.find(farm => farm.poolAddress === poolAddress) || null;
  }

  /**
   * Fetch stake info for a specific pool address
   * Returns null if not found or API unavailable
   */
  static async getStakeByPool(poolAddress: string): Promise<SarosAPIStakeInfo | null> {
    const stakes = await this.getStakeInfo();
    if (!stakes) return null;

    return stakes.find(stake => stake.poolAddress === poolAddress) || null;
  }
}
