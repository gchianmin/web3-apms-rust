import React from "react";
import Header from "../components/Header";
// import idl from "../idl.json";
import { IDL } from "../utils/const";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import {
  Program,
  AnchorProvider,
  web3,
  utils,
  BN,
} from "@project-serum/anchor";
import { useEffect, useState } from "react";
import CardComponent from "../components/CardComponent";
import { useRouter } from "next/router";

// This is the address of your solana program, if you forgot, just run solana address -k target/deploy/myepicproject-keypair.json
const programID = new PublicKey(IDL.metadata.address);

// Set our network to devnet.
const network = clusterApiUrl("devnet");

// Controls how we want to acknowledge when a transaction is "done". processed - only the node connected; finalize - to be very very sure
const opts = {
  preflightCommitment: "processed",
};

// SystemProgram is a reference to the Solana runtime!
const { SystemProgram } = web3;

export default function MyConference() {
  console.log("myconference page");
  const [conferences, setConferences] = useState([]);
  const [conferencesPDA, setConferencesPDA] = useState([]);
  const [walletAddress, setWalletAddress] = useState(null);

  const router = useRouter();

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new AnchorProvider(
      connection,
      window.solana,
      opts.preflightCommitment
    );
    return provider;
  };

  // getting user solana wallet
  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;
      if (solana) {
        if (solana.isPhantom) {
          console.log("Phantom wallet found");
          const response = await solana.connect({
            onlyIfTruested: true,
          });
          console.log(
            "Connected with public key",
            response.publicKey.toString()
          );
          setWalletAddress(response.publicKey.toString());
        }
      } else {
        alert("Solana object not found! Get a Phantom wallet");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    const { solana } = window;
    if (solana) {
      const response = await solana.connect();
      console.log("Connected with public key: ", response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };

  const getConferences = async () => {
    try {
      const provider = getProvider();
      //   const providerbuff = provider.wallet.publicKey.toBuffer()
      // console.log("providerwallet", provider.wallet.publicKey.toBuffer())

      //   console.log("provider", Buffer.from(walletAddress, "utf-8"))
      const program = new Program(IDL, programID, provider);
      const [conferencePDA, _] = await PublicKey.findProgramAddressSync(
        [
          utils.bytes.utf8.encode("CONFERENCE"),
          provider.wallet.publicKey.toBuffer(),
        ],
        program.programId
      );
      setConferencesPDA(conferencePDA);
      const conferenceInfo =
        await program.account.conferenceListAccountData.fetch(conferencePDA);
      setConferences(conferenceInfo);
    } catch (error) {
      console.log(error);
    }
  };

  const renderConferencesContainer = () => (
    <>
      <br />
      {conferences.conferences?.map((conference) => (
        <>
          <CardComponent props={conference} pk={conferencesPDA} />
          <br />
        </>
      )) ?? <p>loading...</p>}
    </>
  );

  const renderNotConnectedContainer = () => (
    <div className="pl-5 pb-3 font-italic text-muted">
      <p>Please connect your wallet first.</p>
      <div className="pt-3">
        <button
          onClick={
            connectWallet
          }
          type="button"
          className="btn btn-success "
        >
          {" "}
          Connect to Wallet{" "}
        </button>
      </div>
    </div>
  );

  const renderEmptyContainer = () => (
    <>
      <div className="pl-5 pb-3 font-italic text-muted text-mono">
        <p>You have not organise any conferences before</p>
      </div>
    </>
  );

  useEffect(() => {
    checkIfWalletIsConnected().then(res => getConferences())
  }, [router.isReady]);

  return (
    <>
      <Header props={`Conferences Organised`} />
      <div className="pl-5 pt-4 pb-3">
        <h2>Conferences Organised</h2>
        {/* {getConferences()} */}
        {walletAddress && conferences && renderConferencesContainer()}
      </div>
      {walletAddress && !conferences && renderEmptyContainer()}
      {!walletAddress && renderNotConnectedContainer()}
    </>
  );
}
