import { PublicKey, Transaction } from '@solana/web3.js';

/**
 * Parameters for depositing liquidity
 */
export interface DepositLiquidityParams {
  /** Payer/signer public key */
  payer: PublicKey;
  /** Desired LP token amount to receive */
  lpTokenAmount: bigint;
  /** Maximum token X willing to deposit */
  maxTokenX: bigint;
  /** Maximum token Y willing to deposit */
  maxTokenY: bigint;
  /** Slippage tolerance (0-100, e.g., 1 = 1%) */
  slippage: number;
  /** Optional: user's token X account */
  userTokenX?: PublicKey;
  /** Optional: user's token Y account */
  userTokenY?: PublicKey;
  /** Optional: user's LP token account */
  userLpToken?: PublicKey;
  /** Optional: transaction to add instructions to */
  transaction?: Transaction;
}

/**
 * Parameters for withdrawing liquidity
 */
export interface WithdrawLiquidityParams {
  /** Payer/signer public key */
  payer: PublicKey;
  /** LP token amount to burn */
  lpTokenAmount: bigint;
  /** Minimum token X to receive */
  minTokenX: bigint;
  /** Minimum token Y to receive */
  minTokenY: bigint;
  /** Slippage tolerance (0-100, e.g., 1 = 1%) */
  slippage: number;
  /** Optional: user's token X account */
  userTokenX?: PublicKey;
  /** Optional: user's token Y account */
  userTokenY?: PublicKey;
  /** Optional: user's LP token account */
  userLpToken?: PublicKey;
  /** Optional: transaction to add instructions to */
  transaction?: Transaction;
}

/**
 * Response from liquidity deposit/withdraw
 */
export interface LiquidityResponse {
  transaction: Transaction;
  lpTokenAmount: bigint;
  tokenXAmount: bigint;
  tokenYAmount: bigint;
}
