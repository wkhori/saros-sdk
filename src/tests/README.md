# 🧪 Saros AMM SDK Tests

## Running Tests

```bash
# Run all tests
pnpm test

# Run AMM devnet integration tests only
pnpm test src/tests/integration/pair.test.ts src/tests/integration/pair.flow.test.ts

# Run a single test file
pnpm test src/tests/integration/pair.flow.test.ts
```

## Setup / Environment

- Tests load RPC URLs from `.env.test` via `vitest.config.ts`.
  - `DEVNET_RPC_URL` is used by the AMM integration tests.
  - `RPC_URL` is used by any mainnet-facing code paths (not required by the AMM integration tests).
- `src/tests/setup/wallet.ts` creates (or reuses) a persisted devnet wallet at `test-data/test-wallet.json` and funds it via airdrop when needed.
- `src/tests/setup/amm-token.ts` creates (or reuses) test mints + an AMM pool and persists them at `test-data/amm-test-tokens.json`.

To force a fresh environment, delete `test-data/test-wallet.json` and/or `test-data/amm-test-tokens.json`.

## Test Coverage

### Integration (Devnet)

- `src/tests/integration/pair.test.ts` – creates a pool (if needed), refreshes state, validates reserves/metadata decoding.
- `src/tests/integration/pair.flow.test.ts` – full on-chain flow: add liquidity → swap both directions → remove liquidity, with balance assertions.

### Unit

- `src/tests/unit/calculations.test.ts` – pure math utilities (no RPC/network).

## Notes

- Integration tests submit real transactions to devnet and will consume some SOL for fees/rent (rent is largely reclaimable, but not guaranteed if a test is interrupted).
- If you hit RPC rate limits (429) or a transient setup failure, run `pnpm test src/tests/integration/pair.test.ts` once first to create/cache the test mints + pool in `test-data/amm-test-tokens.json`, then rerun your full test command.
