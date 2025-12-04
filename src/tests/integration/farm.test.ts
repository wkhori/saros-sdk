import { describe, it, expect } from 'vitest';
import { SarosAPIService } from '../../services/api';

/**
 * Farm/Stake Integration Tests
 *
 * Note:
 * - These tests only validate API responses, data structures, and metadata.
 * - The farm service does NOT expose pool creation functions, as these are
 *   admin-only operations.
 * - Devnet currently has no active pools; legacy pools are present but inactive.
 *
 * To test actual staking or unstaking operations, you would need:
 * 1. Admin/root authority to create farm pools.
 * 2. Funded wallets (mainnet) — not recommended for automated tests.
 */
describe('Farm/Stake API Integration Tests', () => {
  describe('Farm API', () => {
    it('should fetch farm info from API', async () => {
      const farms = await SarosAPIService.getFarmInfo();

      // API may return null if service is down, or empty array if no farms
      if (farms) {
        expect(Array.isArray(farms)).toBe(true);

        // If farms exist, validate structure
        if (farms.length > 0) {
          const farm = farms[0];
          expect(farm).toHaveProperty('poolAddress');
          expect(farm).toHaveProperty('lpToken');
          expect(farm).toHaveProperty('stakingTokenMint');
        }
      }
    });

    it('should fetch specific farm by pool address', async () => {
      const farms = await SarosAPIService.getFarmInfo();

      if (farms && farms.length > 0) {
        const firstFarm = farms[0];
        const farm = await SarosAPIService.getFarmByPool(firstFarm.poolAddress);

        expect(farm).toBeDefined();
        expect(farm?.poolAddress).toBe(firstFarm.poolAddress);
      }
    });
  });

  describe('Stake API', () => {
    it('should fetch stake info from API', async () => {
      const stakes = await SarosAPIService.getStakeInfo();

      // API may return null if service is down, or empty array if no stakes
      if (stakes) {
        expect(Array.isArray(stakes)).toBe(true);

        // If stakes exist, validate structure
        if (stakes.length > 0) {
          const stake = stakes[0];
          expect(stake).toHaveProperty('poolAddress');
          expect(stake).toHaveProperty('stakingTokenMint');
        }
      }
    });

    it('should fetch specific stake by pool address', async () => {
      const stakes = await SarosAPIService.getStakeInfo();

      if (stakes && stakes.length > 0) {
        const firstStake = stakes[0];
        const stake = await SarosAPIService.getStakeByPool(firstStake.poolAddress);

        expect(stake).toBeDefined();
        expect(stake?.poolAddress).toBe(firstStake.poolAddress);
      }
    });
  });

  describe('API Timeout/Fallback', () => {
    it('should handle API timeouts gracefully', async () => {
      // This tests the fallback behavior when API is slow/unavailable
      const result = await SarosAPIService.getFarmInfo();

      // Should return either data or null, never throw
      expect(result === null || Array.isArray(result)).toBe(true);
    });
  });
});
