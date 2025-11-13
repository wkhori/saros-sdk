import { SarosAMMError } from './errors';

export function fromBaseUnit(value: string | number | bigint, decimals: number = 9): string {
      const valueStr = String(value);

  try {
    if (parseFloat(valueStr) === 0) return '0';

    const divisor = Math.pow(10, decimals);
    const result = parseFloat(valueStr) / divisor;

    return result.toString();
  } catch (_err) {
    throw SarosAMMError.InvalidTokenAmount(valueStr);
  }
}

export function toBaseUnit(value: string | number, decimals: number = 9): string {
  try {
    const valueStr = String(value);
    const multiplier = Math.pow(10, decimals);
    const result = parseFloat(valueStr) * multiplier;

    return result.toString().split('.')[0];
  } catch (_err) {
    throw SarosAMMError.InvalidTokenAmount(String(value));
  }
}

export const convertWeiToBalance = fromBaseUnit;
export const convertBalanceToWei = toBaseUnit;
