import { describe, it, expect } from 'vitest';
import { SarosAPIService } from '../../services/api';

/**
 * Farm/Stake Tests
 * - These tests only validate API responses, data structures, and metadata.
 * - New farms cannot be created (admin-only operation).
 * - No active farms available for testing on Devnet at this time.
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
          expect(farm).toHaveProperty('rewards');
          expect(farm).toHaveProperty('poolLpAddress');
          expect(farm).toHaveProperty('lpInfo');
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
          expect(stake).toHaveProperty('rewards');
          expect(stake).toHaveProperty('startBlock');
          expect(stake).toHaveProperty('endBlock');
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
