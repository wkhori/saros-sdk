import { PublicKey } from '@solana/web3.js';

/**
 * Derive the pool authority PDA for an AMM pair
 * @param poolAddress - The pool/pair address
 * @param programId - AMM program ID
 * @returns Pool authority address and bump seed
 */
export function derivePoolAuthority(
  poolAddress: PublicKey,
  programId: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [poolAddress.toBuffer()],
    programId
  );
}

/**
 * Derive a pool address from a seed
 * @param seed - Seed public key
 * @param programId - AMM program ID
 * @returns Pool address and bump seed
 */
export function derivePoolAddress(
  seed: PublicKey,
  programId: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [seed.toBuffer()],
    programId
  );
}