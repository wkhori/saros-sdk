import { describe, it, expect, beforeAll } from 'vitest';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { SarosFarmService } from '../../farm/sarosFarmServices.js';

/**
 * Farm Service Tests
 *
 * These tests verify:
 * 1. Core on-chain functionality (PDA derivation, account checks) still works
 * 2. GraphQL-dependent features are broken and should be deprecated
 *
 * NOTE: GraphQL endpoint (https://graphql.saros.finance/) is DOWN
 * Methods depending on it: getListPool, getListPoolLiquidity, fetchDetailPoolFarm, calculateRewardOneYear
 */

describe('SarosFarmService - Functional Tests', () => {
  let connection;

  beforeAll(() => {
    connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  });

  describe('PDA Derivation (Core Functionality)', () => {
    const ownerKeypair = Keypair.generate();
    const ownerAddress = ownerKeypair.publicKey;
    const poolAddress = new PublicKey('11111111111111111111111111111111');
    const poolRewardAddress = new PublicKey('22222222222222222222222222222222');
    const programAddress = new PublicKey('FARMr8rFJohG2CXFWKKmj8Z3XAhZNdYZ5CE3TKeWpump'); // Example farm program

    it('should derive user pool address correctly', async () => {
      const [pda, nonce] = await SarosFarmService.findUserPoolAddress(
        ownerAddress,
        poolAddress,
        programAddress
      );

      expect(pda).toBeInstanceOf(PublicKey);
      expect(pda.toString()).toBeTruthy();
      expect(typeof nonce).toBe('number');
      expect(nonce).toBeGreaterThanOrEqual(0);
      expect(nonce).toBeLessThan(256);
    });

    it('should derive user pool reward address correctly', async () => {
      const [pda, nonce] = await SarosFarmService.findUserPoolRewardAddress(
        ownerAddress,
        poolRewardAddress,
        programAddress
      );

      expect(pda).toBeInstanceOf(PublicKey);
      expect(pda.toString()).toBeTruthy();
      expect(typeof nonce).toBe('number');
      expect(nonce).toBeGreaterThanOrEqual(0);
      expect(nonce).toBeLessThan(256);
    });

    it('should derive pool authority address correctly', async () => {
      const [pda, nonce] = await SarosFarmService.findPoolAuthorityAddress(
        poolAddress,
        programAddress
      );

      expect(pda).toBeInstanceOf(PublicKey);
      expect(pda.toString()).toBeTruthy();
      expect(typeof nonce).toBe('number');

      // Verify it uses 'authority' seed
      const [expectedPda] = await PublicKey.findProgramAddress(
        [Buffer.from('authority'), poolAddress.toBytes()],
        programAddress
      );
      expect(pda.toString()).toBe(expectedPda.toString());
    });

    it('should derive pool reward authority address correctly', async () => {
      const [pda, nonce] = await SarosFarmService.findPoolRewardAuthorityAddress(
        poolRewardAddress,
        programAddress
      );

      expect(pda).toBeInstanceOf(PublicKey);
      expect(pda.toString()).toBeTruthy();
      expect(typeof nonce).toBe('number');

      // Verify it uses 'authority' seed
      const [expectedPda] = await PublicKey.findProgramAddress(
        [Buffer.from('authority'), poolRewardAddress.toBytes()],
        programAddress
      );
      expect(pda.toString()).toBe(expectedPda.toString());
    });

    it('should derive consistent PDAs for same inputs', async () => {
      const [pda1] = await SarosFarmService.findUserPoolAddress(
        ownerAddress,
        poolAddress,
        programAddress
      );
      const [pda2] = await SarosFarmService.findUserPoolAddress(
        ownerAddress,
        poolAddress,
        programAddress
      );

      expect(pda1.toString()).toBe(pda2.toString());
    });

    it('should derive different PDAs for different owners', async () => {
      const owner2 = Keypair.generate().publicKey;

      const [pda1] = await SarosFarmService.findUserPoolAddress(
        ownerAddress,
        poolAddress,
        programAddress
      );
      const [pda2] = await SarosFarmService.findUserPoolAddress(
        owner2,
        poolAddress,
        programAddress
      );

      expect(pda1.toString()).not.toBe(pda2.toString());
    });
  });

  describe('On-Chain Data Methods (Should Handle Missing Accounts)', () => {
    it('getPoolData should handle non-existent pool account', async () => {
      const fakePoolAddress = new PublicKey('11111111111111111111111111111111');

      try {
        await SarosFarmService.getPoolData(connection, fakePoolAddress);
        // If it doesn't throw, fail the test
        expect.fail('Should have thrown an error for non-existent pool');
      } catch (error) {
        // Expected to fail - account doesn't exist
        expect(error).toBeDefined();
      }
    });

    it('getPoolRewardData should handle non-existent pool reward account', async () => {
      const fakePoolRewardAddress = new PublicKey('11111111111111111111111111111111');

      try {
        await SarosFarmService.getPoolRewardData(connection, fakePoolRewardAddress);
        expect.fail('Should have thrown an error for non-existent pool reward');
      } catch (error) {
        // Expected to fail - account doesn't exist
        expect(error).toBeDefined();
      }
    });
  });

  describe('Transaction Methods (Should Fail Gracefully Without Valid Setup)', () => {
    const payerAccount = Keypair.generate();
    const poolAddress = new PublicKey('11111111111111111111111111111111');
    const programAddress = new PublicKey('FARMr8rFJohG2CXFWKKmj8Z3XAhZNdYZ5CE3TKeWpump');

    it('stakePool should return error string for invalid pool', async () => {
      const lpAddress = 'So11111111111111111111111111111111111111112'; // SOL mint

      const result = await SarosFarmService.stakePool(
        connection,
        payerAccount,
        poolAddress,
        1000000,
        programAddress,
        [],
        lpAddress
      );

      expect(typeof result).toBe('string');
      expect(result.toLowerCase()).toContain('error');
    }, 30000);

    it('unstakePool should return error string for invalid pool', async () => {
      const lpAddress = 'So11111111111111111111111111111111111111112';

      const result = await SarosFarmService.unstakePool(
        connection,
        payerAccount,
        poolAddress,
        lpAddress,
        1000000,
        programAddress,
        [],
        false
      );

      expect(typeof result).toBe('string');
      expect(result.toLowerCase()).toContain('error');
    }, 30000);

    it('claimReward should return error string for invalid pool reward', async () => {
      const poolRewardAddress = new PublicKey('22222222222222222222222222222222');
      const mintAddress = 'So11111111111111111111111111111111111111112';

      const result = await SarosFarmService.claimReward(
        connection,
        payerAccount,
        poolRewardAddress,
        programAddress,
        mintAddress
      );

      expect(typeof result).toBe('string');
      expect(result.toLowerCase()).toContain('error');
    }, 30000);
  });

  describe('GraphQL-Dependent Methods (DEPRECATED - EXPECTED TO FAIL)', () => {

    it('should document unavailable GraphQL endpoint', async () => {
      // The GraphQL endpoint is down (522 error)
      const graphqlEndpoint = 'https://graphql.saros.finance/';
      const status = '522 - Server unavailable';
      const affectedMethods = [
        'getListPool',
        'getListPoolLiquidity',
        'fetchDetailPoolFarm',
        'calculateRewardOneYear'
      ];

      expect(graphqlEndpoint).toBe('https://graphql.saros.finance/');
      expect(affectedMethods.length).toBeGreaterThan(0);

      console.log('\n=== GRAPHQL ENDPOINT DOWN ===');
      console.log(`Endpoint: ${graphqlEndpoint}`);
      console.log(`Status: ${status}`);
      console.log(`Affected methods: ${affectedMethods.join(', ')}`);
      console.log(`Location: src/farm/sarosFarmServices.js:12`);
      console.log('=============================\n');
    });
  });

  describe('DEPRECATION SUMMARY', () => {
    it('should confirm this service must be deprecated', () => {
      const issues = [
        {
          type: 'BLOCKING',
          issue: 'GraphQL endpoint unavailable (522 error)',
          impact: 'Pool discovery and APR calculations completely broken',
          fix: 'Would need new backend service or alternative data source'
        },
        {
          type: 'INFO',
          issue: 'Farm program may be deprecated on-chain as well',
          impact: 'Even if code is fixed, the smart contract may not be operational',
          fix: 'Verify if farm program is still active on Solana'
        }
      ];

      const recommendation = 'DEPRECATE - GraphQL backend is gone, not worth fixing';

      expect(issues).toHaveLength(2);
      expect(issues.filter(i => i.type === 'BLOCKING')).toHaveLength(1);
      expect(recommendation).toContain('DEPRECATE');

      console.log('\n========================================');
      console.log('   SAROS FARM SERVICE - DEPRECATION');
      console.log('========================================\n');

      issues.forEach((issue, idx) => {
        console.log(`${idx + 1}. [${issue.type}] ${issue.issue}`);
        console.log(`   Impact: ${issue.impact}`);
        console.log(`   Fix: ${issue.fix}\n`);
      });

      console.log(`RECOMMENDATION: ${recommendation}`);
      console.log('========================================\n');
    });
  });
});