import * as borsh from '@coral-xyz/borsh';
import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { AMMPairAccount } from '../types';

/**
 * Manual Borsh decoder for legacy Anchor programs without discriminators.
 * ❌ The Saros AMM program does NOT use Anchor discriminators - MUST use manual decoder
 * Anchor's `.fetch()` method will fail because it expects the discriminator.
 */

interface DecodedTokenSwap {
  version: number;
  isInitialized: number;
  bumpSeed: number;
  tokenProgramId: any; // Will be converted to PublicKey
  tokenAccountA: any;
  tokenAccountB: any;
  tokenPool: any;
  mintA: any;
  mintB: any;
  feeAccount: any;
  tradeFeeNumerator: bigint;
  tradeFeeDenominator: bigint;
  ownerTradeFeeNumerator: bigint;
  ownerTradeFeeDenominator: bigint;
  ownerWithdrawFeeNumerator: bigint;
  ownerWithdrawFeeDenominator: bigint;
  hostFeeNumerator: bigint;
  hostFeeDenominator: bigint;
  curveType: number;
  curveParameters: number[];
}

// Define Pair account structure matching the on-chain data layout
const tokenSwapLayout = borsh.struct<DecodedTokenSwap>([
  borsh.u8('version'),
  borsh.u8('isInitialized'),
  borsh.u8('bumpSeed'),
  borsh.publicKey('tokenProgramId'),
  borsh.publicKey('tokenAccountA'), // tokenA
  borsh.publicKey('tokenAccountB'), // tokenB
  borsh.publicKey('tokenPool'), // poolMint
  borsh.publicKey('mintA'), // tokenAMint
  borsh.publicKey('mintB'), // tokenBMint
  borsh.publicKey('feeAccount'), // poolFeeAccount
  borsh.u64('tradeFeeNumerator'),
  borsh.u64('tradeFeeDenominator'),
  borsh.u64('ownerTradeFeeNumerator'),
  borsh.u64('ownerTradeFeeDenominator'),
  borsh.u64('ownerWithdrawFeeNumerator'),
  borsh.u64('ownerWithdrawFeeDenominator'),
  borsh.u64('hostFeeNumerator'),
  borsh.u64('hostFeeDenominator'),
  borsh.u8('curveType'),
  borsh.vecU8('curveParameters'),
]);

/**
 * Decode a Pair account from raw account data.
 * Does not expect or validate discriminators.
 */
export function decodePairAccount(data: Buffer): AMMPairAccount {
  try {
    const decoded = tokenSwapLayout.decode(data);

    // Transform the flat structure into the expected AMMPairAccount format
    // Convert bigint to BN for compatibility with Anchor types
    // Ensure PublicKey instances are properly constructed
    return {
      version: decoded.version,
      isInitialized: decoded.isInitialized !== 0,
      bumpSeed: decoded.bumpSeed,
      tokenProgramId: new PublicKey(decoded.tokenProgramId),
      tokenA: new PublicKey(decoded.tokenAccountA),
      tokenB: new PublicKey(decoded.tokenAccountB),
      poolMint: new PublicKey(decoded.tokenPool),
      tokenAMint: new PublicKey(decoded.mintA),
      tokenBMint: new PublicKey(decoded.mintB),
      poolFeeAccount: new PublicKey(decoded.feeAccount),
      fees: {
        tradeFeeNumerator: new BN(decoded.tradeFeeNumerator.toString()),
        tradeFeeDenominator: new BN(decoded.tradeFeeDenominator.toString()),
        ownerTradeFeeNumerator: new BN(decoded.ownerTradeFeeNumerator.toString()),
        ownerTradeFeeDenominator: new BN(decoded.ownerTradeFeeDenominator.toString()),
        ownerWithdrawFeeNumerator: new BN(decoded.ownerWithdrawFeeNumerator.toString()),
        ownerWithdrawFeeDenominator: new BN(decoded.ownerWithdrawFeeDenominator.toString()),
        hostFeeNumerator: new BN(decoded.hostFeeNumerator.toString()),
        hostFeeDenominator: new BN(decoded.hostFeeDenominator.toString()),
      },
      swapCurve: decodeCurveType(decoded.curveType),
    };
  } catch (error) {
    throw new Error(`Failed to decode Pair account: ${error}`);
  }
}

/**
 * Decode curve type from u8 to enum variant
 */
function decodeCurveType(curveType: number): any {
  switch (curveType) {
    case 0:
      return { constantProduct: {} };
    case 1:
      return { constantPrice: {} };
    case 2:
      return { stable: {} };
    case 3:
      return { offset: {} };
    default:
      return { constantProduct: {} };
  }
}
