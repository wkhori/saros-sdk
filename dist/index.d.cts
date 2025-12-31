import { PublicKey, Transaction, Keypair, Connection } from '@solana/web3.js';
import { BN, Program } from '@coral-xyz/anchor';
import BN$1 from 'bn.js';

/**
 * AMM Pair account structure
 */
interface AMMPairAccount {
  version: number;
  isInitialized: boolean;
  bumpSeed: number;
  tokenProgramId: PublicKey;
  tokenA: PublicKey;
  tokenB: PublicKey;
  poolMint: PublicKey;
  tokenAMint: PublicKey;
  tokenBMint: PublicKey;
  poolFeeAccount: PublicKey;
  fees: Fees;
  swapCurve: SwapCurve;
}
/**
 * Fee structure for AMM pair
 */
interface Fees {
  tradeFeeNumerator: BN;
  tradeFeeDenominator: BN;
  ownerTradeFeeNumerator: BN;
  ownerTradeFeeDenominator: BN;
  ownerWithdrawFeeNumerator: BN;
  ownerWithdrawFeeDenominator: BN;
  hostFeeNumerator: BN;
  hostFeeDenominator: BN;
}
/**
 * Swap curve types
 */
declare enum SwapCurveType {
  ConstantProduct = 'ConstantProduct',
  ConstantPrice = 'ConstantPrice',
  Stable = 'Stable',
  Offset = 'Offset',
}
type SwapCurve =
  | {
      constantProduct: {};
    }
  | {
      constantPrice: {};
    }
  | {
      stable: {};
    }
  | {
      offset: {};
    };
/**
 * Pair metadata (includes current state + derived data)
 */
interface PairMetadata {
  pair: PublicKey;
  tokenX: TokenInfo;
  tokenY: TokenInfo;
  lpToken: TokenInfo;
  feeAccount: PublicKey;
  curve: SwapCurveType;
  fees: FeeMetadata;
}
interface TokenInfo {
  mint: PublicKey;
  decimals: number;
  reserve?: bigint;
}
interface FeeMetadata {
  tradeFee: number;
  ownerTradeFee: number;
  ownerWithdrawFee: number;
  hostFee: number;
}
/**
 * Parameters for creating a new AMM pair
 */
interface CreatePairParams {
  /** Payer and initial liquidity provider */
  payer: PublicKey;
  /** Fee recipient address (defaults to Saros fee owner) */
  feeOwner?: PublicKey;
  /** Token A mint address */
  tokenAMint: PublicKey;
  /** Token B mint address */
  tokenBMint: PublicKey;
  /** Initial amount of token A to deposit */
  initialTokenAAmount: bigint;
  /** Initial amount of token B to deposit */
  initialTokenBAmount: bigint;
  /** Swap curve type (ConstantProduct, Stable, etc.) */
  curveType: SwapCurveType;
}
/**
 * Result from pair creation
 */
interface CreatePairResult {
  /** Transaction to create the pair */
  transaction: Transaction;
  /** Pair account keypair (signer required) */
  pairKeypair: Keypair;
  /** LP token mint keypair (signer required) */
  lpMintKeypair: Keypair;
  /** Pool token A ATA address (derived from pool authority) */
  poolTokenA: PublicKey;
  /** Pool token B ATA address (derived from pool authority) */
  poolTokenB: PublicKey;
  /** Fee account ATA address (LP mint ATA owned by feeOwner) */
  feeAccount: PublicKey;
  /** Pair address */
  pairAddress: PublicKey;
  /** LP token mint address */
  lpTokenMint: PublicKey;
  /** Pair authority PDA */
  pairAuthority: PublicKey;
  /** Signers required for the transaction */
  signers: Keypair[];
}
/**
 * Parameters for adding liquidity to a pool
 */
interface AddLiquidityParams {
  /** Payer and liquidity provider */
  payer: PublicKey;
  /** Desired amount of LP tokens to receive */
  poolTokenAmount: bigint;
  /** Maximum amount of token A willing to deposit (slippage protection) */
  maximumTokenA: bigint;
  /** Maximum amount of token B willing to deposit (slippage protection) */
  maximumTokenB: bigint;
  /** Optional: User's token A account (defaults to ATA) */
  userTokenX?: PublicKey;
  /** Optional: User's token B account (defaults to ATA) */
  userTokenY?: PublicKey;
  /** Optional: User's LP token account (defaults to ATA) */
  userLpToken?: PublicKey;
  /** Optional: existing transaction to append to */
  transaction?: Transaction;
}
/**
 * Parameters for removing liquidity from a pool
 */
