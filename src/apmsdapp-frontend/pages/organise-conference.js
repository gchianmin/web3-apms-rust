import React from "react";
import Header from "../components/Header";
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
import FormInput from "../components/FormInput";
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

// page for a user to create a conference
export default function OrganiseConference() {
  console.log("organise conference page");
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState(null);
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
        alert("Solana objject not found! Get a Phantom wallet");
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
//     const connection = new Connection(network, opts.preflightCommitment);
//     const provider = getProvider();
//     const program = new Program(idl, programID, provider);
//     // each program-derived account is wrapped in the promise
//     Promise.all(
//       (await connection.getProgramAccounts(programID)).map(
//         async (conference) => ({
//           ...(await program.account.conference.fetch(conference.pubkey)),
//           pubkey: conference.pubkey,
//         })
//       )
//     ).then((conferences) => setConferences(conferences));
//   };

  const createConference = async (
    name,
    description,
    date,
    venue,
    deadlines
  ) => {
    try {
      const provider = getProvider();
      const program = new Program(IDL, programID, provider);
      const [conference] = await PublicKey.findProgramAddressSync(
        [
          utils.bytes.utf8.encode("CONFERENCE"),
          provider.wallet.publicKey.toBuffer(),
        ],
        program.programId
      );

      await program.rpc.create(name, description, date, venue, deadlines, {
        accounts: {
          conference,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      });
      console.log(
        "Created a new conference w address: ",
        conference.toString()
      );
      router.push("/main")
    } catch (error) {
      console.log("Error creating conference account: ", error);
    }
  };

  // const modifyConference = async () => {
  //   try {
  //     const provider = getProvider();
  //     const program = new Program(idl, programID, provider);
  //     const [conference] = await PublicKey.findProgramAddressSync(
  //       [
  //         utils.bytes.utf8.encode("CONFERENCE"),
  //         provider.wallet.publicKey.toBuffer(),
  //       ],
  //       program.programId
  //     );

  //     await program.rpc.modify(
  //       "Edited ACM Conference",
  //       "A yearly conference for authors globally.",
  //       "2023-05-05 00:00:00",
  //       "Suntec Convention Centre",
  //       "2023-03-05 00:00:00",
  //       {
  //         accounts: {
  //           conference,
  //           user: provider.wallet.publicKey,
  //           systemProgram: SystemProgram.programId,
  //         },
  //       }
  //     );
  //     console.log("Modify the conference w address: ", conference.toString());
  //   } catch (error) {
  //     console.log("Error modifying conference account: ", error);
  //   }
  // };

  // const cancelConference = async () => {
  //   try {
  //     const provider = getProvider();
  //     const program = new Program(idl, programID, provider);
  //     const [conference, _] = await PublicKey.findProgramAddressSync(
  //       [
  //         utils.bytes.utf8.encode("CONFERENCE"),
  //         provider.wallet.publicKey.toBuffer(),
  //       ],
  //       program.programId
  //     );

  //     await program.rpc.cancel({
  //       accounts: {
  //         conference,
  //         user: provider.wallet.publicKey,
  //         systemProgram: SystemProgram.programId,
  //       },
  //     });
  //     console.log("Deleted the conference w address: ", conference.toString());
  //   } catch (error) {
  //     console.log("Error deleting conference account: ", error);
  //   }
  // };

  const handleSubmit = async (event) => {
    // Stop the form from submitting and refreshing the page.
    event.preventDefault();
    console.log("passed");
    // Get data from the form.
    const data = {
      email: event.target.email.value,
      name: event.target.name.value,
      description: event.target.description.value,
      date: event.target.date.value,
      venue: event.target.venue.value,
      deadlines: event.target.deadlines.value,
      // image: event.target.image.value,
    };
    console.log(data);
    createConference(
      data.name,
      data.description,
      data.date,
      data.venue,
      data.deadlines
    );
    
  };

  const renderNotConnectedContainer = () => (
    <div className="pl-5 pb-3 font-italic text-muted">
      <p>
        In order to organise a conference, please connect your wallet first.
      </p>
      <div className="pt-3">
        <button
          onClick={connectWallet}
          type="button"
          className="btn btn-success "
        >
          {" "}
          Connect to Wallet{" "}
        </button>
      </div>
    </div>
  );

  const renderConnectedContainer = () => (
    <>
      {/* <button onClick={createConference}>Create a conference</button> */}
      {/* <button onClick={getConferences}>Get a list of conferences</button> */}
      {/* <br /> */}
      {/* {conferences.map((conference) => (
        <>
          <p>Conference ID: {conference.pubkey.toString()}</p>
          <p>{conference.name}</p>
          <p>{conference.description}</p>
          <p>{conference.date}</p>
          <p>{conference.venue}</p>
          <p>{conference.submissionDeadline}</p>
          <br />
        </>
      ))} */}
      {/* <button onClick={modifyConference}>Update a conference</button>
      <button onClick={cancelConference}>Cancel a conference</button> */}
      <div className="pl-5 pb-3 font-italic text-muted">
        <p>Complete the following form to organise a conference.</p>
      </div>
      <FormInput handleSubmit={handleSubmit} empty={true}/>
    </>
  );

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return (
    <>
      <Header props={`Organise a Conference`} />
      <div className="pl-5 pt-4 pb-3">
        <h2>Organising a Conference</h2>
      </div>
      {!walletAddress && renderNotConnectedContainer()}
      {walletAddress && renderConnectedContainer()}
    </>
  );
}
