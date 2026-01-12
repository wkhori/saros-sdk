import { SarosAMMError } from './errors';

/**
 * Calculate output amount for a constant product AMM swap
 * Formula: amountOut = (reserveOut * amountIn * feeMultiplier) / (reserveIn + amountIn * feeMultiplier)
 */
export function calculateSwapOutput(
  amountIn: bigint,
  reserveIn: bigint,
  reserveOut: bigint,
  tradeFeeNumerator: bigint,
  tradeFeeDenominator: bigint
): bigint {
  if (reserveIn === 0n || reserveOut === 0n) {
    return 0n;
  }

  const feeMultiplier = tradeFeeDenominator - tradeFeeNumerator;
  const amountInWithFee = amountIn * feeMultiplier;
  const numerator = amountInWithFee * reserveOut;
  const denominator = reserveIn * tradeFeeDenominator + amountInWithFee;

  return numerator / denominator;
}

/**
 * Calculate price impact percentage
 */
export function calculatePriceImpact(
  amountIn: bigint,
  amountOut: bigint,
  reserveIn: bigint,
  reserveOut: bigint
): number {
  if (reserveIn === 0n || reserveOut === 0n) {
    return 0;
  }

  const priceBefore = Number(reserveOut) / Number(reserveIn);
  const newReserveIn = reserveIn + amountIn;
  const newReserveOut = reserveOut - amountOut;
  const priceAfter = Number(newReserveOut) / Number(newReserveIn);

  return Math.abs(((priceAfter - priceBefore) / priceBefore) * 100);
}

/**
 * Apply slippage to get minimum output
 */
export function getMinOutputWithSlippage(amount: bigint, slippagePercent: number): bigint {
  const slippageBps = BigInt(Math.floor(slippagePercent * 100));
  return (amount * (10000n - slippageBps)) / 10000n;
}

/**
 * Calculate token amounts required for a given LP token amount
 */
export function calculateTokensForLp(
  lpTokenAmount: bigint,
  reserveA: bigint,
  reserveB: bigint,
  lpSupply: bigint
): { tokenAAmount: bigint; tokenBAmount: bigint } {
  if (lpSupply === 0n || reserveA === 0n || reserveB === 0n) {
    throw SarosAMMError.InsufficientLiquidity();
  }

  // Round up to ensure sufficient deposit for minting
  const tokenAAmount = (lpTokenAmount * reserveA + (lpSupply - 1n)) / lpSupply;
  const tokenBAmount = (lpTokenAmount * reserveB + (lpSupply - 1n)) / lpSupply;

  return { tokenAAmount, tokenBAmount };
}
