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
 * Calculate required token amounts for desired LP tokens
 * Formula: tokenA = (desiredLP * reserveA) / totalLP
 *          tokenB = (desiredLP * reserveB) / totalLP
 */
export function calculateAddLiquidityAmounts(
  desiredLpTokens: bigint,
  reserveA: bigint,
  reserveB: bigint,
  totalLpSupply: bigint
): { tokenARequired: bigint; tokenBRequired: bigint } {
  if (totalLpSupply === 0n) {
    throw new Error('Pool has no liquidity');
  }

  const tokenARequired = (desiredLpTokens * reserveA) / totalLpSupply;
  const tokenBRequired = (desiredLpTokens * reserveB) / totalLpSupply;

  return { tokenARequired, tokenBRequired };
}

/**
 * Calculate expected token amounts from burning LP tokens
 * Formula: tokenA = (lpToBurn * reserveA) / totalLP
 *          tokenB = (lpToBurn * reserveB) / totalLP
 */
export function calculateRemoveLiquidityAmounts(
  lpTokensToBurn: bigint,
  reserveA: bigint,
  reserveB: bigint,
  totalLpSupply: bigint
): { tokenAExpected: bigint; tokenBExpected: bigint } {
  if (totalLpSupply === 0n) {
    throw new Error('Pool has no liquidity');
  }

  const tokenAExpected = (lpTokensToBurn * reserveA) / totalLpSupply;
  const tokenBExpected = (lpTokensToBurn * reserveB) / totalLpSupply;

  return { tokenAExpected, tokenBExpected };
}
