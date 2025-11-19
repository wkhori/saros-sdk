import { PublicKey } from '@solana/web3.js';

// AMM PDA derivations
export function derivePoolAuthority(poolAddress: PublicKey, programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([poolAddress.toBuffer()], programId);
}

export function derivePoolAddress(seed: PublicKey, programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([seed.toBuffer()], programId);
}

// Farm/Stake PDA derivations
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
