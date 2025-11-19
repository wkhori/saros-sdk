import { describe, it, expect, beforeAll } from 'vitest';
import { Connection, PublicKey } from '@solana/web3.js';
import { SarosAMMPair, MODE } from '../../index';

/**
 * Integration tests for SarosAMMPair
 *
 * These tests run against mainnet to verify the SDK works correctly.
 * We use a read-only connection and don't submit any transactions.
 *
 * Testing against: BONK-SAROS pool on mainnet
 */

// BONK-SAROS pool on mainnet
const TEST_POOL_ADDRESS = new PublicKey('HmQL6eECoaGLWvTxz6cWT3jEsPfjdin2vNVJ1xKiwjXz');

// Use mainnet for integration tests
// Configure RPC endpoints in .env.test file
const RPC_ENDPOINT = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com';

describe('SarosAMMPair Integration Tests', () => {
  let connection: Connection;
  let pair: SarosAMMPair;

  beforeAll(async () => {
    connection = new Connection(RPC_ENDPOINT, 'confirmed');
    pair = new SarosAMMPair({ mode: MODE.MAINNET, connection }, TEST_POOL_ADDRESS);

    console.log(`Testing against BONK-SAROS pool: ${TEST_POOL_ADDRESS.toBase58()}`);
  }, 10000);

  describe('Initialization', () => {
    it('should create a pair instance', () => {
      expect(pair).toBeDefined();
      expect(pair.getPairAddress()).toEqual(TEST_POOL_ADDRESS);
    });

    it('should have correct program ID from IDL', () => {
      const programId = pair.getDexProgramId();
      expect(programId.toBase58()).toBe('SSwapUtytfBdBn1b9NUGG6foMVPtcWgpRU32HToDUZr');
    });

    it('should return correct DEX name', () => {
      expect(pair.getDexName()).toBe('Saros AMM');
    });
  });

  describe('State Management', () => {
    it('should fetch and populate pair state', async () => {
      await pair.refreshState();

      const account = pair.getPairAccount();
      expect(account).toBeDefined();
      expect(account.isInitialized).toBe(true);
      expect(account.tokenAMint).toBeInstanceOf(PublicKey);
      expect(account.tokenBMint).toBeInstanceOf(PublicKey);
      expect(account.poolMint).toBeInstanceOf(PublicKey);

      console.log('Pool info:');
      console.log('  Token A:', account.tokenAMint.toBase58());
      console.log('  Token B:', account.tokenBMint.toBase58());
      console.log('  LP Token:', account.poolMint.toBase58());
    }, 15000);

    it('should build pair metadata with reserves', async () => {
      await pair.refreshState();

      const metadata = pair.getPairMetadata();
      expect(metadata).toBeDefined();
      expect(metadata.pair).toEqual(TEST_POOL_ADDRESS);
      expect(metadata.tokenX.decimals).toBeGreaterThan(0);
      expect(metadata.tokenY.decimals).toBeGreaterThan(0);
      expect(metadata.tokenX.reserve).toBeGreaterThanOrEqual(0n);
      expect(metadata.tokenY.reserve).toBeGreaterThanOrEqual(0n);
      expect(metadata.fees).toBeDefined();
      expect(metadata.fees.tradeFee).toBeGreaterThanOrEqual(0);

      console.log('Pool metadata:');
      console.log('  Token X decimals:', metadata.tokenX.decimals);
      console.log('  Token Y decimals:', metadata.tokenY.decimals);
      console.log('  Token X reserve:', metadata.tokenX.reserve?.toString());
      console.log('  Token Y reserve:', metadata.tokenY.reserve?.toString());
      console.log('  Trade fee:', `${metadata.fees.tradeFee.toFixed(2)}%`);
    }, 15000);

    it('should have valid fee metadata', async () => {
      await pair.refreshState();

      const metadata = pair.getPairMetadata();
      const { fees } = metadata;

      // Fees should be percentages (0-100)
      expect(fees.tradeFee).toBeGreaterThanOrEqual(0);
      expect(fees.tradeFee).toBeLessThan(100);
      expect(fees.ownerTradeFee).toBeGreaterThanOrEqual(0);
      expect(fees.ownerWithdrawFee).toBeGreaterThanOrEqual(0);
      expect(fees.hostFee).toBeGreaterThanOrEqual(0);
    }, 15000);
  });

  describe('Quote Calculations', () => {
    beforeAll(async () => {
      await pair.refreshState();
    });

    it('should calculate swap quote with valid inputs', async () => {
      const quote = await pair.getQuote({
        amount: 1_000_000n, // 1 token (assuming 6 decimals)
        swapForY: true,
        slippage: 1, // 1%
      });

      expect(quote).toBeDefined();
      expect(quote.amountIn).toBe(1_000_000n);
      expect(quote.amountOut).toBeGreaterThan(0n);
      expect(quote.minAmountOut).toBeLessThanOrEqual(quote.amountOut);
      expect(quote.priceImpact).toBeGreaterThanOrEqual(0);
      expect(quote.rate).toBeGreaterThan(0);

      console.log('Quote for 1 token:');
      console.log('  Amount in:', quote.amountIn.toString());
      console.log('  Amount out:', quote.amountOut.toString());
      console.log('  Min out (with slippage):', quote.minAmountOut.toString());
      console.log('  Price impact:', `${quote.priceImpact.toFixed(4)}%`);
      console.log('  Rate:', quote.rate.toFixed(6));
    });

    it('should apply slippage correctly', async () => {
      const quote1 = await pair.getQuote({
        amount: 1_000_000n,
        swapForY: true,
        slippage: 1,
      });

      const quote5 = await pair.getQuote({
        amount: 1_000_000n,
        swapForY: true,
        slippage: 5,
      });

      // Higher slippage should result in lower minAmountOut
      expect(quote5.minAmountOut).toBeLessThan(quote1.minAmountOut);
      // But same amountOut
      expect(quote5.amountOut).toBe(quote1.amountOut);

      console.log('Slippage comparison:');
      console.log('  1% slippage - min out:', quote1.minAmountOut.toString());
      console.log('  5% slippage - min out:', quote5.minAmountOut.toString());
    });

    it('should reject zero amount', async () => {
      await expect(
        pair.getQuote({
          amount: 0n,
          swapForY: true,
          slippage: 1,
        })
      ).rejects.toThrow('Amount must be greater than zero');
    });

    it('should reject invalid slippage', async () => {
      await expect(
        pair.getQuote({
          amount: 1_000_000n,
          swapForY: true,
          slippage: -1,
        })
      ).rejects.toThrow('Slippage must be between 0 and 100');

      await expect(
        pair.getQuote({
          amount: 1_000_000n,
          swapForY: true,
          slippage: 100,
        })
      ).rejects.toThrow('Slippage must be between 0 and 100');
    });

    it('should handle both swap directions', async () => {
      const quoteXtoY = await pair.getQuote({
        amount: 1_000_000n,
        swapForY: true,
        slippage: 1,
      });

      const quoteYtoX = await pair.getQuote({
        amount: 1_000_000n,
        swapForY: false,
        slippage: 1,
      });

      expect(quoteXtoY.amountOut).toBeGreaterThan(0n);
      expect(quoteYtoX.amountOut).toBeGreaterThan(0n);

      console.log('Bidirectional quotes:');
      console.log('  X -> Y:', quoteXtoY.amountOut.toString());
      console.log('  Y -> X:', quoteYtoX.amountOut.toString());
    });

    it('should calculate price impact for different amounts', async () => {
      // Small swap
      const smallQuote = await pair.getQuote({
        amount: 100_000n, // 0.1 token
        swapForY: true,
        slippage: 1,
      });

      // Medium swap
      const mediumQuote = await pair.getQuote({
        amount: 1_000_000n, // 1 token
        swapForY: true,
        slippage: 1,
      });

      // Large swap
      const largeQuote = await pair.getQuote({
        amount: 10_000_000n, // 10 tokens
        swapForY: true,
        slippage: 1,
      });

      expect(smallQuote.priceImpact).toBeGreaterThanOrEqual(0);
      expect(mediumQuote.priceImpact).toBeGreaterThanOrEqual(smallQuote.priceImpact);
      expect(largeQuote.priceImpact).toBeGreaterThanOrEqual(mediumQuote.priceImpact);

      console.log('Price impact by size:');
      console.log('  0.1 token:', `${smallQuote.priceImpact.toFixed(4)}%`);
      console.log('  1 token:', `${mediumQuote.priceImpact.toFixed(4)}%`);
      console.log('  10 tokens:', `${largeQuote.priceImpact.toFixed(4)}%`);
    });
  });

  describe('Transaction Building', () => {
    beforeAll(async () => {
      await pair.refreshState();
    });

    it('should build swap transaction without submitting', async () => {
      const mockPayer = PublicKey.unique();

      const quote = await pair.getQuote({
        amount: 1_000_000n,
        swapForY: true,
        slippage: 1,
      });

      const tx = await pair.swap({
        payer: mockPayer,
        amount: 1_000_000n,
        minAmountOut: quote.minAmountOut,
        swapForY: true,
      });

      expect(tx).toBeDefined();
      expect(tx.instructions.length).toBeGreaterThan(0);

      // Verify transaction has the swap instruction
      const swapIx = tx.instructions[0];
      expect(swapIx.programId.toBase58()).toBe('SSwapUtytfBdBn1b9NUGG6foMVPtcWgpRU32HToDUZr');
      expect(swapIx.keys.length).toBeGreaterThan(0);

      console.log('Transaction built successfully:');
      console.log('  Instructions:', tx.instructions.length);
      console.log('  Accounts:', swapIx.keys.length);
    });

    it('should reject zero amount in swap', async () => {
      const mockPayer = PublicKey.unique();

      await expect(
        pair.swap({
          payer: mockPayer,
          amount: 0n,
          minAmountOut: 100n,
          swapForY: true,
        })
      ).rejects.toThrow('Amount must be greater than zero');
    });

    it('should reject negative minAmountOut', async () => {
      const mockPayer = PublicKey.unique();

      await expect(
        pair.swap({
          payer: mockPayer,
          amount: 1_000_000n,
          minAmountOut: -1n,
          swapForY: true,
        })
      ).rejects.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid pool address gracefully', async () => {
      const invalidPair = new SarosAMMPair(
        { mode: MODE.MAINNET, connection },
        PublicKey.unique() // Random address that's not a pool
      );

      await expect(invalidPair.refreshState()).rejects.toThrow();
    }, 15000);

    it('should throw error when getting quote before refreshState', async () => {
      const freshPair = new SarosAMMPair({ mode: MODE.MAINNET, connection }, TEST_POOL_ADDRESS);

      // Should fail because metadata is undefined
      await expect(
        freshPair.getQuote({
          amount: 1_000_000n,
          swapForY: true,
          slippage: 1,
        })
      ).rejects.toThrow();
    });
  });

  describe('Type Safety', () => {
    beforeAll(async () => {
      await pair.refreshState();
    });

    it('should work with bigint amounts', () => {
      const amount = 1_000_000n;
      expect(typeof amount).toBe('bigint');
    });

    it('should return properly typed metadata', () => {
      const metadata = pair.getPairMetadata();

      expect(typeof metadata.tokenX.decimals).toBe('number');
      expect(typeof metadata.tokenY.decimals).toBe('number');
      expect(typeof metadata.fees.tradeFee).toBe('number');
      expect(typeof metadata.tokenX.reserve).toBe('bigint');
      expect(metadata.tokenX.mint).toBeInstanceOf(PublicKey);
    });

    it('should return properly typed account', () => {
      const account = pair.getPairAccount();

      expect(typeof account.isInitialized).toBe('boolean');
      expect(typeof account.version).toBe('number');
      expect(account.tokenAMint).toBeInstanceOf(PublicKey);
      expect(account.tokenBMint).toBeInstanceOf(PublicKey);
    });
  });
});
