import { Keypair, PublicKey } from '@solana/web3.js';

export function derivePoolSeed(programId: PublicKey): [PublicKey, number] {
  // Deterministic seed for legacy pool
  const seed = Buffer.from('saros_pool_seed');
  return PublicKey.findProgramAddressSync([seed], programId);
}

export function poolKeypairFromSeed(poolSeed: PublicKey): Keypair {
  return Keypair.fromSeed(poolSeed.toBytes().slice(0, 32));
}

export function derivePoolAuthority(poolPubkey: PublicKey, programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([poolPubkey.toBuffer()], programId);
}

export function lpMintFromAuthority(authority: PublicKey): Keypair {
  return Keypair.fromSeed(authority.toBytes().slice(0, 32));
}

/**
 * Farm / stake PDAs (unchanged)
 */
export function deriveFarmUserPoolAddress(
  user: PublicKey,
  poolAddress: PublicKey,
  programId: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([user.toBuffer(), poolAddress.toBuffer()], programId);
}

export function deriveFarmUserPoolRewardAddress(
  user: PublicKey,
  poolReward: PublicKey,
  programId: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([user.toBuffer(), poolReward.toBuffer()], programId);
}

export function deriveFarmPoolAuthority(poolAddress: PublicKey, programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from('authority'), poolAddress.toBuffer()], programId);
}

export function deriveFarmPoolRewardAuthority(poolReward: PublicKey, programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from('authority'), poolReward.toBuffer()], programId);
}

// // Farm/Stake PDA derivations
// export function deriveFarmUserPoolAddress(
//   user: PublicKey,
//   poolAddress: PublicKey,
//   programId: PublicKey
// ): [PublicKey, number] {
//   return PublicKey.findProgramAddressSync([user.toBuffer(), poolAddress.toBuffer()], programId);
// }

// export function deriveFarmUserPoolRewardAddress(
//   user: PublicKey,
//   poolReward: PublicKey,
//   programId: PublicKey
// ): [PublicKey, number] {
//   return PublicKey.findProgramAddressSync([user.toBuffer(), poolReward.toBuffer()], programId);
// }

// export function deriveFarmPoolAuthority(poolAddress: PublicKey, programId: PublicKey): [PublicKey, number] {
//   return PublicKey.findProgramAddressSync([Buffer.from('authority'), poolAddress.toBuffer()], programId);
// }

// export function deriveFarmPoolRewardAuthority(poolReward: PublicKey, programId: PublicKey): [PublicKey, number] {
//   return PublicKey.findProgramAddressSync([Buffer.from('authority'), poolReward.toBuffer()], programId);
// }
