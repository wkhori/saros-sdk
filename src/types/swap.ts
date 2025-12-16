import { PublicKey, Transaction } from '@solana/web3.js';

/**
 * Parameters for getting a swap quote
 */
export interface QuoteParams {
  /** Amount to swap (in token decimals, as bigint) */
  amount: bigint;
  /** Whether swapping token X for Y (true) or Y for X (false) */
  swapForY: boolean;
  /** Slippage tolerance (0-100, e.g., 1 = 1%) */
  slippage: number;
}

/**
 * Quote response with swap calculation results
 */
export interface QuoteResponse {
  /** Estimated input amount */
  amountIn: bigint;
  /** Estimated output amount */
  amountOut: bigint;
  /** Minimum output amount with slippage */
  minAmountOut: bigint;
  /** Price impact percentage */
  priceImpact: number;
  /** Exchange rate */
  rate: number;
}

/**
 * Parameters for executing a swap
 */
export interface SwapParams {
  /** Payer/signer public key */
  payer: PublicKey;
  /** Amount to swap (in token decimals, as bigint) */
  amount: bigint;
  /** Minimum amount to receive (from quote) */
  minAmountOut: bigint;
  /** Whether swapping token X for Y (true) or Y for X (false) */
  swapForY: boolean;
  /** Optional: user's token X account */
  userTokenX?: PublicKey;
  /** Optional: user's token Y account */
  userTokenY?: PublicKey;
  /** Optional: transaction to add instructions to */
  transaction?: Transaction;
}
