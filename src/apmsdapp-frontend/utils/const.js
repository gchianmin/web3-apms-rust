import idl from "./idl.json";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";

export const CLUSTER = "devnet"
export const SOLANA_NETWORK = clusterApiUrl("devnet");

export const PROGRAM_ID = new PublicKey(idl.metadata.address);

export const IDL = idl;