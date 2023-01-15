import { useRouter } from "next/router";
import Header from "../../components/Header";
import React from "react";
import {IDL} from "../../utils/const"
// import idl from "../../idl.json";
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

export default function ViewIndividualConferencePage() {
  const router = useRouter();
  const { conferenceid } = router.query;
  const [conferences, setConferences] = useState([]);
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

  const getDetails = () => {
    const conf = conferences.find(
      (element) => element.pubkey.toString() == conferenceid
    );
    if (conf) {
      return (
        <>
          <Card className="my-2">
            <CardImg
              alt="sample image"
              src="https://picsum.photos/900/180"
              top
              width="100%"
            />
            <CardBody>
              <CardTitle tag="h4">{conf.name}</CardTitle>
              <CardText>
                <small className="text-muted font-italic">
                  Conference ID: {conferenceid}
                </small>
              </CardText>
              <CardText className="lead">{conf.description}</CardText>
              <CardText>Date: {conf.date}</CardText>
              <CardText>Venue: {conf.venue}</CardText>
              <CardText>
                Paper Submission Deadline: {conf.submissionDeadline}
              </CardText>
            </CardBody>
            <CardFooter>
              <Popup cancelConference={cancelConference} modifyConference={modifyConference} walletAddress={walletAddress} connectWallet={connectWallet} existingDetails={conf} handleSubmit={handleSubmit}/>
              {/* <div className="d-flex justify-content-center d-grid col-5 mx-auto">
                <Popup/>
                <Button className="btn btn-block btn-primary mr-4 btn-alignment">
                  Edit
                </Button>
                <Button className="btn btn-block btn-danger mt-0 btn-alignment" onClick={cancelConference}>
                  Cancel
                </Button>
              </div> */}
            </CardFooter>
          </Card>
        </>
      );
    } else {
      return (
        <>
          <div className="pl-5 pt-4 pb-3">
            <h2>Conference Details</h2>
          </div>
          <div className="pl-5 pb-3 font-italic text-muted text-mono">
            <p>Something Wrong/The conference has been cancelled.</p>
          </div>
        </>
      );
    }
  };

  const cancelConference = async () => {
    try {
      const provider = getProvider();
      const program = new Program(IDL, programID, provider);
      const [conference, _] = await PublicKey.findProgramAddressSync(
        [
          utils.bytes.utf8.encode("CONFERENCE"),
          provider.wallet.publicKey.toBuffer(),
        ],
        program.programId
      );

      await program.rpc.cancel({
        accounts: {
          conference,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      });
      console.log("Deleted the conference w address: ", conference.toString());
      router.push('/main')
    } catch (error) {
      console.log("Error deleting conference account: ", error);
    }
  };

    const modifyConference = async (name,
      description,
      date,
      venue,
      deadlines) => {
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

      await program.rpc.modify(
        name, description, date, venue, deadlines,
        {
          accounts: {
            conference,
            user: provider.wallet.publicKey,
            systemProgram: SystemProgram.programId,
          },
        }
      );
      console.log("Modify the conference w address: ", conference.toString());
      window.location.reload()
    } catch (error) {
      console.log("Error modifying conference account: ", error);
    }
  };

  const handleSubmit = async (event) => {
    // Stop the form from submitting and refreshing the page.
    event.preventDefault();
    console.log("passed");
    // Get data from the form.
    const data = {
      // email: event.target.email.value,
      name: event.target.name.value,
      description: event.target.description.value,
      date: event.target.date.value,
      venue: event.target.venue.value,
      deadlines: event.target.deadlines.value,
      // image: event.target.image.value,
    };
    console.log(data);
    modifyConference(
      data.name,
      data.description,
      data.date,
      data.venue,
      data.deadlines
    );
  };

  useEffect(() => {
    getConferences();
    checkIfWalletIsConnected()
  }, []);

  return (
    <>
      <Header props={`Conference Details`} />
      <div>{getDetails()}</div>
    </>
  );
}
