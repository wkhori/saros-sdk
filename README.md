# Saros AMM SDK

The engine that powers Saros AMM pools on Solana.

## Installation

```bash
pnpm add @saros-finance/amm-sdk
```

```bash
yarn add @saros-finance/amm-sdk
```

```bash
npm install @saros-finance/amm-sdk
```

### Core Components

- **`SarosAMM`** - Factory class for protocol-level operations (creating pools, discovering pools, fetching pairs)
- **`SarosAMMPair`** - Pair instance class with operations for a specific pool (quotes, swaps, liquidity ops)
- **`SarosFarm`** - Unified farm + stake service (LP farms + single-token staking)

## Quick Start

### Initialize the SDK

```typescript
import { Connection } from '@solana/web3.js';
import { SarosAMM, MODE } from '@saros-finance/amm-sdk';

const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');

const sdk = new SarosAMM({
  mode: MODE.MAINNET, // or MODE.DEVNET
  connection,
});
```

## Getting Pool Metadata

```typescript
import { PublicKey } from '@solana/web3.js';

const pairAddress = new PublicKey('HmQL6eECoaGLWvTxz6cWT3jEsPfjdin2vNVJ1xKiwjXz'); // BONK/SAROS
const pair = await sdk.getPair(pairAddress);

const { tokenX, tokenY, fees, curve } = pair.getPairMetadata();

console.log({
  tokenX: tokenX.mint.toBase58(),
  tokenY: tokenY.mint.toBase58(),
  decimalsX: tokenX.decimals,
  decimalsY: tokenY.decimals,
  reserveX: tokenX.reserve?.toString(),
  reserveY: tokenY.reserve?.toString(),
  curve,
  tradeFeePct: fees.tradeFee,
});
```

## Creating a New Pool

`createPair()` returns a transaction and the required signers; it does not submit anything to the chain.

```typescript
import { PublicKey } from '@solana/web3.js';
import { SwapCurveType } from '@saros-finance/amm-sdk';

const { transaction, pairAddress, lpTokenMint, signers } = await sdk.createPair({
  payer: wallet.publicKey,
  tokenAMint: new PublicKey('TOKEN_A_MINT_ADDRESS'),
  tokenBMint: new PublicKey('TOKEN_B_MINT_ADDRESS'),
  initialTokenAAmount: 1_000_000n, // base units
  initialTokenBAmount: 1_000_000n, // base units
  curveType: SwapCurveType.ConstantProduct,
});

// Sign + send with your wallet adapter plus the additional signers returned.
// The exact send method depends on your wallet stack.
// const sig = await connection.sendTransaction(transaction, [walletAdapter, ...signers]);
// await connection.confirmTransaction(sig, 'confirmed');

console.log(`Pool created: ${pairAddress.toBase58()}`);
console.log(`LP mint: ${lpTokenMint.toBase58()}`);
```

## Swapping Tokens

### Get a Quote

```typescript
const quote = await pair.getQuote({
  amount: 1_000_000n, // base units
  swapForY: true, // true = X→Y, false = Y→X
  slippage: 1, // 1% slippage tolerance
});

console.log({
  amountIn: quote.amountIn,
  amountOut: quote.amountOut,
  minAmountOut: quote.minAmountOut,
  priceImpact: quote.priceImpact,
});
```

### Execute Swap

```typescript
const swapTx = await pair.swap({
  payer: wallet.publicKey,
  amount: quote.amountIn,
  minAmountOut: quote.minAmountOut,
  swapForY: true,
});

// const sig = await connection.sendTransaction(swapTx, [walletAdapter]);
// await connection.confirmTransaction(sig, 'confirmed');
```

## Providing Liquidity

```typescript
const addTx = await pair.addLiquidity({
  payer: wallet.publicKey,
  poolTokenAmount: 1_000_000_000n, // desired LP tokens (base units)
  maximumTokenA: 10_000_000n,
  maximumTokenB: 10_000_000n,
});

// const sig = await connection.sendTransaction(addTx, [walletAdapter]);
// await connection.confirmTransaction(sig, 'confirmed');
```

## Removing Liquidity

```typescript
const removeTx = await pair.removeLiquidity({
  payer: wallet.publicKey,
  poolTokenAmount: 1_000_000_000n, // LP tokens to burn (base units)
  minimumTokenA: 1n,
  minimumTokenB: 1n,
});

// const sig = await connection.sendTransaction(removeTx, [walletAdapter]);
// await connection.confirmTransaction(sig, 'confirmed');
```

## Pool Discovery

```typescript
import { PublicKey } from '@solana/web3.js';

// Get all pool addresses
const allPools = await sdk.getAllPairAddresses();

// Find pools for a token
const sarosPools = await sdk.findPairs(new PublicKey('SarosY6Vscao718M4A778z4CGtvcwcGef5M9MEH1LGL'));

// Find pools for a token pair
const bonkSarosPools = await sdk.findPairs(
  new PublicKey('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'), // BONK
  new PublicKey('SarosY6Vscao718M4A778z4CGtvcwcGef5M9MEH1LGL') // SAROS
);

// Fetch multiple pairs at once
const pairs = await sdk.getPairs([new PublicKey('PAIR_1'), new PublicKey('PAIR_2')]);
```

## Farming / Staking

```typescript
import { PublicKey } from '@solana/web3.js';
import { SarosFarm } from '@saros-finance/amm-sdk';

const farm = new SarosFarm({ mode: MODE.MAINNET, connection }, new PublicKey('FARM_POOL_ADDRESS'), 'farm');
await farm.refreshState();

const stakeTx = await farm.stake({
  payer: wallet.publicKey,
  amount: 1_000_000n, // base units
});
```

## Additional Resources

[💬 Join the Saros Dev Station (Telegram)](https://t.me/+mWrfsbbd3Q42YzYx)
