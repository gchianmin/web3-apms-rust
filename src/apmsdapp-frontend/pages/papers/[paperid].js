import Router, { useRouter } from "next/router";
import Header from "../../components/Header";
import React from "react";
import { IDL } from "../../utils/const";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import {
  Program,
  AnchorProvider,
  web3,
  utils,
  BN,
} from "@project-serum/anchor";
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  CardText,
  CardImg,
  CardFooter,
} from "reactstrap";
import Popup from "../../components/Popup";
import Link from "next/link";
// import TpcForm from "../../components/TpcForm";

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

export default function ViewIndividualPaperPage() {
  console.log("enter individual paper page");
//   const [conferences, setConferences] = useState([]);
  const [query, setQuery] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const router = useRouter();
  const { paperid } = router.query;

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
      // if solana && solana.isPhantom
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

//   const getConferences = async () => {
//     const provider = getProvider();
//     const program = new Program(IDL, programID, provider);
//     const conferenceInfo =
//       await program.account.conferenceListAccountData.all();
//     setConferences(conferenceInfo);
//   };

//   const getConferenceFromLists = () => {
//     try {
//       const conf = conferences.find(
//         (element) => element.publicKey.toString() == query[0]
//       );

//       let confid;

//       for (let i in conf.account.conferences) {
//         console.log(conf.account.conferences[i]);
//         if (conf.account.conferences[i].id == query[1]) {
//           confid = conf.account.conferences[i]; // straight return
//         }
//       }
//       return confid;
//     } catch (error) {
//       console.log(error);
//     }
//   };


  

  
  useEffect(() => {
    if (!router.isReady) return;
    setQuery(paperid.split("-"));
    // getConferences();
    checkIfWalletIsConnected();
  }, [router.isReady]);

  return (
    <>
      <Header props={`Paper Details`} />
      {/* <div>{getDetails()}</div> */}
    </>
  );
}
