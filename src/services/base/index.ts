import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';
import { AMM_PROGRAM_IDS, MODE } from '../../constants/config';
import SarosSwapIDL from '../../constants/amm_idl.json';
import type { SarosSwap } from '../../constants/idl/amm';

export interface SarosAMMConfig {
  mode: MODE;
  connection: Connection;
}

export abstract class SarosBaseService {
  protected config: SarosAMMConfig;
  connection: Connection;
  ammProgram!: Program<SarosSwap>;

  constructor(config: SarosAMMConfig) {
    this.config = config;
    this.connection = config.connection;

    const provider = new AnchorProvider(this.connection, {} as Wallet, AnchorProvider.defaultOptions());

    // Get program ID for the specified network
    const programId = AMM_PROGRAM_IDS[config.mode];

    // Create program instanceusing mainnet IDL and network-specific program ID
    this.ammProgram = new Program({ ...SarosSwapIDL, address: programId.toBase58() } as SarosSwap, provider);
  }

  public getDexName(): string {
    return 'Saros AMM';
  }

  public getDexProgramId(): PublicKey {
    return this.ammProgram.programId;
  }
}
