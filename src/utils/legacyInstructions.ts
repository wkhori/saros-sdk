import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { DEFAULT_FEES } from '../constants';

// UNUSED...Needed?
export function createInitSwapInstruction(params: {
  swapAccount: PublicKey;
  authority: PublicKey;
  tokenA: PublicKey;
  tokenB: PublicKey;
  poolMint: PublicKey;
  feeAccount: PublicKey;
  destination: PublicKey;
  tokenProgram: PublicKey;
  programId: PublicKey;
  fees: typeof DEFAULT_FEES;
  curveType: Buffer;
  curveParameters: Buffer;
}) {
  const {
    swapAccount,
    authority,
    tokenA,
    tokenB,
    poolMint,
    feeAccount,
    destination,
    tokenProgram,
    programId,
    fees,
    curveType,
    curveParameters,
  } = params;

  const keys = [
    { pubkey: swapAccount, isSigner: false, isWritable: true },
    { pubkey: authority, isSigner: false, isWritable: false },
    { pubkey: tokenA, isSigner: false, isWritable: true },
    { pubkey: tokenB, isSigner: false, isWritable: true },
    { pubkey: poolMint, isSigner: false, isWritable: true },
    { pubkey: feeAccount, isSigner: false, isWritable: true },
    { pubkey: destination, isSigner: false, isWritable: true },
    { pubkey: tokenProgram, isSigner: false, isWritable: false },
  ];

  const data = Buffer.alloc(64 + curveParameters.length);
  let offset = 0;
  data.writeUInt16LE(fees.tradeFeeNumerator.toNumber(), offset);
  offset += 2;
  data.writeUInt16LE(fees.tradeFeeDenominator.toNumber(), offset);
  offset += 2;
  data.writeUInt16LE(fees.ownerTradeFeeNumerator.toNumber(), offset);
  offset += 2;
  data.writeUInt16LE(fees.ownerTradeFeeDenominator.toNumber(), offset);
  offset += 2;
  data.writeUInt16LE(fees.ownerWithdrawFeeNumerator.toNumber(), offset);
  offset += 2;
  data.writeUInt16LE(fees.ownerWithdrawFeeDenominator.toNumber(), offset);
  offset += 2;
  data.writeUInt16LE(fees.hostFeeNumerator.toNumber(), offset);
  offset += 2;
  data.writeUInt16LE(fees.hostFeeDenominator.toNumber(), offset);
  offset += 2;

  curveType.copy(data, offset);
  offset += curveType.length;
  curveParameters.copy(data, offset);

  return new TransactionInstruction({
    keys,
    programId, // <-- use the program ID passed in
    data,
  });
}