interface RemoveLiquidityParams {
  /** Payer and liquidity provider */
  payer: PublicKey;
  /** Amount of LP tokens to burn */
  poolTokenAmount: bigint;
  /** Minimum amount of token A to receive (slippage protection) */
  minimumTokenA: bigint;
  /** Minimum amount of token B to receive (slippage protection) */
  minimumTokenB: bigint;
  /** Optional: User's token A account (defaults to ATA) */
  userTokenX?: PublicKey;
  /** Optional: User's token B account (defaults to ATA) */
  userTokenY?: PublicKey;
  /** Optional: User's LP token account (defaults to ATA) */
  userLpToken?: PublicKey;
  /** Optional: existing transaction to append to */
  transaction?: Transaction;
}

/**
 * Supported network modes (devnet, mainnet)
 */
declare enum MODE {
  DEVNET = 'devnet',
  MAINNET = 'mainnet',
}
/**
 * Saros fee owner (legacy token-swap pools).
 */
declare const SAROS_FEE_OWNER: PublicKey;
/**
 * AMM Program IDs across networks
 * Note: Devnet version does not include latest pool metadata features.
 */
declare const AMM_PROGRAM_IDS: Record<MODE, PublicKey>;
/**
 * Farm Program IDs across networks
 * LP token farming and single token staking
 */
declare const FARM_PROGRAM_IDS: Record<MODE, PublicKey>;
/**
 * Legacy Saros swap account size.
 */
declare const SWAP_ACCOUNT_SIZE = 324;
/**
 * Default fees for AMM pairs.
 */
declare const DEFAULT_FEES: {
  tradeFeeNumerator: BN$1;
  tradeFeeDenominator: BN$1;
  ownerTradeFeeNumerator: BN$1;
  ownerTradeFeeDenominator: BN$1;
  ownerWithdrawFeeNumerator: BN$1;
  ownerWithdrawFeeDenominator: BN$1;
  hostFeeNumerator: BN$1;
  hostFeeDenominator: BN$1;
};
/**
 * Anchor-compatible curve type encoding
 * Used by AMM initialize instruction
 */
declare const CURVE_TYPE_MAP: Record<SwapCurveType, any>;
/**
 * Default swap calculator (32 bytes of zero).
 */
declare const DEFAULT_SWAP_CALCULATOR: number[];

/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `src/constants/idl/amm.json`.
 */
