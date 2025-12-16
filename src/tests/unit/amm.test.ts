import { describe, expect, it } from 'vitest';
import { Connection, PublicKey } from '@solana/web3.js';
import { SarosAMM, MODE, SarosAMMErrorCode } from '../../index';

const connection = new Connection(process.env.RPC_URL || 'https://api.mainnet-beta.solana.com', 'confirmed');
const sdk = new SarosAMM({ mode: MODE.MAINNET, connection });

const POOLS = {
  BONK_SAROS: {
    address: 'HmQL6eECoaGLWvTxz6cWT3jEsPfjdin2vNVJ1xKiwjXz',
    tokenXMint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', // BONK
    tokenYMint: 'SarosY6Vscao718M4A778z4CGtvcwcGef5M9MEH1LGL', // SAROS
    tokenXDecimals: 5,
    tokenYDecimals: 6,
  },
  C98_USDC: {
    address: '2wUvdZA8ZsY714Y5wUL9fkFmupJGGwzui2N74zqJWgty',
  },
  INVALID: {
    address: '11111111111111111111111111111111',
  },
} as const;

const TOKEN_MINTS = {
  BONK: POOLS.BONK_SAROS.tokenXMint,
  SAROS: POOLS.BONK_SAROS.tokenYMint,
} as const;

describe('SarosAMM Factory (Mainnet RPC)', () => {
  it('fetches BONK/SAROS metadata', async () => {
    const pair = await sdk.getPair(new PublicKey(POOLS.BONK_SAROS.address));
    const metadata = pair.getPairMetadata();

    expect(metadata.pair.toBase58()).toBe(POOLS.BONK_SAROS.address);
    expect(metadata.tokenX.mint.toBase58()).toBe(POOLS.BONK_SAROS.tokenXMint);
    expect(metadata.tokenY.mint.toBase58()).toBe(POOLS.BONK_SAROS.tokenYMint);
    expect(metadata.tokenX.decimals).toBe(POOLS.BONK_SAROS.tokenXDecimals);
    expect(metadata.tokenY.decimals).toBe(POOLS.BONK_SAROS.tokenYDecimals);
    expect(metadata.tokenX.reserve).toBeGreaterThan(0n);
    expect(metadata.tokenY.reserve).toBeGreaterThan(0n);
  }, 30000);

  it('fetches multiple pairs with getPairs', async () => {
    const pairs = await sdk.getPairs([new PublicKey(POOLS.BONK_SAROS.address), new PublicKey(POOLS.C98_USDC.address)]);

    expect(pairs).toHaveLength(2);
    expect(pairs[0].getPairMetadata().pair.toBase58()).toBe(POOLS.BONK_SAROS.address);
    expect(pairs[1].getPairMetadata().pair.toBase58()).toBe(POOLS.C98_USDC.address);
  }, 45000);

  it('throws SarosAMMError for invalid pool', async () => {
    await expect(sdk.getPair(new PublicKey(POOLS.INVALID.address))).rejects.toMatchObject({
      code: SarosAMMErrorCode.PairFetchFailed,
    });
  }, 20000);

  it('searches pairs by BONK and SAROS token mints', async () => {
    const addresses = await sdk.findPairs(new PublicKey(TOKEN_MINTS.BONK), new PublicKey(TOKEN_MINTS.SAROS));
    expect(Array.isArray(addresses)).toBe(true);
    expect(addresses.length).toBeGreaterThan(0);
    expect(addresses).toContain(POOLS.BONK_SAROS.address);
  }, 60000);

  it('searches pairs by SAROS token mint', async () => {
    const addresses = await sdk.findPairs(new PublicKey(TOKEN_MINTS.SAROS));

    expect(Array.isArray(addresses)).toBe(true);
    expect(addresses.length).toBeGreaterThan(0);
    expect(addresses).toContain(POOLS.BONK_SAROS.address);
  }, 60000);

  it('returns array of pool addresses (getAllPairAddresses)', async () => {
    const addresses = await sdk.getAllPairAddresses();
    console.log('Discovered', addresses.length, 'pairs on mainnet');
    expect(Array.isArray(addresses)).toBe(true);
    expect(addresses.length).toBeGreaterThan(0);
    addresses.slice(0, 10).forEach((address) => {
      expect(address).toMatch(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/);
    });
  }, 180000);
});
