export enum SarosAMMErrorCode {
  InvalidTokenAmount = 'INVALID_TOKEN_AMOUNT',
  InvalidDecimals = 'INVALID_DECIMALS',
  PairNotInitialized = 'PAIR_NOT_INITIALIZED',
  PairFetchFailed = 'PAIR_FETCH_FAILED',
  PairCreationFailed = 'PAIR_CREATION_FAILED',
  SwapFailed = 'SWAP_FAILED',
  AddLiquidityFailed = 'ADD_LIQUIDITY_FAILED',
  RemoveLiquidityFailed = 'REMOVE_LIQUIDITY_FAILED',
  QuoteCalculationFailed = 'QUOTE_CALCULATION_FAILED',
  ZeroAmount = 'ZERO_AMOUNT',
  InvalidSlippage = 'INVALID_SLIPPAGE',
  InsufficientLiquidity = 'INSUFFICIENT_LIQUIDITY',
  InvalidTokenAccount = 'INVALID_TOKEN_ACCOUNT',
  PoolNotInitialized = 'POOL_NOT_INITIALIZED',
  PoolFetchFailed = 'POOL_FETCH_FAILED',
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

  static PairNotInitialized(): SarosAMMError {
    return new SarosAMMError('Pair is not initialized', SarosAMMErrorCode.PairNotInitialized);
  }

  static PairFetchFailed(): SarosAMMError {
    return new SarosAMMError('Failed to fetch pair account', SarosAMMErrorCode.PairFetchFailed);
  }

  static PairCreationFailed(): SarosAMMError {
    return new SarosAMMError('Failed to create pair', SarosAMMErrorCode.PairCreationFailed);
  }

  static SwapFailed(): SarosAMMError {
    return new SarosAMMError('Failed to build swap transaction', SarosAMMErrorCode.SwapFailed);
  }

  static AddLiquidityFailed(): SarosAMMError {
    return new SarosAMMError('Failed to build add liquidity transaction', SarosAMMErrorCode.AddLiquidityFailed);
  }

  static RemoveLiquidityFailed(): SarosAMMError {
    return new SarosAMMError('Failed to build remove liquidity transaction', SarosAMMErrorCode.RemoveLiquidityFailed);
  }

  static QuoteCalculationFailed(): SarosAMMError {
    return new SarosAMMError('Failed to calculate quote', SarosAMMErrorCode.QuoteCalculationFailed);
  }

  static ZeroAmount(): SarosAMMError {
    return new SarosAMMError('Amount must be greater than zero', SarosAMMErrorCode.ZeroAmount);
  }

  static InvalidSlippage(): SarosAMMError {
    return new SarosAMMError('Slippage must be between 0 and 100', SarosAMMErrorCode.InvalidSlippage);
  }

  static InsufficientLiquidity(): SarosAMMError {
    return new SarosAMMError('Insufficient liquidity in pool', SarosAMMErrorCode.InsufficientLiquidity);
  }

  static PoolNotInitialized(): SarosAMMError {
    return new SarosAMMError('Pool state not loaded. Call refreshState() first', SarosAMMErrorCode.PoolNotInitialized);
  }

  static PoolFetchFailed(poolType: string = 'pool'): SarosAMMError {
    return new SarosAMMError(`Failed to refresh ${poolType} state`, SarosAMMErrorCode.PoolFetchFailed);
  }

  static handleError(error: any, fallback: SarosAMMError): never {
    if (error instanceof SarosAMMError) {
      throw error;
    }
    throw fallback;
  }
}
