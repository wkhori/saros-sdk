import { Connection, PublicKey } from '@solana/web3.js';
import * as spl from '@solana/spl-token';

// Duplicate functions from DLMM SDK test suite
// In the future, consider moving to a shared location

export async function waitForConfirmation(sig: string, connection: Connection) {
  console.log(`Waiting for confirmation: ${sig}`);
  const res = await connection.confirmTransaction(sig, 'confirmed');
  if (res.value.err) throw new Error(`Transaction failed: ${res.value.err}`);
  console.log(`Transaction confirmed: ${sig}`);
  return res;
}

export async function getTokenBalance(connection: Connection, owner: PublicKey, mint: PublicKey): Promise<bigint> {
  const ata = spl.getAssociatedTokenAddressSync(mint, owner);
  try {
    const bal = await connection.getTokenAccountBalance(ata);
    return BigInt(bal.value.amount);
  } catch {
    return 0n;
  }
}

/**
 * Get the rent-exempt minimum balance for a wSOL token account (165 bytes).
 * Used to calculate the rent returned when a wSOL account is closed after a swap.
 */
export async function getWsolAccountRent(connection: Connection): Promise<bigint> {
  return BigInt(await connection.getMinimumBalanceForRentExemption(165));
}
