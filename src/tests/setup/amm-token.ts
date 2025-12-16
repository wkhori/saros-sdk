import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import { Connection, Keypair, PublicKey, sendAndConfirmTransaction } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';
import { SarosAMM } from '../../services';
import { MODE } from '../../constants/config';
import { SwapCurveType } from '../../types';

export interface TestToken {
  name: string;
  symbol: string;
  mint: PublicKey;
  decimals: number;
  supply: number;
}

export interface TestAMMPool {
  pair: PublicKey;
  tokenA: PublicKey;
  tokenB: PublicKey;
  lpMint: PublicKey;
  curveType: string;
}

const AMM_TOKENS_FILE = path.join(process.cwd(), 'test-data/amm-test-tokens.json');

let ensureInFlight: Promise<{ tokenA: TestToken; tokenB: TestToken; pool: TestAMMPool }> | null = null;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readSavedEnv(): { tokenA: TestToken; tokenB: TestToken; pool: TestAMMPool } | null {
  if (!fs.existsSync(AMM_TOKENS_FILE)) return null;
  const saved = JSON.parse(fs.readFileSync(AMM_TOKENS_FILE, 'utf8'));
  return {
    tokenA: { ...saved.tokenA, mint: new PublicKey(saved.tokenA.mint) },
    tokenB: { ...saved.tokenB, mint: new PublicKey(saved.tokenB.mint) },
    pool: {
      ...saved.pool,
      pair: new PublicKey(saved.pool.pair),
      tokenA: new PublicKey(saved.pool.tokenA),
      tokenB: new PublicKey(saved.pool.tokenB),
      lpMint: new PublicKey(saved.pool.lpMint),
    },
  };
}

export async function ensureAMMTokenAndPool(
  connection: Connection,
  payer: Keypair
): Promise<{ tokenA: TestToken; tokenB: TestToken; pool: TestAMMPool }> {
  // Memoize within this process so multiple test files reuse the same setup.
  if (ensureInFlight) return ensureInFlight;

  ensureInFlight = (async () => {
    // Try to load existing tokens and pool (retry in case another test is mid-write)
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const loaded = readSavedEnv();
        if (loaded) return loaded;
      } catch {
        await sleep(250 * (attempt + 1));
      }
    }

    console.log('⚠️  Failed to load saved data, creating new tokens and pool...');

    // Create new tokens
    console.log('Creating AMM test token A (9 decimals)...');
    const tokenAMint = await createMint(connection, payer, payer.publicKey, null, 9);
    const ataA = await getOrCreateAssociatedTokenAccount(connection, payer, tokenAMint, payer.publicKey);
    await mintTo(connection, payer, tokenAMint, ataA.address, payer.publicKey, 1_000_000n * 10n ** 9n);

    const tokenA: TestToken = {
      name: 'Saros AMM Token A',
      symbol: 'SAMMA',
      mint: tokenAMint,
      decimals: 9,
      supply: 1_000_000,
    };

    console.log('Creating AMM test token B (6 decimals)...');
    const tokenBMint = await createMint(connection, payer, payer.publicKey, null, 6);
    const ataB = await getOrCreateAssociatedTokenAccount(connection, payer, tokenBMint, payer.publicKey);
    await mintTo(connection, payer, tokenBMint, ataB.address, payer.publicKey, 1_000_000n * 10n ** 6n);

    const tokenB: TestToken = {
      name: 'Saros AMM Token B',
      symbol: 'SAMMB',
      mint: tokenBMint,
      decimals: 6,
      supply: 1_000_000,
    };

    // Create new pool
    console.log('Creating AMM pair...');
    const amm = new SarosAMM({ mode: MODE.DEVNET, connection });
    const result = await amm.createPair({
      payer: payer.publicKey,
      tokenAMint: tokenAMint,
      tokenBMint: tokenBMint,
      initialTokenAAmount: 100_000n * 10n ** 9n, // 100,000 tokens
      initialTokenBAmount: 100_000n * 10n ** 6n, // 100,000 tokens
      curveType: SwapCurveType.ConstantProduct,
    });

    // Sign and send transaction
    console.log('Sending transaction to create AMM pair...');
    const sig = await sendAndConfirmTransaction(connection, result.transaction, [payer, ...result.signers]);
    console.log('✅ AMM Pair created! Transaction signature:', sig);
    console.log('🔗 View on explorer:', `https://explorer.solana.com/tx/${sig}?cluster=devnet`);

    const pool: TestAMMPool = {
      pair: result.pairAddress,
      tokenA: tokenAMint,
      tokenB: tokenBMint,
      lpMint: result.lpTokenMint,
      curveType: 'ConstantProduct',
    };

    // Save both tokens and pool for reuse
    fs.mkdirSync(path.dirname(AMM_TOKENS_FILE), { recursive: true });
    const serialized = JSON.stringify(
      {
        tokenA: { ...tokenA, mint: tokenA.mint.toBase58() },
        tokenB: { ...tokenB, mint: tokenB.mint.toBase58() },
        pool: {
          ...pool,
          pair: pool.pair.toBase58(),
          tokenA: pool.tokenA.toBase58(),
          tokenB: pool.tokenB.toBase58(),
          lpMint: pool.lpMint.toBase58(),
        },
      },
      null,
      2
    );
    const tmp = `${AMM_TOKENS_FILE}.${Date.now()}.tmp`;
    fs.writeFileSync(tmp, serialized);
    fs.renameSync(tmp, AMM_TOKENS_FILE);

    return { tokenA, tokenB, pool };
  })();

  try {
    return await ensureInFlight;
  } finally {
    ensureInFlight = null;
  }
}
