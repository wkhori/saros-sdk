import { Connection, Keypair, SystemProgram, Transaction } from '@solana/web3.js';
import * as spl from '@solana/spl-token';
import type { Program } from '@coral-xyz/anchor';
import {
  SAROS_FEE_OWNER,
  CURVE_TYPE_MAP,
  DEFAULT_FEES,
  DEFAULT_SWAP_CALCULATOR,
  SWAP_ACCOUNT_SIZE,
} from '../constants/config';
import { derivePoolAuthority } from '../utils/pda';
import type { CreatePairParams, CreatePairResult } from '../types';
import type { SarosSwap } from '../constants/idl/amm';

export async function buildCreatePairTransaction(args: {
  connection: Connection;
  ammProgram: Program<SarosSwap>;
  params: CreatePairParams;
}): Promise<CreatePairResult> {
  const { connection, ammProgram, params } = args;
  const { payer, tokenAMint, tokenBMint, curveType, initialTokenAAmount, initialTokenBAmount } = params;
  const feeOwner = params.feeOwner ?? SAROS_FEE_OWNER;

  const swapInfoKeypair = Keypair.generate();
  const lpMintKeypair = Keypair.generate();

  const [poolAuthority] = derivePoolAuthority(swapInfoKeypair.publicKey, ammProgram.programId);

  const poolTokenA = await spl.getAssociatedTokenAddress(tokenAMint, poolAuthority, true);
  const poolTokenB = await spl.getAssociatedTokenAddress(tokenBMint, poolAuthority, true);
  const userLpTokenAccount = await spl.getAssociatedTokenAddress(lpMintKeypair.publicKey, payer);
  const feeAccount = await spl.getAssociatedTokenAddress(lpMintKeypair.publicKey, feeOwner);
  const userTokenA = await spl.getAssociatedTokenAddress(tokenAMint, payer);
  const userTokenB = await spl.getAssociatedTokenAddress(tokenBMint, payer);
  const shouldCreateFeeAccountAta = !feeAccount.equals(userLpTokenAccount);

  const [swapAccountRent, mintRent, { blockhash }] = await Promise.all([
    connection.getMinimumBalanceForRentExemption(SWAP_ACCOUNT_SIZE),
    connection.getMinimumBalanceForRentExemption(spl.MINT_SIZE),
    connection.getLatestBlockhash(),
  ]);

  const tx = new Transaction();
  tx.recentBlockhash = blockhash;
  tx.feePayer = payer;

  // 1) Create and initialize LP mint (legacy Saros pools use 2 decimals)
  tx.add(
    SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: lpMintKeypair.publicKey,
      space: spl.MINT_SIZE,
      lamports: mintRent,
      programId: spl.TOKEN_PROGRAM_ID,
    }),
    spl.createInitializeMintInstruction(lpMintKeypair.publicKey, 2, poolAuthority, null)
  );

  // 2) Create pool token accounts (ATAs owned by PDA)
  tx.add(
    spl.createAssociatedTokenAccountInstruction(payer, poolTokenA, poolAuthority, tokenAMint),
    spl.createAssociatedTokenAccountInstruction(payer, poolTokenB, poolAuthority, tokenBMint)
  );

  // 3) Create user LP token ATA (idempotent)
  tx.add(
    spl.createAssociatedTokenAccountIdempotentInstruction(payer, userLpTokenAccount, payer, lpMintKeypair.publicKey)
  );

  // 4) Create fee account ATA (idempotent) if different from destination
  if (shouldCreateFeeAccountAta) {
    tx.add(spl.createAssociatedTokenAccountIdempotentInstruction(payer, feeAccount, feeOwner, lpMintKeypair.publicKey));
  }

  // 5) Transfer initial liquidity to pool
  tx.add(
    spl.createTransferInstruction(userTokenA, poolTokenA, payer, initialTokenAAmount),
    spl.createTransferInstruction(userTokenB, poolTokenB, payer, initialTokenBAmount)
  );

  // 6) Create swap account
  tx.add(
    SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: swapInfoKeypair.publicKey,
      space: SWAP_ACCOUNT_SIZE,
      lamports: swapAccountRent,
      programId: ammProgram.programId,
    })
  );

  // 7) Initialize swap
  const initIx = await ammProgram.methods
    .initialize(DEFAULT_FEES, CURVE_TYPE_MAP[curveType], DEFAULT_SWAP_CALCULATOR)
    .accounts({
      swapInfo: swapInfoKeypair.publicKey,
      authorityInfo: poolAuthority,
      tokenAInfo: poolTokenA,
      tokenBInfo: poolTokenB,
      poolMintInfo: lpMintKeypair.publicKey,
      feeAccountInfo: feeAccount,
      destinationInfo: userLpTokenAccount,
      tokenProgramInfo: spl.TOKEN_PROGRAM_ID,
    })
    .instruction();
  tx.add(initIx);

  const signers = [lpMintKeypair, swapInfoKeypair];

  return {
    transaction: tx,
    pairAddress: swapInfoKeypair.publicKey,
    lpTokenMint: lpMintKeypair.publicKey,
    pairKeypair: swapInfoKeypair,
    lpMintKeypair,
    poolTokenA,
    poolTokenB,
    feeAccount,
    pairAuthority: poolAuthority,
    signers,
  };
}
