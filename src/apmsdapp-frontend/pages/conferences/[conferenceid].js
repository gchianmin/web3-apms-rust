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
  console.log("enter individual page");
  const [conferences, setConferences] = useState([]);
  const [query, setQuery] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const router = useRouter();
  const { conferenceid } = router.query;

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

  const getConferences = async () => {
    const provider = getProvider();
    const program = new Program(IDL, programID, provider);
    const conferenceInfo =
      await program.account.conferenceListAccountData.all();
    setConferences(conferenceInfo);
  };

  const getConferenceFromLists = () => {
    try {
      const conf = conferences.find(
        (element) => element.publicKey.toString() == query[0]
      );

      let confid;

      for (let i in conf.account.conferences) {
        console.log(conf.account.conferences[i]);
        if (conf.account.conferences[i].id == query[1]) {
          confid = conf.account.conferences[i]; // straight return 
        }
      }
      return confid;
    } catch (error) {
      console.log(error);
    }
  };

  const sendProps = (conferenceList, conferencePDA, conferenceName) => {
    router.push({
      pathname: "/submit-paper",
      query : {
        conferenceList, 
        conferencePDA, 
        conferenceName,
      }, 
    })
  }

  const getDetails = () => {
    try {
      const confid = getConferenceFromLists();
      const conferenceList = query[0];
      const conferencePDA = query[1];
      const conferenceName = confid.name;
      console.log("org", conferenceList, conferencePDA, conferenceName)

      if (confid) {
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
                <CardTitle tag="h4">{confid.name}</CardTitle>
                <CardText>
                  <small className="text-muted font-italic">
                    Organised By: {confid.createdBy}
                  </small>
                </CardText>
                <CardText className="lead">{confid.description}</CardText>
                <CardText>Date: {confid.date}</CardText>
                <CardText>Venue: {confid.venue}</CardText>
                <CardText>
                  Paper Submission Deadline: {confid.submissionDeadline}
                </CardText>
                <CardText>
                  Conference website: {' '}
                  <a href={confid.conferenceLink} className="text-primary font-italic">{confid.conferenceLink}</a>
                </CardText>
              </CardBody>
              <CardFooter>
                {walletAddress == confid.admin && (
                  <Popup
                    cancelConference={cancelConference}
                    modifyConference={modifyConference}
                    walletAddress={walletAddress}
                    connectWallet={connectWallet}
                    existingDetails={confid}
                    handleSubmit={handleSubmit}
                    conferenceList={conferenceList}
                    conferencePDA={conferencePDA}
                    conferenceName={conferenceName}
                    // conferenceid={conferenceid}
                  />
                )}
                {walletAddress != confid.admin && (
                  <div className="d-flex justify-content-center ">
                    <Button
                  className="btn btn-info"
                  onClick={() => sendProps(conferenceList, conferencePDA, conferenceName)}
                >
                  Submit Paper
                </Button></div>
                  
                )}
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
    } catch (error) {
      console.log(error);
    }
  };

  const cancelConference = async () => {
    try {
      const provider = getProvider();
      const program = new Program(IDL, programID, provider);
      const confid = getConferenceFromLists();
      if (confid.admin != provider.wallet.publicKey.toString()) {
        alert("you are not the admin");
      } else {
        const [conferencePDA, _] = await PublicKey.findProgramAddressSync(
          [
            utils.bytes.utf8.encode("CONFERENCE"),
            provider.wallet.publicKey.toBuffer(),
          ],
          program.programId
        );

        await program.rpc.deleteConference(confid.id, {
          accounts: {
            conferenceList: conferencePDA,
            user: provider.wallet.publicKey,
          },
        });

        console.log(
          "Deleted the conference w address: ",
          conferencePDA.toString()
        );
        router.push("/main");
      }
    } catch (error) {
      console.log("Error deleting conference account: ", error);
    }
  };

  const modifyConference = async (
    name,
    description,
    date,
    venue,
    submissionDeadline, 
    conferenceLink,
  ) => {
    try {
      const provider = getProvider();
      const program = new Program(IDL, programID, provider);
      const confid = getConferenceFromLists();

      if (confid.admin != provider.wallet.publicKey.toString()) {
        alert("you are not the admin");
      } else {
        const [conferencePDA, _] = await PublicKey.findProgramAddressSync(
          [
            utils.bytes.utf8.encode("CONFERENCE"),
            provider.wallet.publicKey.toBuffer(),
          ],
          program.programId
        );
        let id = confid.id;
        let paperSubmitted = confid.paperSubmitted;
        let feeReceived = confid.feeReceived;
        let createdBy = confid.createdBy;
        let organiserEmail = confid.organiserEmail;
        let admin = provider.wallet.publicKey;
        let technicalProgramsCommittees = confid.technicalProgramsCommittees;

        await program.rpc.updateConference(
          {
            id,
            admin,
            name,
            description,
            date,
            venue,
            submissionDeadline,
            paperSubmitted,
            feeReceived,
            createdBy,
            organiserEmail,
            technicalProgramsCommittees,
            conferenceLink,
          },
          {
            accounts: {
              conferenceList: conferencePDA,
              user: provider.wallet.publicKey,
            },
          }
        );
        console.log(
          "Modify the conference w address: ",
          conferencePDA.toString()
        );
        window.location.reload();
      }
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
      conferencelink: event.target.conferencelink.value,
      // image: event.target.image.value,
    };
    console.log(data);
    modifyConference(
      data.name,
      data.description,
      data.date,
      data.venue,
      data.deadlines,
      data.conferencelink
    );
  };

  useEffect(() => {
    if (!router.isReady) return;
    setQuery(conferenceid.split("-"));
    getConferences();
    checkIfWalletIsConnected();
  }, [router.isReady]);

  return (
    <>
      <Header props={`Conference Details`} />
      <div>{getDetails()}</div>
    </>
  );
}
