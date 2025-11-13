export enum SarosAMMErrorCode {
  InvalidTokenAmount = 'INVALID_TOKEN_AMOUNT',
  InvalidDecimals = 'INVALID_DECIMALS',
}

export class SarosAMMError extends Error {
  constructor(
    message: string,
    public code: SarosAMMErrorCode
  ) {
    super(message);
    this.name = 'SarosAMMError';
  }

  static InvalidTokenAmount(value?: string): SarosAMMError {
    const msg = value ? `Invalid token amount: ${value}` : 'Invalid token amount';
    return new SarosAMMError(msg, SarosAMMErrorCode.InvalidTokenAmount);
  }

  static InvalidDecimals(decimals?: number): SarosAMMError {
    const msg = decimals !== undefined ? `Invalid decimals: ${decimals}` : 'Invalid decimals';
    return new SarosAMMError(msg, SarosAMMErrorCode.InvalidDecimals);
  }
}