import React from "react";
import Header from "../components/Header";
import { useRouter } from "next/router";
import { IDL } from "../utils/const";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import {
  Program,
  AnchorProvider,
  web3,
} from "@project-serum/anchor";
import { useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import {
  checkIfWalletIsConnected,
  connectWallet,
} from "../Common/WalletConnection";
import AccordionTable from "../components/AccordionTable";
import { getPaper } from "../Common/GetPapers";
// import ApiCallers from "../Common/ApiCallers";

// // This is the address of your solana program, if you forgot, just run solana address -k target/deploy/myepicproject-keypair.json
// const programID = new PublicKey(IDL.metadata.address);

// // Set our network to devnet.
// const network = clusterApiUrl("devnet");

// // Controls how we want to acknowledge when a transaction is "done". processed - only the node connected; finalize - to be very very sure
// const opts = {
//   preflightCommitment: "processed",
// };

// SystemProgram is a reference to the Solana runtime!
// const { SystemProgram } = web3;

export default function ViewPaper() {
  // console.log("view paper page");
  const [papers, setPapers] = useState([]);
  // const { user, error, isLoading } = useUser();
  const router = useRouter();
  const {
    query: { conferencePDA, conferenceId, conferenceName },
  } = router;
  const props = { conferencePDA, conferenceId, conferenceName };
  const [walletAddress, setWalletAddress] = useState(null);

  useEffect(() => {
    if (!router.isReady) return;
    checkIfWalletIsConnected().then((res) => setWalletAddress(res));
    getPaper(props.conferencePDA, props.conferenceId).then(res => setPapers(res));
  }, [router.isReady]);

  return (
    <>
      <Header props={`Papers Submitted`} />
      <div className="pl-5 pt-4 pb-3">
        <h2>Papers Submitted</h2>
        <div>
          <p className="pt-2">
            You are viewing papers submitted to your conference:{" "}
            <em>
              <b>{props.conferenceName}</b>
            </em>
          </p>
        </div>
        <div className="pt-4">
        </div>
        <AccordionTable 
        props={JSON.stringify(papers)} 
        conference={props}  walletAddress={walletAddress} 
        /> 
      </div>

    </>
  );
}