type SarosSwap = {
  address: 'SSwapUtytfBdBn1b9NUGG6foMVPtcWgpRU32HToDUZr';
  metadata: {
    name: 'sarosSwap';
    version: '2.2.0';
    spec: '2.2.0';
    description: 'Saros AMM';
  };
  instructions: [
    {
      name: 'initialize';
      discriminator: [0];
      accounts: [
        {
          name: 'swapInfo';
          writable: true;
          signer: true;
        },
        {
          name: 'authorityInfo';
        },
        {
          name: 'tokenAInfo';
        },
        {
          name: 'tokenBInfo';
        },
        {
          name: 'poolMintInfo';
          writable: true;
        },
        {
          name: 'feeAccountInfo';
          writable: true;
        },
        {
          name: 'destinationInfo';
          writable: true;
        },
        {
          name: 'tokenProgramInfo';
        },
      ];
      args: [
        {
          name: 'fees';
          type: {
            defined: {
              name: 'Fees';
            };
          };
        },
        {
          name: 'swapCurve';
          type: {
            defined: {
              name: 'SwapCurve';
            };
          };
        },
        {
          name: 'swapCalculator';
          type: {
            array: ['u8', 32];
          };
        },
      ];
    },
    {
      name: 'swap';
      discriminator: [1];
      accounts: [
        {
          name: 'swapInfo';
          writable: true;
        },
        {
          name: 'authorityInfo';
          writable: true;
        },
        {
          name: 'userTransferAuthorityInfo';
          writable: true;
          signer: true;
        },
        {
          name: 'sourceInfo';
          writable: true;
        },
        {
          name: 'swapSourceInfo';
          writable: true;
        },
        {
          name: 'swapDestinationInfo';
          writable: true;
        },
        {
          name: 'destinationInfo';
          writable: true;
        },
        {
          name: 'poolMintInfo';
          writable: true;
        },
        {
          name: 'poolFeeAccountInfo';
          writable: true;
        },
        {
          name: 'tokenProgramInfo';
        },
      ];
      args: [
        {
          name: 'amountIn';
          type: 'u64';
        },
        {
          name: 'minimumAmountOut';
          type: 'u64';
        },
      ];
    },
    {
      name: 'depositAllTokenTypes';
      discriminator: [2];
      accounts: [
        {
          name: 'swapInfo';
        },
        {
          name: 'authorityInfo';
        },
        {
          name: 'userTransferAuthorityInfo';
          writable: true;
          signer: true;
        },
        {
          name: 'sourceAInfo';
          writable: true;
        },
        {
          name: 'sourceBInfo';
          writable: true;
        },
        {
          name: 'tokenAInfo';
          writable: true;
        },
        {
          name: 'tokenBInfo';
          writable: true;
        },
        {
          name: 'poolMintInfo';
          writable: true;
        },
        {
          name: 'destInfo';
          writable: true;
        },
        {
          name: 'tokenProgramInfo';
        },
      ];
      args: [
        {
          name: 'poolTokenAmount';
          type: 'u64';
        },
        {
          name: 'maximumTokenAAmount';
          type: 'u64';
        },
        {
          name: 'maximumTokenBAmount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'withdrawAllTokenTypes';
      discriminator: [3];
      accounts: [
        {
          name: 'swapInfo';
        },
        {
          name: 'authorityInfo';
        },
        {
          name: 'userTransferAuthorityInfo';
          writable: true;
          signer: true;
        },
        {
          name: 'poolMintInfo';
          writable: true;
        },
        {
          name: 'sourceInfo';
          writable: true;
        },
        {
          name: 'tokenAInfo';
          writable: true;
        },
        {
          name: 'tokenBInfo';
          writable: true;
        },
        {
          name: 'destTokenAInfo';
          writable: true;
        },
        {
          name: 'destTokenBInfo';
          writable: true;
        },
        {
          name: 'poolFeeAccountInfo';
          writable: true;
        },
        {
          name: 'tokenProgramInfo';
        },
      ];
      args: [
        {
          name: 'poolTokenAmount';
          type: 'u64';
        },
        {
          name: 'minimumTokenAAmount';
          type: 'u64';
        },
        {
          name: 'minimumTokenBAmount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'swapExactOut';
      discriminator: [6];
      accounts: [
        {
          name: 'swapInfo';
          writable: true;
        },
        {
          name: 'authorityInfo';
          writable: true;
        },
        {
          name: 'userTransferAuthorityInfo';
          writable: true;
          signer: true;
        },
        {
          name: 'sourceInfo';
          writable: true;
        },
        {
          name: 'swapSourceInfo';
          writable: true;
        },
        {
          name: 'swapDestinationInfo';
          writable: true;
        },
        {
          name: 'destinationInfo';
          writable: true;
        },
        {
          name: 'poolMintInfo';
          writable: true;
        },
        {
          name: 'poolFeeAccountInfo';
          writable: true;
        },
        {
          name: 'tokenProgramInfo';
        },
      ];
      args: [
        {
          name: 'amountOut';
          type: 'u64';
        },
        {
          name: 'maximumAmountIn';
          type: 'u64';
        },
      ];
    },
  ];
  accounts: [
    {
      name: 'Pair';
      discriminator: [];
    },
  ];
  types: [
    {
      name: 'Pair';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'version';
            type: 'u8';
          },
          {
            name: 'isInitialized';
            type: 'bool';
          },
          {
            name: 'bumpSeed';
            type: 'u8';
          },
          {
            name: 'tokenProgramId';
            type: 'pubkey';
          },
          {
            name: 'tokenA';
            type: 'pubkey';
          },
          {
            name: 'tokenB';
            type: 'pubkey';
          },
          {
            name: 'poolMint';
            type: 'pubkey';
          },
          {
            name: 'tokenAMint';
            type: 'pubkey';
          },
          {
            name: 'tokenBMint';
            type: 'pubkey';
          },
          {
            name: 'poolFeeAccount';
            type: 'pubkey';
          },
          {
            name: 'fees';
            type: {
              defined: {
                name: 'Fees';
              };
            };
          },
          {
            name: 'swapCurve';
            type: {
              defined: {
                name: 'SwapCurve';
              };
            };
          },
        ];
      };
    },
    {
      name: 'Fees';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'tradeFeeNumerator';
            type: 'u64';
          },
          {
            name: 'tradeFeeDenominator';
            type: 'u64';
          },
          {
            name: 'ownerTradeFeeNumerator';
            type: 'u64';
          },
          {
            name: 'ownerTradeFeeDenominator';
            type: 'u64';
          },
          {
            name: 'ownerWithdrawFeeNumerator';
            type: 'u64';
          },
          {
            name: 'ownerWithdrawFeeDenominator';
            type: 'u64';
          },
          {
            name: 'hostFeeNumerator';
            type: 'u64';
          },
          {
            name: 'hostFeeDenominator';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'SwapCurve';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'ConstantProduct';
          },
          {
            name: 'ConstantPrice';
          },
          {
            name: 'Stable';
          },
          {
            name: 'Offset';
          },
        ];
      };
    },
  ];
};

