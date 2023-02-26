import idl from "./idl.json";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { AnchorProvider, web3 } from "@project-serum/anchor";

export const SOLANA_NETWORK = clusterApiUrl("devnet");

export const PROGRAM_ID = new PublicKey(idl.metadata.address);

export const IDL = idl;

export const OPTS = {
  preflightCommitment: "processed",
};

export const getProvider = () => {
  const connection = new Connection(SOLANA_NETWORK, OPTS.preflightCommitment);
  const provider = new AnchorProvider(
    connection,
    window.solana,
    OPTS.preflightCommitment
  );
  return provider;
};

export const { SYSTEM_PROGRAM } = web3;

export const MAX_FILE_SIZE = 5 * 1024 * 1024;