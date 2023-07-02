import { useRouter } from "next/router";
import Header from "../../components/Header";
import React, { useEffect, useState } from "react";
import {
  checkIfWalletIsConnected
} from "../../Common/WalletConnection";
import { getPaperStatus, getPaper } from "../../Common/GetPapers";
import DownloadButton from "../../components/DownloadButton";
import { getConference } from "../../Common/GetConferences";

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
                conferencePDA={conference.conferencePDA}
                conferenceId={conference.conferenceId}
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
