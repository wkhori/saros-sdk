import { describe, it, expect, beforeAll } from 'vitest';
import { Connection, sendAndConfirmTransaction } from '@solana/web3.js';
import * as spl from '@solana/spl-token';
import { SarosAMMPair } from '../../services/pair';
import { MODE } from '../../constants/config';
import { loadOrCreateWallet } from '../setup/wallet';
import { ensureAMMTokenAndPool } from '../setup/amm-token';
import { getTokenBalance } from '../setup/test-util';

const RPC_ENDPOINT = process.env.DEVNET_RPC_URL || 'https://api.devnet.solana.com';

describe('AMM Pair Full Flow (Devnet)', () => {
  let connection: Connection;
  let payerKeypair: Awaited<ReturnType<typeof loadOrCreateWallet>>['keypair'];
  let pair: SarosAMMPair;

  beforeAll(async () => {
    connection = new Connection(RPC_ENDPOINT, 'confirmed');
    const wallet = await loadOrCreateWallet(connection);
    payerKeypair = wallet.keypair;

    const { pool } = await ensureAMMTokenAndPool(connection, payerKeypair);
    pair = new SarosAMMPair({ mode: MODE.DEVNET, connection }, pool.pair);
    await pair.refreshState();
  }, 120000);

  it('adds liquidity, swaps both ways, removes liquidity', async () => {
    const payer = payerKeypair.publicKey;
    const stateBefore = pair.getPairAccount();

    const [balATokenBefore, balBTokenBefore, balLpBefore] = await Promise.all([
      getTokenBalance(connection, payer, stateBefore.tokenAMint),
      getTokenBalance(connection, payer, stateBefore.tokenBMint),
      getTokenBalance(connection, payer, stateBefore.poolMint),
    ]);

    const metadataBefore = pair.getPairMetadata();
    const reserveABefore = metadataBefore.tokenX.reserve ?? 0n;
    const reserveBBefore = metadataBefore.tokenY.reserve ?? 0n;

    const lpMintInfo = await spl.getMint(connection, stateBefore.poolMint);
    const lpSupplyBefore = BigInt(lpMintInfo.supply.toString());
    expect(lpSupplyBefore).toBeGreaterThan(0n);

    // Add liquidity by requesting a small number of LP base units (LP decimals = 2).
    const lpToMint = 100n; // 1.00 LP

    // Approx required amounts from current ratio: required = ceil(lpToMint * reserve / lpSupply)
    const reqA = (lpToMint * reserveABefore + (lpSupplyBefore - 1n)) / lpSupplyBefore;
    const reqB = (lpToMint * reserveBBefore + (lpSupplyBefore - 1n)) / lpSupplyBefore;

    const addTx = await pair.addLiquidity({
      payer,
      poolTokenAmount: lpToMint,
      maximumTokenA: reqA + 1n,
      maximumTokenB: reqB + 1n,
    });

    await sendAndConfirmTransaction(connection, addTx, [payerKeypair]);

    await pair.refreshState();
    const stateAfterAdd = pair.getPairAccount();
    const [balATokenAfterAdd, balBTokenAfterAdd, balLpAfterAdd] = await Promise.all([
      getTokenBalance(connection, payer, stateAfterAdd.tokenAMint),
      getTokenBalance(connection, payer, stateAfterAdd.tokenBMint),
      getTokenBalance(connection, payer, stateAfterAdd.poolMint),
    ]);

    expect(balLpAfterAdd - balLpBefore).toBe(lpToMint);
    expect(balATokenBefore - balATokenAfterAdd).toBeGreaterThan(0n);
    expect(balBTokenBefore - balBTokenAfterAdd).toBeGreaterThan(0n);

    // Swap A -> B (exact input)
    const amountInA = 1_000_000n;
    const quoteAB = await pair.getQuote({ amount: amountInA, swapForY: true, slippage: 1 });
    const swapAB = await pair.swap({
      payer,
      amount: amountInA,
      minAmountOut: quoteAB.minAmountOut,
      swapForY: true,
    });
    await sendAndConfirmTransaction(connection, swapAB, [payerKeypair]);

    const [balATokenAfterSwapAB, balBTokenAfterSwapAB] = await Promise.all([
      getTokenBalance(connection, payer, stateAfterAdd.tokenAMint),
      getTokenBalance(connection, payer, stateAfterAdd.tokenBMint),
    ]);
    const spentA = balATokenAfterAdd - balATokenAfterSwapAB;
    expect(spentA).toBeGreaterThan(0n);
    expect(spentA).toBeLessThanOrEqual(amountInA);
    expect(balBTokenAfterSwapAB - balBTokenAfterAdd).toBeGreaterThanOrEqual(quoteAB.minAmountOut);

    // Swap B -> A (exact input)
    const amountInB = 1_000_000n;
    const quoteBA = await pair.getQuote({ amount: amountInB, swapForY: false, slippage: 1 });
    const swapBA = await pair.swap({
      payer,
      amount: amountInB,
      minAmountOut: quoteBA.minAmountOut,
      swapForY: false,
    });
    await sendAndConfirmTransaction(connection, swapBA, [payerKeypair]);

    const [balATokenAfterSwapBA, balBTokenAfterSwapBA] = await Promise.all([
      getTokenBalance(connection, payer, stateAfterAdd.tokenAMint),
      getTokenBalance(connection, payer, stateAfterAdd.tokenBMint),
    ]);
    const spentB = balBTokenAfterSwapAB - balBTokenAfterSwapBA;
    expect(spentB).toBeGreaterThan(0n);
    expect(spentB).toBeLessThanOrEqual(amountInB);
    expect(balATokenAfterSwapBA - balATokenAfterSwapAB).toBeGreaterThanOrEqual(quoteBA.minAmountOut);

    // Remove the LP we minted in this test
    const removeTx = await pair.removeLiquidity({
      payer,
      poolTokenAmount: lpToMint,
      minimumTokenA: 0n,
      minimumTokenB: 0n,
    });
    await sendAndConfirmTransaction(connection, removeTx, [payerKeypair]);

    const [balATokenFinal, balBTokenFinal, balLpFinal] = await Promise.all([
      getTokenBalance(connection, payer, stateAfterAdd.tokenAMint),
      getTokenBalance(connection, payer, stateAfterAdd.tokenBMint),
      getTokenBalance(connection, payer, stateAfterAdd.poolMint),
    ]);

    expect(balLpFinal).toBe(balLpAfterAdd - lpToMint);
    expect(balATokenFinal).toBeGreaterThan(0n);
    expect(balBTokenFinal).toBeGreaterThan(0n);
  }, 180000);
});
