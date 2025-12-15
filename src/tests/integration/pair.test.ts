import { describe, it, expect, beforeAll } from 'vitest';
import { Connection } from '@solana/web3.js';
import { SarosAMMPair } from '../../services/pair';
import { MODE } from '../../constants/config';
import { loadOrCreateWallet } from '../setup/wallet';
import { ensureAMMTokenAndPool } from '../setup/amm-token';
import type { TestToken, TestAMMPool } from '../setup/amm-token';

// Use devnet for integration tests
// Configure RPC endpoints in .env.test file
const RPC_ENDPOINT = process.env.DEVNET_RPC_URL || 'https://api.mainnet-beta.solana.com';

describe('AMM Pair Integration Tests', () => {
  let connection: Connection;
  let tokenA: TestToken;
  let tokenB: TestToken;
  let pool: TestAMMPool;
  let pair: SarosAMMPair;

  beforeAll(async () => {
    connection = new Connection(RPC_ENDPOINT, 'confirmed');
    const wallet = await loadOrCreateWallet(connection);

    console.log(`\nTest wallet: ${wallet.address}`);
    console.log(`Balance: ${wallet.balance.toFixed(2)} SOL\n`);

    const result = await ensureAMMTokenAndPool(connection, wallet.keypair);
    tokenA = result.tokenA;
    tokenB = result.tokenB;
    pool = result.pool;

    console.log(`\nAMM Pool created:`);
    console.log(`  Pair address: ${pool.pair.toBase58()}`);
    console.log(`  Token A: ${tokenA.symbol} (${tokenA.mint.toBase58()})`);
    console.log(`  Token B: ${tokenB.symbol} (${tokenB.mint.toBase58()})`);
    console.log(`  LP Mint: ${pool.lpMint.toBase58()}`);
    console.log(`  Curve: ${pool.curveType}\n`);

    pair = new SarosAMMPair({ mode: MODE.DEVNET, connection }, pool.pair);
  }, 90000);

  describe('Pool State', () => {
    it('should fetch and populate pair state', async () => {
      await pair.refreshState();

      const pairAccount = pair.getPairAccount();
      expect(pairAccount).toBeDefined();
      expect(pairAccount.isInitialized).toBe(true);
      expect(pairAccount.tokenAMint.toBase58()).toBe(tokenA.mint.toBase58());
      expect(pairAccount.tokenBMint.toBase58()).toBe(tokenB.mint.toBase58());
      expect(pairAccount.poolMint.toBase58()).toBe(pool.lpMint.toBase58());

      console.log(`\nPair account initialized:`);
      console.log(`  Version: ${pairAccount.version}`);
      console.log(`  Token A: ${pairAccount.tokenAMint.toBase58()}`);
      console.log(`  Token B: ${pairAccount.tokenBMint.toBase58()}`);
      console.log(`  LP Mint: ${pairAccount.poolMint.toBase58()}`);
    });

    it('should build pair metadata with reserves', async () => {
      await pair.refreshState();

      const metadata = pair.getPairMetadata();
      expect(metadata).toBeDefined();
      expect(metadata.tokenX.mint.toBase58()).toBe(tokenA.mint.toBase58());
      expect(metadata.tokenY.mint.toBase58()).toBe(tokenB.mint.toBase58());
      expect(metadata.tokenX.decimals).toBe(9);
      expect(metadata.tokenY.decimals).toBe(6);
      expect(metadata.tokenX.reserve).toBeGreaterThan(0n);
      expect(metadata.tokenY.reserve).toBeGreaterThan(0n);

      console.log(`\nPair metadata:`);
      console.log(`  Token A reserve: ${metadata.tokenX.reserve?.toString()}`);
      console.log(`  Token B reserve: ${metadata.tokenY.reserve?.toString()}`);
      console.log(`  Fee: ${metadata.fees.tradeFee + metadata.fees.ownerTradeFee}%`);
    });
  });
});
