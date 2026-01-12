import { describe, it, expect } from 'vitest';
import {
  calculateSwapOutput,
  calculatePriceImpact,
  getMinOutputWithSlippage,
  calculateTokensForLp,
} from '../../utils/calculations';

describe('Calculation Utilities', () => {
  describe('calculateSwapOutput', () => {
    it('should calculate correct output for constant product AMM', () => {
      const amountIn = 1_000_000n;
      const reserveIn = 100_000_000n;
      const reserveOut = 200_000_000n;
      const tradeFeeNumerator = 25n; // 0.25%
      const tradeFeeDenominator = 10000n;

      const output = calculateSwapOutput(amountIn, reserveIn, reserveOut, tradeFeeNumerator, tradeFeeDenominator);

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

  describe('calculateTokensForLp', () => {
    it('should calculate token amounts for LP tokens', () => {
      const lpTokenAmount = 100n;
      const reserveA = 1_000_000n;
      const reserveB = 500_000n;
      const lpSupply = 1000n;

      const { tokenAAmount, tokenBAmount } = calculateTokensForLp(lpTokenAmount, reserveA, reserveB, lpSupply);

      expect(tokenAAmount).toBe(100_000n);
      expect(tokenBAmount).toBe(50_000n);
    });

    it('should round up token amounts', () => {
      const lpTokenAmount = 1n;
      const reserveA = 1000n;
      const reserveB = 1000n;
      const lpSupply = 3n;

      const { tokenAAmount, tokenBAmount } = calculateTokensForLp(lpTokenAmount, reserveA, reserveB, lpSupply);

      // 1 * 1000 / 3 = 333.33... should round up to 334
      expect(tokenAAmount).toBe(334n);
      expect(tokenBAmount).toBe(334n);
    });

    it('should throw on zero reserves', () => {
      expect(() => calculateTokensForLp(100n, 0n, 500_000n, 1000n)).toThrow();
      expect(() => calculateTokensForLp(100n, 1_000_000n, 0n, 1000n)).toThrow();
    });

    it('should throw on zero LP supply', () => {
      expect(() => calculateTokensForLp(100n, 1_000_000n, 500_000n, 0n)).toThrow();
    });
  });
});
