import React from "react";
import Header from "../components/Header";
// import idl from "../idl.json";
import {IDL} from "../utils/const"
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import {
  Program,
  AnchorProvider,
  web3,
  utils,
  BN,
} from "@project-serum/anchor";
import { useEffect, useState } from "react";
import { Buffer } from "buffer";
import CardComponent from "../components/CardComponent";

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

// a page where all the conference organised are listed
export default function Main() {
  console.log("main page called");
  const [conferences, setConferences] = useState([]);

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new AnchorProvider(
      connection,
      window.solana,
      opts.preflightCommitment
    );
    return provider;
  };

  const getConferences = async () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = getProvider();
    const program = new Program(IDL, programID, provider);
    // each program-derived account is wrapped in the promise
    Promise.all(
      (await connection.getProgramAccounts(programID)).map(
        async (conference) => ({
          ...(await program.account.conference.fetch(conference.pubkey)),
          pubkey: conference.pubkey,
        })
      )
    ).then((conferences) => setConferences(conferences));
  };

  const renderConferencesContainer = () => (
    <>
      <br />
      {conferences.map((conference) => (
        <>
          <CardComponent props={conference} />
          <br />
        </>
      ))}
    </>
  );

  const renderEmptyContainer = () => (
    <>
      <div className="pl-5 pb-3 font-italic text-muted text-mono">
        <p>No upcoming conferences at the moment. Please check back later!</p>
      </div>
    </>
  );
  useEffect(() => {
    getConferences();
    // const onLoad = async () => {
    //   await getConferences();
    // };
    // window.addEventListener("load", onLoad);
    // return () => window.removeEventListener("load", onLoad);
  }, []);

  return (
    <>
      <Header props={`APMS - Home`} />
      <div className="pl-5 pt-4 pb-3">
        <h2>Upcoming Conferences</h2>
        {conferences && renderConferencesContainer()}
      </div>
      {conferences.length == 0 && renderEmptyContainer()}
    </>
  );
}
