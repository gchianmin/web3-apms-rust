import React from "react";
import Header from "../components/Header";
import { useRouter } from "next/router";
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
import { Button } from "reactstrap";
import DynamicForm from "../components/DynamicForm";
import { useUser } from "@auth0/nextjs-auth0/client";
// import PaperList from "../components/PaperList";
import AccordionTable from "../components/AccordionTable";

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

export default function ViewPaper() {
  console.log("view paper page");
  const [papers, setPapers] = useState([]);
  const { user, error, isLoading } = useUser();
  const router = useRouter();
  const {
    query: { conferenceList, conferencePDA, conferenceName },
  } = router;
  const props = { conferenceList, conferencePDA, conferenceName };
  console.log(props);
  const [walletAddress, setWalletAddress] = useState(null);
  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new AnchorProvider(
      connection,
      window.solana,
      opts.preflightCommitment
    );
    return provider;
  };
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

  const deletePaper = async (paperId) => {
    try {
      const provider = getProvider();
      const program = new Program(IDL, programID, provider);
      //   const confid = getConferenceFromLists();
      const conferenceListPDA = new PublicKey(
        props.conferenceList
      );
      const data = await program.account.conferenceListAccountData.fetch(
        conferenceListPDA
      );
      //   console.log(conferenceInfo.conferences[0].id);
      let id = new PublicKey(
        props.conferencePDA
      );
    // paperId = "969e9f7f1f336a6309cd66080502c15d";

      await program.rpc.deletePaper(id, paperId, {
        accounts: {
          conferenceList: conferenceListPDA,
          user: provider.wallet.publicKey,
        },
      });
      await deleteFile(paperId, conferenceListPDA, id);
    } catch (error) {
      console.log("Error deleting paper: ", error);
    }
  };

  const deleteFile = async(paperId, conferenceListPDA, conferenceId) => {
    try {
        const formData = new FormData();
        formData.append("paperId", paperId);
        formData.append("conferenceListPDA", conferenceListPDA);
        formData.append("conferenceId", conferenceId);

      const response = await fetch("/api/filedelete", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        alert(`Error ${response.status}!! ${data.message}`)
        throw data.message;
      }

      alert("Paper Deleted Successfully.")
      window.location.reload();
      // router.push('/my-history')
    } catch (error) {
      console.log(error.message);
    }
  }

  const getPaper = async () => {
    try {
      const provider = getProvider();
      const program = new Program(IDL, programID, provider);
      //   const confid = getConferenceFromLists();
      const conferenceListPDA = new PublicKey(props.conferenceList);
      const data = await program.account.conferenceListAccountData.fetch(
        conferenceListPDA
      );

      //   let id = new PublicKey(
      //     props.conferencePDA
      //   );

      for (let i in data.conferences) {
        // console.log(data.conferences[i]);
        if (data.conferences[i].id == props.conferencePDA) {
            setPapers(data.conferences[i].paperSubmitted)
            break;
        }
      }
      console.log("ger",papers);
    } catch (error) {
      console.log("Error getting a paper : ", error);
    }
  };

  useEffect(() => {
    if (!router.isReady) return;
    checkIfWalletIsConnected();
    getPaper();
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
          {/* <DynamicForm user={user} submitPaper={submitPaper} props={props}/> */}
          {/* <FileUpload user={user}/> */}
        </div>
        {/* <Button onClick={getPaper}>Get</Button>{" "} */}
        
        {/* <Button onClick={deletePaper}>Delete</Button>{" "} */}
        {/* <Button onClick={getPaper}>Get</Button> */}
        <AccordionTable props={JSON.stringify(papers)} conference={props} deletePaper={deletePaper}/> 
      </div>
      {/* <PaperList props={JSON.stringify(papers)} conference={props} deletePaper={deletePaper}/> */}
      
    </>
  );
}
