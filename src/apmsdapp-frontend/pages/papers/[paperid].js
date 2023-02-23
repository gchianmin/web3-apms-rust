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
import {
  RiDeleteBin6Line,
  RiDownload2Fill,
  RiInformationLine,
  RiArrowDownSLine,
  RiTeamLine,
} from "react-icons/ri";
import AssignReviewerModal from "../../components/AssignReviewerModal";
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
  // const [query, setQuery] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [paper, setPaper] = useState([]);
  const router = useRouter();
  const [tpc, setTpc] = useState([]);
  const {
    query: { conferenceList, conferencePDA, conferenceName },
  } = router;
  const conference = { conferenceList, conferencePDA, conferenceName };
  console.log(conference);

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

  const DownloadButton = (paperHash, paperName) => {
    const handleDownload = (event) => {
      event.preventDefault();
      const fileUrl = `/files/${conference.conferenceList}/${conference.conferencePDA}/${paperHash}/${paperName}`;
      console.log(fileUrl);
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = paperName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    return (
      <RiDownload2Fill
        type="button"
        color="green"
        size={25}
        onClick={handleDownload}
        className="mr-3"
      />
    );
  };

  const assignReviewersandChair = async (paperId, reviewers, chair) => {
    try {
      const provider = getProvider();
      const program = new Program(IDL, programID, provider);
      const conferenceListPDA = new PublicKey(conference.conferenceList);
      let conferenceId = new PublicKey(conference.conferencePDA);
      console.log(chair);
      await program.rpc.assignReviewer(
        conferenceId,
        paperId,
        reviewers,
        chair,
        {
          accounts: {
            conferenceList: conferenceListPDA,
            user: provider.wallet.publicKey,
          },
        }
      );
      alert("added successfully");
      window.location.reload();
    } catch (error) {
      alert("error assigning reviewers and chair: ", error);
      console.log("error assigning reviewers: ", error);
    }
  };

  const AssignReviewerButton = (paperHash, paperName) => {
    return (
      <RiDownload2Fill
        type="button"
        color="green"
        size={25}
        onClick={handleDownload}
        className="mr-3"
      />
    );
  };

  // const getTpcList = async () => {
  //   try {
  //     const provider = getProvider();
  //     const program = new Program(IDL, programID, provider);
  //     const conferenceListPDA = new PublicKey(conference.conferenceList);
  //     const data = await program.account.conferenceListAccountData.fetch(
  //       conferenceListPDA
  //     );
  //     // console.log(data)
  //     for (let i in data.conferences) {
  //       // console.log(data.conferences[i]);
  //       if (data.conferences[i].id == conference.conferencePDA) {
  //         setTpc(data.conferences[i].technicalProgramsCommittees);
  //         break;
  //       }
  //     }
  //     console.log("get tpc", tpc);
  //   } catch (error) {
  //     console.log("Error getting a paper : ", error);
  //   }
  // };

  const getPaper = async () => {
    try {
      const provider = getProvider();
      const program = new Program(IDL, programID, provider);
      const conferenceListPDA = new PublicKey(conference.conferenceList);
      const data = await program.account.conferenceListAccountData.fetch(
        conferenceListPDA
      );

      for (let i in data.conferences) {
        if (data.conferences[i].id == conference.conferencePDA) {
          setTpc(data.conferences[i].technicalProgramsCommittees);
          for (let j in data.conferences[i].paperSubmitted) {
            if (
              data.conferences[i].paperSubmitted[j].paperHash ==
              router.query.paperid
            ) {
              setPaper(data.conferences[i].paperSubmitted[j]);
              break;
            }
          }
        }
      }

      console.log("ger", paper);
    } catch (error) {
      console.log("Error getting a paper : ", error);
    }
  };

  const getPaperDetails = () => {
    try {
      if (paper) {
        return (
          <>
            <p>Conference: {conference.conferenceName}</p>
            <p>
              Paper ID: {paper.paperId}{" "}
              {DownloadButton(paper.paperHash, paper.paperName)}
            </p>
            <p>Paper Title: {paper.paperTitle}</p>
            <p>Paper Abstract: {paper.paperAbstract}</p>
            <p>Paper Version: {paper.version}</p>
            <p>
              Previous Version:{" "}
              {paper.prevVersion == "" ? (
                <span>None</span>
              ) : (
                <p>{paper.prevVersion}</p>
              )}
            </p>
            <p>Paper Status: {getStatus(paper.paperStatus)}</p>
            <p>Date Submitted: {paper.dateSubmitted}</p>
            <p>Paper Authors</p>
            {paper.paperAuthors.map((author) => (
              <li>
                {" "}
                {author.authorName} - {author.authorEmail} (
                {author.authorAffiliation})
              </li>
            ))}
            <p>Paper Reviewers</p>
            {paper.reviewer.map((reviewer) => (
              <li>
                {" "}
                {reviewer.tpcName} - {reviewer.tpcEmail}{" "}
              </li>
            ))}
            <p>
              Paper Chair:
              <li>
                {paper.paperChair.tpcName} - {paper.paperChair.tpcEmail}
              </li>
            </p>
            <AssignReviewerModal
              walletAddress={walletAddress}
              connectWallet={connectWallet}
              tpc={tpc}
              assignReviewersandChair={assignReviewersandChair}
              paperId={paper.paperHash}
              reviewers={paper.reviewer}
              chair={paper.paperChair}
            />
            <Button className="btn-danger" type="button" onClick={() => deletePaper(paper.paperHash)}>DELETE SUBMISSION</Button>
            {/* <RiDeleteBin6Line
              type="button"
              color="red"
              size={30}
              onClick={() => deletePaper(item.paperHash, item.paperName)}
              className="mr-3"
            /> */}
          </>
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deletePaper = async (paperHash) => {
    try {
      const provider = getProvider();
      const program = new Program(IDL, programID, provider);
      //   const confid = getConferenceFromLists();
      const conferenceListPDA = new PublicKey(conference.conferenceList);
      const data = await program.account.conferenceListAccountData.fetch(
        conferenceListPDA
      );
      //   console.log(conferenceInfo.conferences[0].id);
      let id = new PublicKey(conference.conferencePDA);
      // paperId = "969e9f7f1f336a6309cd66080502c15d";

      await program.rpc.deletePaper(id, paperHash, {
        accounts: {
          conferenceList: conferenceListPDA,
          user: provider.wallet.publicKey,
        },
      });
      await deleteFile(paperHash, conferenceListPDA, id);
    } catch (error) {
      console.log("Error deleting paper: ", error);
    }
  };

  const deleteFile = async (paperHash, conferenceListPDA, conferenceId) => {
    try {
      const formData = new FormData();
      formData.append("paperHash", paperHash);
      formData.append("conferenceListPDA", conferenceListPDA);
      formData.append("conferenceId", conferenceId);

      const response = await fetch("/api/filedelete", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        alert(`Error ${response.status}!! ${data.message}`);
        throw data.message;
      }

      alert("Paper Deleted Successfully.");
      window.location.reload();
      // router.push('/my-history')
    } catch (error) {
      console.log(error.message);
    }
  };

  const getStatus = (status) => {
    const statusMap = {
      0: "Submitted",
      1: "Under Review",
      2: "Accepted",
      3: "Accepted with Minor Revision",
      4: "Accepted with Major Revision",
      5: "Under Revision",
      6: "Rejected (Passed Deadline)",
      7: "Paper Rejected",
    };

    return statusMap[status] || "Unknown status";
  };

  useEffect(() => {
    if (!router.isReady) return;
    // setQuery(paperid.split("-"));
    // getTpcList();
    getPaper();
    checkIfWalletIsConnected();
  }, [router.isReady]);

  return (
    <>
      <Header props={`Paper Details`} />
      <h2>Paper Details </h2>
      <div>{getPaperDetails()}</div>
    </>
  );
}
