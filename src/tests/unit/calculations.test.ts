import { describe, it, expect } from 'vitest';
import {
  calculateSwapOutput,
  calculatePriceImpact,
  getMinOutputWithSlippage,
  calculateAddLiquidityAmounts,
  calculateRemoveLiquidityAmounts,
} from '../../utils/calculations';

describe('Calculation Utilities', () => {
  describe('calculateSwapOutput', () => {
    it('should calculate correct output for constant product AMM', () => {
      const amountIn = 1_000_000n;
      const reserveIn = 100_000_000n;
      const reserveOut = 200_000_000n;
      const tradeFeeNumerator = 25n; // 0.25%
      const tradeFeeDenominator = 10000n;

      const output = calculateSwapOutput(
        amountIn,
        reserveIn,
        reserveOut,
        tradeFeeNumerator,
        tradeFeeDenominator
      );

      expect(output).toBeGreaterThan(0n);
      expect(output).toBeLessThan(amountIn * 2n);
    });

    it('should return 0 for zero reserves', () => {
      const output = calculateSwapOutput(1_000_000n, 0n, 100_000_000n, 25n, 10000n);
      expect(output).toBe(0n);
    });

    it('should handle large amounts', () => {
      const largeAmount = 1_000_000_000_000n;
      const output = calculateSwapOutput(largeAmount, 100_000_000n, 200_000_000n, 25n, 10000n);
      expect(output).toBeGreaterThan(0n);
    });
  });

  describe('calculatePriceImpact', () => {
    it('should calculate price impact percentage', () => {
      const amountIn = 10_000_000n;
      const amountOut = 9_500_000n;
      const reserveIn = 100_000_000n;
      const reserveOut = 100_000_000n;

      const impact = calculatePriceImpact(amountIn, amountOut, reserveIn, reserveOut);

      expect(impact).toBeGreaterThanOrEqual(0);
      expect(impact).toBeLessThan(100);
    });

    it('should return 0 for zero reserves', () => {
      const impact = calculatePriceImpact(1_000_000n, 1_000_000n, 0n, 100_000_000n);
      expect(impact).toBe(0);
    });

    it('should show higher impact for larger swaps', () => {
      const reserveIn = 100_000_000n;
      const reserveOut = 100_000_000n;

      const smallOut = calculateSwapOutput(1_000_000n, reserveIn, reserveOut, 25n, 10000n);
      const smallImpact = calculatePriceImpact(1_000_000n, smallOut, reserveIn, reserveOut);

      const largeOut = calculateSwapOutput(10_000_000n, reserveIn, reserveOut, 25n, 10000n);
      const largeImpact = calculatePriceImpact(10_000_000n, largeOut, reserveIn, reserveOut);

      expect(largeImpact).toBeGreaterThan(smallImpact);
    });
  });

  describe('getMinOutputWithSlippage', () => {
    it('should apply 1% slippage correctly', () => {
      const amount = 1_000_000n;
      const minOutput = getMinOutputWithSlippage(amount, 1);

      expect(minOutput).toBe(990_000n);
    });

    it('should apply 5% slippage correctly', () => {
      const amount = 1_000_000n;
      const minOutput = getMinOutputWithSlippage(amount, 5);

      expect(minOutput).toBe(950_000n);
    });

    it('should handle zero slippage', () => {
      const amount = 1_000_000n;
      const minOutput = getMinOutputWithSlippage(amount, 0);

      expect(minOutput).toBe(amount);
    });

    it('should handle fractional slippage', () => {
      const amount = 1_000_000n;
      const minOutput = getMinOutputWithSlippage(amount, 0.5);

      expect(minOutput).toBe(995_000n);
    });
  });

  describe('calculateAddLiquidityAmounts', () => {
    it('should calculate proportional token amounts', () => {
      const desiredLpTokens = 1_000_000n;
      const reserveA = 100_000_000n;
      const reserveB = 200_000_000n;
      const totalLpSupply = 10_000_000n;

      const { tokenARequired, tokenBRequired } = calculateAddLiquidityAmounts(
        desiredLpTokens,
        reserveA,
        reserveB,
        totalLpSupply
      );

      expect(tokenARequired).toBeGreaterThan(0n);
      expect(tokenBRequired).toBeGreaterThan(0n);
      expect(tokenBRequired).toBe(tokenARequired * 2n);
    });

    it('should throw error for zero LP supply', () => {
      expect(() =>
        calculateAddLiquidityAmounts(1_000_000n, 100_000_000n, 200_000_000n, 0n)
      ).toThrow('Pool has no liquidity');
    });

    it('should handle equal reserves', () => {
      const desiredLpTokens = 1_000_000n;
      const reserveA = 100_000_000n;
      const reserveB = 100_000_000n;
      const totalLpSupply = 10_000_000n;

      const { tokenARequired, tokenBRequired } = calculateAddLiquidityAmounts(
        desiredLpTokens,
        reserveA,
        reserveB,
        totalLpSupply
      );

      expect(tokenARequired).toBe(tokenBRequired);
    });
  });

  describe('calculateRemoveLiquidityAmounts', () => {
    it('should calculate proportional token amounts to receive', () => {
      const lpTokensToBurn = 1_000_000n;
      const reserveA = 100_000_000n;
      const reserveB = 200_000_000n;
      const totalLpSupply = 10_000_000n;

      const { tokenAExpected, tokenBExpected } = calculateRemoveLiquidityAmounts(
        lpTokensToBurn,
        reserveA,
        reserveB,
        totalLpSupply
      );

      expect(tokenAExpected).toBeGreaterThan(0n);
      expect(tokenBExpected).toBeGreaterThan(0n);
      expect(tokenBExpected).toBe(tokenAExpected * 2n);
    });

    it('should throw error for zero LP supply', () => {
      expect(() =>
        calculateRemoveLiquidityAmounts(1_000_000n, 100_000_000n, 200_000_000n, 0n)
      ).toThrow('Pool has no liquidity');
    });

    it('should calculate correct share of pool', () => {
      const lpTokensToBurn = 5_000_000n;
      const reserveA = 100_000_000n;
      const reserveB = 200_000_000n;
      const totalLpSupply = 10_000_000n;

      const { tokenAExpected, tokenBExpected } = calculateRemoveLiquidityAmounts(
        lpTokensToBurn,
        reserveA,
        reserveB,
        totalLpSupply
      );

      expect(tokenAExpected).toBe(50_000_000n);
      expect(tokenBExpected).toBe(100_000_000n);
    });

    it('should handle burning all LP tokens', () => {
      const totalLpSupply = 10_000_000n;
      const reserveA = 100_000_000n;
      const reserveB = 200_000_000n;

      const { tokenAExpected, tokenBExpected } = calculateRemoveLiquidityAmounts(
        totalLpSupply,
        reserveA,
        reserveB,
        totalLpSupply
      );

      expect(tokenAExpected).toBe(reserveA);
      expect(tokenBExpected).toBe(reserveB);
    });
  });

  describe('Round-trip consistency', () => {
    it('should maintain consistency between add and remove liquidity', () => {
      const reserveA = 100_000_000n;
      const reserveB = 200_000_000n;
      const totalLpSupply = 10_000_000n;
      const desiredLpTokens = 1_000_000n;

      const { tokenARequired, tokenBRequired } = calculateAddLiquidityAmounts(
        desiredLpTokens,
        reserveA,
        reserveB,
        totalLpSupply
      );

      const newTotalLpSupply = totalLpSupply + desiredLpTokens;
      const newReserveA = reserveA + tokenARequired;
      const newReserveB = reserveB + tokenBRequired;

      const { tokenAExpected, tokenBExpected } = calculateRemoveLiquidityAmounts(
        desiredLpTokens,
        newReserveA,
        newReserveB,
        newTotalLpSupply
      );

      expect(tokenAExpected).toBe(tokenARequired);
      expect(tokenBExpected).toBe(tokenBRequired);
    });
  });
});
