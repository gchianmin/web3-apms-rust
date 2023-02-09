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

export default function SubmitPaper() {
  const { user, error, isLoading } = useUser();
  console.log("submit papaer page");
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
  //   const getConferences = async () => {
  //     const provider = getProvider();
  //     const program = new Program(IDL, programID, provider);
  //     const conferenceInfo =
  //       await program.account.conferenceListAccountData.all();
  //     setConferences(conferenceInfo);
  //   };

//   const submitPaper = async () => {
//     try {
//       const provider = getProvider();
//       const program = new Program(IDL, programID, provider);

//       const conferencePDA = new PublicKey(
//         "EJ2KoVBXzhLE8XefxwSQ21zWNTGxuVvDxjG2D7DpcySC"
//       );
//       const data = await program.account.conferenceListAccountData.fetch(
//         conferencePDA
//       );
//       //   console.log(data.conferences[0].id);
//       let id = data.conferences[0].id;
//       let paperId = "example hash";
//       let authorName = ["A1", "A2"];
//       let authorEmail = ["E1", "E2"];
//       let dateSubmitted = "2023-02-05";
//       let paperStatus = "Submitted";
//       let version = new BN(1);
//       await program.rpc.submitPaper(
//         id,
//         paperId,
//         { authorName, authorEmail },
//         dateSubmitted,
//         paperStatus,
//         version,
//         {
//           accounts: {
//             conferenceList: conferencePDA,
//             user: provider.wallet.publicKey,
//           },
//         }
//       );
//     } catch (error) {
//       console.log("Error submitting a paper : ", error);
//     }
//   };
const submitPaper = async (paperId, authorName, authorEmail, dateSubmitted, paperStatus, version) => {
    try {
      const provider = getProvider();
      const program = new Program(IDL, programID, provider);

      const conferenceListPDA = new PublicKey(
        props.conferenceList
      );

      const data = await program.account.conferenceListAccountData.fetch(
        conferenceListPDA
      );
      
      let id = new PublicKey(
        props.conferencePDA
      );
    //   console.log(id.toString()==props.conferencePDA)
    //   let paperId = "example hash";
    //   let authorName = ["A1", "A2"];
    //   let authorEmail = ["E1", "E2"];
    //   let dateSubmitted = "2023-02-05";
    //   let paperStatus = "Submitted";
    //   let version = new BN(1);
      await program.rpc.submitPaper(
        id,
        paperId,
        {authorName, authorEmail},
        dateSubmitted,
        paperStatus,
        version,
        {
          accounts: {
            conferenceList: conferenceListPDA,
            user: provider.wallet.publicKey,
          },
        }
      );
    } catch (error) {
      console.log("Error submitting a paper : ", error);
    }
  };

  const deletePaper = async () => {
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
      let paperId = "969e9f7f1f336a6309cd66080502c15d";

      await program.rpc.deletePaper(id, paperId, {
        accounts: {
          conferenceList: conferenceListPDA,
          user: provider.wallet.publicKey,
        },
      });
      await deleteFile();
    } catch (error) {
      console.log("Error deleting paper: ", error);
    }
  };

  const deleteFile = async() => {
    try {
      const response = await fetch("/api/filedelete", {
        // method: "POST",
        // body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        alert(`Error ${response.status}!! ${data.message}`)
        throw data.message;
      }

      alert("Paper Deleted Successfully.")
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
      const conferenceListPDA = new PublicKey(
        props.conferenceList
      );
      const data = await program.account.conferenceListAccountData.fetch(
        conferenceListPDA
      );
      console.log(data.conferences);
    } catch (error) {
      console.log("Error getting a paper : ", error);
    }
  };

  useEffect(() => {
    if (!router.isReady) return;
    checkIfWalletIsConnected();
  }, [router.isReady]);

  return (
    <>
      <Header props={`Submit A Paper`} />
      <div className="pl-5 pt-4 pb-3">
        <h2>Submit a paper</h2>
        <div>
        <p className="pt-2">
          You are submitting a paper to conference:{" "}
          <em>
            <b>{props.conferenceName}</b>
          </em>
          </p>
        </div>
          <div className="pt-4">
            <DynamicForm user={user} submitPaper={submitPaper} props={props}/>
            {/* <FileUpload user={user}/> */}
          </div>
          {/* <Button onClick={submitPaper}>Submit</Button>{" "} */}
          <Button onClick={deletePaper}>Delete</Button>{" "}
          {/* <Button onClick={getPaper}>Get</Button> */}
        
      </div>
    </>
  );
}