interface SarosAMMConfig {
  mode: MODE;
  connection: Connection;
}
declare abstract class SarosBaseService {
  protected config: SarosAMMConfig;
  connection: Connection;
  ammProgram: Program<SarosSwap>;
  constructor(config: SarosAMMConfig);
  getDexName(): string;
  getDexProgramId(): PublicKey;
}

/**
 * Parameters for getting a swap quote
 */
interface QuoteParams {
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
interface QuoteResponse {
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
interface SwapParams {
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

interface PoolAccount {
  nonce: number;
  authorityNonce: number;
  stakingTokenMint: PublicKey;
  stakingTokenAccount: PublicKey;
  state: PoolState;
}
type PoolState =
  | {
      paused: {};
    }
  | {
      unpaused: {};
    };
interface StakeParams {
  payer: PublicKey;
  amount: bigint;
  userStakingTokenAccount?: PublicKey;
}
interface UnstakeParams {
  payer: PublicKey;
  amount: bigint;
  userStakingTokenAccount?: PublicKey;
}
interface ClaimRewardParams {
  payer: PublicKey;
  poolRewardAddress: PublicKey;
  userRewardTokenAccount?: PublicKey;
}
interface UserRewardPosition {
  poolRewardAddress: PublicKey;
  userPoolRewardAddress: PublicKey;
  rewardTokenMint: PublicKey;
  amount: bigint;
  rewardDebt: bigint;
  rewardPending: bigint;
  pendingRewards?: bigint;
}
interface UserPosition {
  userPoolAddress: PublicKey;
  stakedAmount: bigint;
  totalStaked: bigint;
  rewards: UserRewardPosition[];
}

/**
 * Saros public API response types (`api.saros.xyz`).
 *
 * These types are schema-coupled and may change if the API payload changes.
 * Prefer treating them as "best effort" shapes for convenience
 */
interface SarosAPIFarmInfo {
  isAmountBase: boolean;
  volume24h: number;
  feeAPR: number;
  rewards: Array<{
    poolRewardAddress: string;
    rewardTokenMint: string;
    rewardPerBlock: string;
    rewardTokenAccount: string;
    rewardEndBlock: string;
    totalShares: string;
    accumulatedRewardPerShare: string;
    lastUpdatedBlock: string;
    authorityAddress: string;
  }>;
  dataPoolInfo: {
    mint: string;
    owner: string;
    amount: string;
  };
  poolAddress: string;
  poolLpAddress?: string;
  startBlock: number;
  endBlock: number;
  lpInfo?: {
    address: string;
    supply: string;
    decimals: number;
    mintAuthority: string;
  };
  infoPoolLiquidity?: {
    lpTokenMint: string;
    token0Mint: string;
    token0Account: {
      mint: string;
      owner: string;
      amount: string;
      address: string;
    };
    token1Mint: string;
    token1Account: {
      mint: string;
      owner: string;
      amount: string;
      address: string;
    };
  };
}
interface SarosAPIStakeInfo {
  isAmountBase: boolean;
  volume24h: number;
  feeAPR: number;
  rewards: Array<{
    poolRewardAddress: string;
    rewardTokenMint: string;
    rewardPerBlock: string;
    rewardTokenAccount: string;
    rewardEndBlock: string;
    totalShares: string;
    accumulatedRewardPerShare: string;
    lastUpdatedBlock: string;
    authorityAddress: string;
  }>;
  dataPoolInfo: {
    mint: string;
    owner: string;
    amount: string;
  };
  poolAddress: string;
  startBlock: number;
  endBlock: number;
}

declare class SarosAMMPair extends SarosBaseService {
  private pairAddress;
  private pairAccount;
  private metadata;
  private poolAuthority?;
  constructor(config: SarosAMMConfig, pairAddress: PublicKey);
  /**
   * Get the pair address
   */
  getPairAddress(): PublicKey;
  /**
   * Get the pair account data
   */
  getPairAccount(): AMMPairAccount;
  /**
   * Get the pair metadata
   */
  getPairMetadata(): PairMetadata;
  /**
   * Fetch and refresh pair state from chain
   */
  refreshState(): Promise<void>;
  /**
   * Get a quote for a swap
   */
  getQuote(params: QuoteParams): Promise<QuoteResponse>;
  /**
   * Execute a swap transaction
   */
  swap(params: SwapParams): Promise<Transaction>;
  /**
   * Add liquidity to an existing pool
   *
   * Calculates required token amounts based on current pool ratios and creates
   * a transaction to deposit tokens and mint LP tokens.
   */
  addLiquidity(params: AddLiquidityParams): Promise<Transaction>;
  /**
   * Remove liquidity from a pool
   *
   * Burns LP tokens and withdraws proportional amounts of underlying tokens.
   */
  removeLiquidity(params: RemoveLiquidityParams): Promise<Transaction>;
  private buildPairMetadata;
  private getCurveType;
  private calculateFeePercentages;
}

/**
 * High-level Saros AMM class.
 * This class is the recommended entry point for protocol operations and
 * returns SarosAMMPair instances with state ready for use.
 */
declare class SarosAMM extends SarosBaseService {
  constructor(config: SarosAMMConfig);
  /**
   * Create a new Saros AMM pair.
   * Returns an unsigned transaction plus helper metadata for signing and sending.
   */
  createPair(params: CreatePairParams): Promise<CreatePairResult>;
  /**
   * Instantiate a SarosAMMPair for the provided pair address.
   */
  getPair(pairAddress: PublicKey): Promise<SarosAMMPair>;
  /**
   * Batch helper for fetching multiple pairs in parallel.
   */
  getPairs(pairAddresses: PublicKey[]): Promise<SarosAMMPair[]>;
  /**
   * Discover every Saros AMM pair on the configured cluster.
   */
  getAllPairAddresses(): Promise<string[]>;
  /**
   * Find pairs that contain a token mint. Optionally restrict the search to a
   * specific pair by supplying `mintB`.
   */
  findPairs(mintA: PublicKey, mintB?: PublicKey): Promise<string[]>;
}

/**
 * Pool type for API filtering only (farm vs stake).
 * On-chain, both use the same Pool account structure.
 */
type PoolType = 'farm' | 'stake';
/**
 * Unified farming service for both LP token farming and single token staking
 */
declare class SarosFarm {
  private config;
  private connection;
  private farmProgram;
  private poolAddress;
  private poolType;
  private poolAccount?;
  private apiInfo?;
  /**
   * Typed accessor for program accounts
   */
  private get accounts();
  constructor(config: SarosAMMConfig, poolAddress: PublicKey, poolType?: PoolType);
  /**
   * Refresh pool state from on-chain and API
   */
  refreshState(): Promise<void>;
  /**
   * Get raw API info (direct from Saros API)
   */
  getApiInfo(): SarosAPIFarmInfo | SarosAPIStakeInfo | undefined;
  /**
   * Get pool account
   */
  getPoolAccount(): PoolAccount;
  /**
   * Stake tokens into the pool
   *
   * @returns Transaction to be signed and sent by the user
   */
  stake(params: StakeParams): Promise<Transaction>;
  /**
   * Unstake tokens from the pool
   *
   * @returns Transaction to be signed and sent by the user
   */
  unstake(params: UnstakeParams): Promise<Transaction>;
  /**
   * Claim rewards from a specific pool reward
   *
   * @returns Transaction to be signed and sent by the user
   */
  claimReward(params: ClaimRewardParams): Promise<Transaction>;
  /**
   * Get user's staking position
   */
  getUserPosition(user: PublicKey): Promise<UserPosition>;
}

/**
 * Saros API client with automatic fallback handling
 */
declare class SarosAPIService {
  private static fetchWithFallback;
  /**
   * Fetch all farm information from Saros API
   * Returns null if API is unavailable
   */
  static getFarmInfo(page?: number, size?: number): Promise<SarosAPIFarmInfo[] | null>;
  /**
   * Fetch all stake information from Saros API
   * Returns null if API is unavailable
   */
  static getStakeInfo(page?: number, size?: number): Promise<SarosAPIStakeInfo[] | null>;
  /**
   * Fetch farm info for a specific pool address
   * Returns null if not found or API unavailable
   */
  static getFarmByPool(poolAddress: string): Promise<SarosAPIFarmInfo | null>;
  /**
   * Fetch stake info for a specific pool address
   * Returns null if not found or API unavailable
   */
  static getStakeByPool(poolAddress: string): Promise<SarosAPIStakeInfo | null>;
}

type SarosFarmIDL = {
  address: 'FARMr8rFJohG2CXFWKKmj8Z3XAhZNdYZ5CE3TKeWpump';
  metadata: {
    name: 'saros_farm';
    version: '0.1.0';
    spec: '0.1.0';
  };
  version: '0.1.0';
  name: 'saros_farm';
  instructions: [
    {
      name: 'createPool';
      accounts: [
        {
          name: 'root';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'Pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'poolPath';
          type: 'bytes';
        },
        {
          name: 'poolNonce';
          type: 'u8';
        },
        {
          name: 'poolAuthorityNonce';
          type: 'u8';
        },
        {
          name: 'stakingTokenMint';
          type: 'publicKey';
        },
      ];
    },
    {
      name: 'createPoolReward';
      accounts: [
        {
          name: 'root';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'Pool';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'PoolReward';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'rootRewardTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'poolRewardTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'poolRewardNonce';
          type: 'u8';
        },
        {
          name: 'poolRewardAuthorityNonce';
          type: 'u8';
        },
        {
          name: 'rewardTokenMint';
          type: 'publicKey';
        },
        {
          name: 'rewardPerBlock';
          type: 'u128';
        },
        {
          name: 'rewardStartBlock';
          type: 'u64';
        },
        {
          name: 'rewardEndBlock';
          type: 'u64';
        },
      ];
    },
    {
      name: 'setPausePool';
      accounts: [
        {
          name: 'root';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'Pool';
          isMut: true;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'isPause';
          type: 'bool';
        },
      ];
    },
    {
      name: 'setPauseRewardPool';
      accounts: [
        {
          name: 'root';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'PoolReward';
          isMut: true;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'isPause';
          type: 'bool';
        },
      ];
    },
    {
      name: 'createUserPool';
      accounts: [
        {
          name: 'user';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'Pool';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'userPool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'userPoolNonce';
          type: 'u8';
        },
      ];
    },
    {
      name: 'createUserPoolReward';
      accounts: [
        {
          name: 'user';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'PoolReward';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'userPoolReward';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'userPoolRewardNonce';
          type: 'u8';
        },
      ];
    },
    {
      name: 'stakePool';
      accounts: [
        {
          name: 'Pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'poolStakingTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'userPool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userStakingTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'stakePoolReward';
      accounts: [
        {
          name: 'Pool';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'PoolReward';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'userPool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userPoolReward';
          isMut: true;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'unstakePoolReward';
      accounts: [
        {
          name: 'Pool';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'PoolReward';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'userPool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userPoolReward';
          isMut: true;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'claimReward';
      accounts: [
        {
          name: 'PoolReward';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'poolRewardAuthority';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'poolRewardTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'userPoolReward';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userRewardTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'unstakePool';
      accounts: [
        {
          name: 'Pool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'poolAuthority';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'poolStakingTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'user';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'userPool';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'userStakingTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'updatePoolRewardParams';
      accounts: [
        {
          name: 'root';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'PoolReward';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'rootRewardTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'poolRewardTokenAccount';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'newRewardPerBlock';
          type: 'u128';
        },
        {
          name: 'newStartBlock';
          type: 'u64';
        },
        {
          name: 'newEndBlock';
          type: 'u64';
        },
      ];
    },
    {
      name: 'withdrawRewardToken';
      accounts: [
        {
          name: 'root';
          isMut: false;
          isSigner: true;
        },
        {
          name: 'PoolReward';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'authority';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'from';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'to';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'tokenProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        },
      ];
    },
  ];
  accounts: [
    {
      name: 'Pool';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'nonce';
            type: 'u8';
          },
          {
            name: 'authorityNonce';
            type: 'u8';
          },
          {
            name: 'stakingTokenMint';
            type: 'publicKey';
          },
          {
            name: 'stakingTokenAccount';
            type: 'publicKey';
          },
          {
            name: 'state';
            type: {
              defined: 'PoolState';
            };
          },
        ];
      };
    },
    {
      name: 'PoolReward';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'nonce';
            type: 'u8';
          },
          {
            name: 'authorityNonce';
            type: 'u8';
          },
          {
            name: 'rewardTokenMint';
            type: 'publicKey';
          },
          {
            name: 'rewardTokenAccount';
            type: 'publicKey';
          },
          {
            name: 'rewardPerBlock';
            type: 'u128';
          },
          {
            name: 'rewardEndBlock';
            type: 'u64';
          },
          {
            name: 'totalShares';
            type: 'u64';
          },
          {
            name: 'accumulatedRewardPerShare';
            type: 'u128';
          },
          {
            name: 'lastUpdatedBlock';
            type: 'u64';
          },
          {
            name: 'totalClaimed';
            type: 'u64';
          },
          {
            name: 'state';
            type: {
              defined: 'PoolState';
            };
          },
        ];
      };
    },
    {
      name: 'UserPool';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'nonce';
            type: 'u8';
          },
          {
            name: 'amount';
            type: 'u64';
          },
          {
            name: 'totalStaked';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'UserPoolReward';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'nonce';
            type: 'u8';
          },
          {
            name: 'amount';
            type: 'u64';
          },
          {
            name: 'rewardDebt';
            type: 'u64';
          },
          {
            name: 'rewardPending';
            type: 'u64';
          },
        ];
      };
    },
  ];
  types: [
    {
      name: 'TransferTokenParams';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'instruction';
            type: 'u8';
          },
          {
            name: 'amount';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'PoolState';
      type: {
        kind: 'enum';
        variants: [
          {
            name: 'Paused';
          },
          {
            name: 'Unpaused';
          },
        ];
      };
    },
  ];
  events: [
    {
      name: 'SetPausePoolEvent';
      fields: [
        {
          name: 'isPause';
          type: 'bool';
          index: false;
        },
      ];
    },
    {
      name: 'SetPauseRewardPoolEvent';
      fields: [
        {
          name: 'isPause';
          type: 'bool';
          index: false;
        },
      ];
    },
    {
      name: 'UpdatePoolRewardParamsEvent';
      fields: [
        {
          name: 'newRewardPerBlock';
          type: 'u128';
          index: false;
        },
        {
          name: 'newStartBlock';
          type: 'u64';
          index: false;
        },
        {
          name: 'newEndBlock';
          type: 'u64';
          index: false;
        },
      ];
    },
    {
      name: 'WithdrawRewardTokenEvent';
      fields: [
        {
          name: 'amount';
          type: 'u64';
          index: false;
        },
      ];
    },
  ];
  errors: [
    {
      code: 6000;
      name: 'InvalidOwner';
      msg: 'SarosFarm: Not an owner.';
    },
    {
      code: 6001;
      name: 'InvalidPoolLpTokenAccount';
      msg: 'SarosFarm: Invalid pool LP token account.';
    },
    {
      code: 6002;
      name: 'InvalidPoolRewardTokenAccount';
      msg: 'SarosFarm: Invalid reward token account.';
    },
    {
      code: 6003;
      name: 'InvalidWithdrawAmount';
      msg: 'SarosFarm: Invalid withdraw amount.';
    },
    {
      code: 6004;
      name: 'CantWithdrawNow';
      msg: 'SarosFarm: Cannot withdraw now.';
    },
    {
      code: 6005;
      name: 'TimeOverlap';
      msg: 'SarosFarm: Time overlap.';
    },
    {
      code: 6006;
      name: 'PoolWasPaused';
      msg: 'SarosFarm: Pool was paused.';
    },
    {
      code: 6007;
      name: 'UninitializedAccount';
      msg: 'SarosFarm: Uninitialized account.';
    },
  ];
};
declare const FARM_IDL: SarosFarmIDL;

/**
 * Calculate output amount for a constant product AMM swap
 * Formula: amountOut = (reserveOut * amountIn * feeMultiplier) / (reserveIn + amountIn * feeMultiplier)
 */
declare function calculateSwapOutput(
  amountIn: bigint,
  reserveIn: bigint,
  reserveOut: bigint,
  tradeFeeNumerator: bigint,
  tradeFeeDenominator: bigint
): bigint;
/**
 * Calculate price impact percentage
 */
declare function calculatePriceImpact(
  amountIn: bigint,
  amountOut: bigint,
  reserveIn: bigint,
  reserveOut: bigint
): number;
/**
 * Apply slippage to get minimum output
 */
declare function getMinOutputWithSlippage(amount: bigint, slippagePercent: number): bigint;

/**
 * AMM Pool PDA derivations
 */
declare function derivePoolAuthority(poolPubkey: PublicKey, programId: PublicKey): [PublicKey, number];
/**
 * Farm / Stake PDA derivations
 */
declare function deriveFarmUserPoolAddress(
  user: PublicKey,
  poolAddress: PublicKey,
  programId: PublicKey
): [PublicKey, number];
declare function deriveFarmUserPoolRewardAddress(
  user: PublicKey,
  poolReward: PublicKey,
  programId: PublicKey
): [PublicKey, number];
declare function deriveFarmPoolAuthority(poolAddress: PublicKey, programId: PublicKey): [PublicKey, number];
declare function deriveFarmPoolRewardAuthority(poolReward: PublicKey, programId: PublicKey): [PublicKey, number];

declare enum SarosAMMErrorCode {
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
declare class SarosAMMError extends Error {
  code: SarosAMMErrorCode;
  constructor(message: string, code: SarosAMMErrorCode);
  static InvalidTokenAmount(value?: string): SarosAMMError;
  static InvalidDecimals(decimals?: number): SarosAMMError;
  static PairNotInitialized(): SarosAMMError;
  static PairFetchFailed(): SarosAMMError;
  static PairCreationFailed(): SarosAMMError;
  static SwapFailed(): SarosAMMError;
  static AddLiquidityFailed(): SarosAMMError;
  static RemoveLiquidityFailed(): SarosAMMError;
  static QuoteCalculationFailed(): SarosAMMError;
  static ZeroAmount(): SarosAMMError;
  static InvalidSlippage(): SarosAMMError;
  static InsufficientLiquidity(): SarosAMMError;
  static PoolNotInitialized(): SarosAMMError;
  static PoolFetchFailed(poolType?: string): SarosAMMError;
  static handleError(error: any, fallback: SarosAMMError): never;
}

export {
  type AMMPairAccount,
  AMM_PROGRAM_IDS,
  type AddLiquidityParams,
  CURVE_TYPE_MAP,
  type ClaimRewardParams,
  type CreatePairParams,
  type CreatePairResult,
  DEFAULT_FEES,
  DEFAULT_SWAP_CALCULATOR,
  FARM_IDL,
  FARM_PROGRAM_IDS,
  type FeeMetadata,
  type Fees,
  MODE,
  type PairMetadata,
  type PoolAccount,
  type PoolState,
  type PoolType,
  type QuoteParams,
  type QuoteResponse,
  type RemoveLiquidityParams,
  SAROS_FEE_OWNER,
  SWAP_ACCOUNT_SIZE,
  SarosAMM,
  type SarosAMMConfig,
  SarosAMMError,
  SarosAMMErrorCode,
  SarosAMMPair,
  type SarosAPIFarmInfo,
  SarosAPIService,
  type SarosAPIStakeInfo,
  SarosBaseService,
  SarosFarm,
  type SarosFarmIDL,
  type SarosSwap,
  type StakeParams,
  type SwapCurve,
  SwapCurveType,
  type SwapParams,
  type TokenInfo,
  type UnstakeParams,
  type UserPosition,
  type UserRewardPosition,
  calculatePriceImpact,
  calculateSwapOutput,
  deriveFarmPoolAuthority,
  deriveFarmPoolRewardAuthority,
  deriveFarmUserPoolAddress,
  deriveFarmUserPoolRewardAddress,
  derivePoolAuthority,
  getMinOutputWithSlippage,
};
