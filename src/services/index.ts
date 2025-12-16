import { PublicKey } from '@solana/web3.js';
import { SarosBaseService, type SarosAMMConfig } from './base';
import { SarosAMMPair } from './pair';
import type { CreatePairParams, CreatePairResult } from '../types';
import { SWAP_ACCOUNT_SIZE } from '../constants/config';
import { buildCreatePairTransaction } from './createPair';
import { SarosAMMError } from '../utils/errors';

const TOKEN_A_MINT_OFFSET = 131;
const TOKEN_B_MINT_OFFSET = TOKEN_A_MINT_OFFSET + 32;

/**
 * High-level Saros AMM class.
 * This class is the recommended entry point for protocol operations and
 * returns SarosAMMPair instances with state ready for use.
 */
export class SarosAMM extends SarosBaseService {
  constructor(config: SarosAMMConfig) {
    super(config);
  }

  /**
   * Create a new Saros AMM pool. 
   * Returns the transaction and helper metadata for signing and sending.
   */
  public async createPair(params: CreatePairParams): Promise<CreatePairResult> {
    try {
      return await buildCreatePairTransaction({
        connection: this.connection,
        ammProgram: this.ammProgram,
        params,
      });
    } catch (error) {
      SarosAMMError.handleError(error, SarosAMMError.PairCreationFailed());
    }
  }

  /**
   * Instantiate a SarosAMMPair for the provided pool address.
   */
  public async getPair(pairAddress: PublicKey): Promise<SarosAMMPair> {
    const pair = new SarosAMMPair(this.config, pairAddress);
    await pair.refreshState();
    return pair;
  }

  /**
   * Batch helper for fetching multiple pools in parallel.
   */
  public async getPairs(pairAddresses: PublicKey[]): Promise<SarosAMMPair[]> {
    return Promise.all(pairAddresses.map((address) => this.getPair(address)));
  }

  /**
   * Discover every Saros AMM pool on the configured cluster.
   */
  public async getAllPairAddresses(): Promise<string[]> {
    const accounts = await this.connection.getProgramAccounts(this.getDexProgramId(), {
      filters: [{ dataSize: SWAP_ACCOUNT_SIZE }],
    });
    return accounts.map((acc) => acc.pubkey.toBase58());
  }

  /**
   * Find pools that contain a token mint. Optionally restrict the search to a
   * specific pair by supplying mintB.
   */
  public async findPairs(mintA: PublicKey, mintB?: PublicKey): Promise<string[]> {
    const programId = this.getDexProgramId();
    const filters = [{ dataSize: SWAP_ACCOUNT_SIZE }];

    const [accountsX, accountsY] = await Promise.all([
      this.connection.getProgramAccounts(programId, {
        filters: [{ memcmp: { offset: TOKEN_A_MINT_OFFSET, bytes: mintA.toBase58() } }, ...filters],
      }),
      this.connection.getProgramAccounts(programId, {
        filters: [{ memcmp: { offset: TOKEN_B_MINT_OFFSET, bytes: mintA.toBase58() } }, ...filters],
      }),
    ]);

    const deduped = new Map<string, Buffer>();
    [...accountsX, ...accountsY].forEach((account) => {
      deduped.set(account.pubkey.toBase58(), account.account.data);
    });

    let matches = Array.from(deduped.entries());

    if (mintB) {
      matches = matches.filter(([, data]) => {
        const tokenAMint = new PublicKey(data.slice(TOKEN_A_MINT_OFFSET, TOKEN_A_MINT_OFFSET + 32));
        const tokenBMint = new PublicKey(data.slice(TOKEN_B_MINT_OFFSET, TOKEN_B_MINT_OFFSET + 32));

        return (
          (tokenAMint.equals(mintA) && tokenBMint.equals(mintB)) ||
          (tokenAMint.equals(mintB) && tokenBMint.equals(mintA))
        );
      });
    }

    return matches.map(([address]) => address);
  }
}
