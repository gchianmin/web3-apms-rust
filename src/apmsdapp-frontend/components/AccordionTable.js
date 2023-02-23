import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import {
  RiDeleteBin6Line,
  RiDownload2Fill,
  RiInformationLine,
  RiArrowDownSLine,
  RiTeamLine,
} from "react-icons/ri";
import AssignReviewerModal from "./AssignReviewerModal";
import { IDL } from "../utils/const";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import {
  Program,
  AnchorProvider,
  web3,
  utils,
  BN,
} from "@project-serum/anchor";
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

export default function AccordionTable({
  data,
  props,
  conference,
  deletePaper,
  walletAddress,
  connectWallet,
}) {
  //   const [activeIndex, setActiveIndex] = useState(null);
  const router = useRouter();
  const [filedata, setFileData] = useState(JSON.parse(props));
  const [activeIndexes, setActiveIndexes] = useState([]);
  const [tpc, setTpc] = useState([]);
  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new AnchorProvider(
      connection,
      window.solana,
      opts.preflightCommitment
    );
    return provider;
  };
  console.log("file", filedata);
  function toggleActive(index) {
    if (activeIndexes.includes(index)) {
      setActiveIndexes(activeIndexes.filter((i) => i !== index));
    } else {
      setActiveIndexes([...activeIndexes, index]);
    }
  }

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
    setFileData(JSON.parse(props));
    getTpcList();
  }, [props]);

  const getTpcList = async () => {
    try {
      const provider = getProvider();
      const program = new Program(IDL, programID, provider);
      const conferenceListPDA = new PublicKey(conference.conferenceList);
      const data = await program.account.conferenceListAccountData.fetch(
        conferenceListPDA
      );
      // console.log(data)
      for (let i in data.conferences) {
        // console.log(data.conferences[i]);
        if (data.conferences[i].id == conference.conferencePDA) {
          setTpc(data.conferences[i].technicalProgramsCommittees);
          break;
        }
      }
      console.log("get tpc", tpc);
    } catch (error) {
      console.log("Error getting a paper : ", error);
    }
  };

  const assignReviewersandChair = async (paperId, reviewers, chair) => {
    try {
      const provider = getProvider();
      const program = new Program(IDL, programID, provider);
      const conferenceListPDA = new PublicKey(conference.conferenceList);
      let conferenceId = new PublicKey(conference.conferencePDA);
      console.log(chair)
      await program.rpc.assignReviewer(conferenceId, paperId, reviewers, chair, {
        accounts: {
          conferenceList: conferenceListPDA,
          user: provider.wallet.publicKey,
        },
      });
      alert("added successfully");
      window.location.reload();
    } catch (error) {
      alert("error assigning reviewers and chair: ", error);
      console.log("error assigning reviewers: ", error);
    }
  };

  const sendProps = (href, conferenceList, conferencePDA, conferenceName) => {
    router.push({
      pathname: href,
      query: {
        conferenceList, conferencePDA, conferenceName
      },
    });
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

  return (
    <>
      {filedata.length > 0 ? (
        <Table responsive={true} borderless>
          <thead>
            <tr>
              <th> </th>
              <th>ID</th>
              <th>Paper</th>
              <th>Abstract</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filedata.map((item, index) => (
              <React.Fragment key={item.paperId}>
                <tr
                  //   onClick={() => toggleActive(index)}
                  className={`accordion-item ${
                    activeIndexes.includes(index) ? "active" : ""
                  }`}
                >
                  <td
                    className="accordion-title align-middle pr-0 mr-0"
                    onClick={() => toggleActive(index)}
                  >
                    <RiArrowDownSLine className="accordion-arrow " size={25} />
                  </td>

                  <td
                    className="accordion-title align-middle"
                    onClick={() => toggleActive(index)}
                  >
                    {item.paperId}
                  </td>

                  <td
                    className="accordion-title align-middle"
                    onClick={() => toggleActive(index)}
                  >
                    {item.paperTitle}
                  </td>
                  <td
                    className="accordion-title align-middle"
                    onClick={() => toggleActive(index)}
                  >
                    <small>{item.paperAbstract}</small>
                  </td>

                  <td
                    className="accordion-title align-middle"
                    onClick={() => toggleActive(index)}
                  >
                    {getStatus(item.paperStatus)}
                  </td>

                  <td className="accordion-title align-middle">
                  <Button className="btn-danger" type="button" onClick={() => deletePaper(item.paperHash)}>DELETE SUBMISSION</Button>
                    {/* <RiDeleteBin6Line
                      type="button"
                      color="red"
                      size={30}
                      onClick={() =>
                        deletePaper(item.paperHash, item.paperName)
                      }
                      className="mr-3"
                    /> */}

                    {/* {DownloadButton(item.paperHash, item.paperName)} */}
                    <AssignReviewerModal
                      walletAddress={walletAddress}
                      connectWallet={connectWallet}
                      tpc={tpc}
                      assignReviewersandChair={assignReviewersandChair}
                      paperId={item.paperHash}
                      reviewers={item.reviewer}
                      chair={item.paperChair}
                    />
                    {/* <RiTeamLine type="button" size={30} className="mr-3" onClick={getTpcList}/> */}

                      {/* <a href={`/papers/${item.paperHash}`} props={item} className="text-decoration-none"> */}
                      <Button className="btn-primary" type="button" onClick={() =>
                        sendProps(`/papers/${item.paperHash}`, conference.conferenceList, conference.conferencePDA, conference.conferenceName)
                      }>View more</Button>
                        {/* <RiInformationLine
                      type="button"
                      color="blue"
                      size={30}
                      className="mr-0"
                      onClick={() =>
                        sendProps(`/papers/${item.paperHash}`, conference.conferenceList, conference.conferencePDA, conference.conferenceName)
                      }
                    /> */}
                    {/* </a> */}
                  </td>
                </tr>
                {activeIndexes.includes(index) && (
                  <>
                    <tr>
                      <td
                        colSpan="5"
                        className="text-monospace accordion-content"
                      >
                        Paper Name: {item.paperName}{" "}
                        {DownloadButton(item.paperHash, item.paperName)}
                      </td>
                    </tr>

                    <tr>
                      <td
                        colSpan="5"
                        className="text-monospace accordion-content"
                      >
                        Abstract: {item.paperAbstract}
                      </td>
                    </tr>

                    <tr>
                      <td
                        colSpan="5"
                        className="text-monospace accordion-content"
                      >
                        Version: {item.version}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="5" className="text-monospace">
                        Date Submitted: {item.dateSubmitted}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="5" className="text-monospace">
                        Authors:{" "}
                        {item.paperAuthors.map((author) => (
                          <p>
                            {author.authorName} - {author.authorEmail} [
                            {author.authorAffiliation}]
                          </p>
                        ))}
                      </td>
                    </tr>

                    <tr>
                      <td colSpan="5" className="text-monospace">
                        Reviewers:{" "}
                        {item.reviewer.length > 0 ? (
                          item.reviewer.map((name) => (
                            <>
                              <p>{name.tpcName}</p>
                            </>
                          ))
                        ) : (
                          <p>No reviewers assigned yet</p>
                        )}
                      </td>
                    </tr>

                    <tr>
                      <td colSpan="5" className="text-monospace">
                        Paper Chair:{" "}
                        {item.paperChair.tpcName.length === 0 ? (
                          <p>No chair assigned yet</p>
                        ) : (
                          <p>{item.paperChair.tpcName}</p>
                        )}
                      </td>
                    </tr>
                  </>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </Table>
      ) : (
        <p className="text-muted font-italic">No papers submitted so far...</p>
      )}
    </>
  );
}
