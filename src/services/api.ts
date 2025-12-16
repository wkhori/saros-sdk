import type { SarosAPIFarmInfo, SarosAPIStakeInfo } from '../types/api';

/**
 * Thin client for Saros' public REST API (`api.saros.xyz`).
 * The response types are schema-coupled; if the API payload changes, update
 * `SarosAPIFarmInfo` / `SarosAPIStakeInfo`.
 */
const SAROS_API_BASE = 'https://api.saros.xyz/api/saros';

interface SarosAPIResponse<T> {
  status: number;
  success: boolean;
  data: T[];
}

/**
 * Saros API client with automatic fallback handling
 */
export class SarosAPIService {
  private static async fetchWithFallback<T>(url: string, timeoutMs: number = 5000): Promise<T[] | null> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
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
  static async getFarmInfo(page: number = 1, size: number = 100): Promise<SarosAPIFarmInfo[] | null> {
    const url = `${SAROS_API_BASE}/information?page=${page}&size=${size}&type=farm`;
    return this.fetchWithFallback<SarosAPIFarmInfo>(url);
  }

  /**
   * Fetch all stake information from Saros API
   * Returns null if API is unavailable
   */
  static async getStakeInfo(page: number = 1, size: number = 100): Promise<SarosAPIStakeInfo[] | null> {
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

    return farms.find((farm) => farm.poolAddress === poolAddress) || null;
  }

  /**
   * Fetch stake info for a specific pool address
   * Returns null if not found or API unavailable
   */
  static async getStakeByPool(poolAddress: string): Promise<SarosAPIStakeInfo | null> {
    const stakes = await this.getStakeInfo();
    if (!stakes) return null;

    return stakes.find((stake) => stake.poolAddress === poolAddress) || null;
  }
}
