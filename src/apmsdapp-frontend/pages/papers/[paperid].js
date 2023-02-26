import { useRouter } from "next/router";
import Header from "../../components/Header";
import React from "react";
import { useEffect, useState } from "react";
import { Button } from "reactstrap";
import {
  RiDeleteBin6Line,
  RiDownload2Fill,
  RiInformationLine,
  RiArrowDownSLine,
  RiTeamLine,
} from "react-icons/ri";
import AssignReviewerModal from "../../components/AssignReviewerModal";
import {
  checkIfWalletIsConnected,
  connectWallet,
} from "../../Common/WalletConnection";
import { getPaperStatus, getPaper } from "../../Common/GetPapers";
import DownloadButton from "../../components/DownloadButton";
import { deletePaper } from "../../Common/AuthorInstructions";
import { getConference } from "../../Common/getConferences";

export default function ViewIndividualPaperPage() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [paper, setPaper] = useState([]);
  const router = useRouter();
  const [tpc, setTpc] = useState([]);
  const {
    query: { conferencePDA, conferenceId, conferenceName },
  } = router;
  const conference = { conferencePDA, conferenceId, conferenceName };

  const getSpecificPaper = async () => {
    try {
      const conf = await getConference(
        conference.conferencePDA,
        conference.conferenceId
      );
      setTpc(conf.technicalProgramsCommittees);

      const papers = await getPaper(
        conference.conferencePDA,
        conference.conferenceId
      );
      const getPaperFromList = papers.find(
        (element) => element.paperHash == router.query.paperid
      );
      setPaper(getPaperFromList);
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
              <DownloadButton
                conference={conference}
                paperHash={paper.paperHash}
                paperName={paper.paperName}
              />
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
            <p>Paper Status: {getPaperStatus(paper.paperStatus)}</p>
            <p>Date Submitted: {paper.dateSubmitted}</p>
            <p>Paper Authors</p>
            {paper.paperAuthors.map((author) => (
              <li key={author.authorEmail}>
                {" "}
                {author.authorName} - {author.authorEmail} (
                {author.authorAffiliation})
              </li>
            ))}
            <p>Paper Reviewers</p>
            {paper.reviewer.map((reviewer) => (
              <li key={reviewer.tpcEmail}>
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
              conference={conference}
              paperId={paper.paperHash}
            />
            <Button
              className="btn-danger"
              type="button"
              onClick={() =>
                deletePaper(
                  conference.conferencePDA,
                  conference.conferenceId,
                  paper.paperHash
                )
              }
            >
              DELETE SUBMISSION
            </Button>
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

  useEffect(() => {
    if (!router.isReady) return;
    checkIfWalletIsConnected().then((res) => setWalletAddress(res));
    getSpecificPaper();
  }, [router.isReady]);

  return (
    <>
      <Header props={`Paper Details`} />
      <h2>Paper Details </h2>
      <div>{paper && getPaperDetails()}</div>
      {!paper && (
        <div className="pt-4">
          <p className="text-muted font-italic">Paper has been deleted</p>
          <a className="text-primary lead" type="button" onClick={router.back}>
            ← Return
          </a>
        </div>
      )}
    </>
  );
}
