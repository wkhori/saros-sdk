import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';
import SarosSwapIDL from '../../constants/amm_idl.json';
import type { SarosSwap } from '../../constants/amm_idl';

export enum MODE {
  MAINNET = 'mainnet-beta',
  DEVNET = 'devnet',
  TESTNET = 'testnet',
}

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

    // Create program instance
    this.ammProgram = new Program(SarosSwapIDL as SarosSwap, provider);
  }

  public getDexName(): string {
    return 'Saros AMM';
  }

  public getDexProgramId(): PublicKey {
    return this.ammProgram.programId;
  }
}
