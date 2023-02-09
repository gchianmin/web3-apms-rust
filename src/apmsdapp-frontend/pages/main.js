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
import { Buffer } from "buffer";
import CardComponent from "../components/CardComponent";
import { Button } from "reactstrap";
import Link from 'next/link';
import Router, { useRouter } from "next/router";

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
    const provider = getProvider();
    const program = new Program(IDL, programID, provider);
    const conferenceInfo =
      await program.account.conferenceListAccountData.all();
    setConferences(conferenceInfo);
    console.log(conferenceInfo)
  };


  const renderConferencesContainer = () => (
    <>
      <br />
      {Object.keys(conferences).map((key) =>
        [key, conferences[key].account][1].conferences.map((conf) => (
          <>
            <CardComponent props={conf} pk={conferences[key].publicKey} />
            <br />
          </>
        ))
      )}
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
  }, []);

  return (
    <>
      <Header props={`APMS - Home`} />
      <div className="pl-5 pt-4 pb-3">
        <h2>Upcoming Conferences</h2>
        <Link className="my-4 font-italic text-success" href='/my-conference'><br/> → View Conferences Organised by me ← <br/></Link>
        {conferences && renderConferencesContainer()}
      </div>
      {conferences.length == 0 && renderEmptyContainer()}
    </>
  );
}
