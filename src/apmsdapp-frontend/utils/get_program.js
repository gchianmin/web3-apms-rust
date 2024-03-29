import * as anchor from "@project-serum/anchor";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { IDL, PROGRAM_ID } from "./const";

export function getProgramInstance(connection, wallet) {
  if (!wallet.publicKey) throw new WalletNotConnectedError();

  const provider = new anchor.Provider(
    connection,
    wallet,
    anchor.Provider.defaultOptions()
  );
  const idl = IDL;

  const programId = PROGRAM_ID;

  const program = new anchor.Program(idl, programId, provider);

  return program;
}
