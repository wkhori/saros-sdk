import { Connection, PublicKey } from '@solana/web3.js';
import * as spl from '@solana/spl-token';

export async function getTokenBalance(connection: Connection, owner: PublicKey, mint: PublicKey): Promise<bigint> {
  const ata = spl.getAssociatedTokenAddressSync(mint, owner);
  try {
    const bal = await connection.getTokenAccountBalance(ata);
    return BigInt(bal.value.amount);
  } catch {
    return 0n;
  }
}
