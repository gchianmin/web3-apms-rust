import React from "react";
import Header from "../components/Header";
import { IDL, PROGRAM_ID, getProvider } from "../utils/const";
import { PublicKey } from "@solana/web3.js";
import {
  Program,
  utils,
} from "@project-serum/anchor";
import { useEffect, useState } from "react";
import CardComponent from "../components/CardComponent";
import { useRouter } from "next/router";
import { checkIfWalletIsConnected, connectWallet } from "../Common/WalletConnection";
import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import Loading from "../components/Loading";

function MyConference() {
  const [conferences, setConferences] = useState([]);
  const [conferencesPDA, setConferencesPDA] = useState([]);
  const [walletAddress, setWalletAddress] = useState(null);
  const router = useRouter();
  console.log(conferences)

  // get all conferences organised by a specific user according to wallet address
  const getConferencesList = async () => {
    try {
      const provider = getProvider();
      const program = new Program(IDL, PROGRAM_ID, provider);
      const [conferencePDA, _] = PublicKey.findProgramAddressSync(
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

  // if conferences list != null
  const renderConferencesContainer = () => (
    <>
      <br />
      {conferences.conferences?.map((conference) => (
        <>
          <CardComponent props={conference} pk={conferencesPDA} page="main"/>
          <br />
        </>
      )) ?? <div className="pb-3 font-italic text-muted text-mono">
      <p>You have not organised any conferences before</p>
    </div>}
    </>
  );

  // if not connected to a solana wallet
  const renderNotConnectedContainer = () => (
    <div className="pl-5 pb-3 font-italic text-muted">
      <p>Please connect your wallet first.</p>
      <div className="pt-3">
        <button
          onClick={() => setWalletAddress(connectWallet)}
          type="button"
          className="btn btn-success "
        >
          {" "}
          Connect to Wallet{" "}
        </button>
      </div>
    </div>
  );
  
  // if conferences list == null
  const renderEmptyContainer = () => (
    <>
      <div className="pl-5 pb-3 font-italic text-muted text-mono">
        <p>You have not organised any conferences before</p>
      </div>
    </>
  );

  useEffect(() => {
    checkIfWalletIsConnected()
      .then((res) => setWalletAddress(res))
      .then((response) => getConferencesList());
  }, [router.isReady]);

  return (
    <>
      <Header props={`Conferences Organised`} />
      <div className="pl-5 pt-4 pb-3">
        <h2>Conferences Organised</h2>
        {walletAddress && conferences && renderConferencesContainer()}
      </div>
      {walletAddress && conferences.count == 0 && renderEmptyContainer()}
      {!walletAddress && renderNotConnectedContainer()}
    </>
  );
}

export default withPageAuthRequired(MyConference);
