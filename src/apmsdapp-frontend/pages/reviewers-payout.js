import React from "react";
import Header from "../components/Header";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  checkIfWalletIsConnected,
  connectWallet,
} from "../Common/WalletConnection";
import AccordionTable from "../components/AccordionTable";
import { getPaper } from "../Common/GetPapers";
import { getReviewedPapers } from "../Common/AuthorInstructions";
import PayoutAT from "../components/PayoutAT";

export default function ReviewersPayout() {
  const [papers, setPapers] = useState([]);
  const router = useRouter();
  const {
    query: { conferencePDA, conferenceId, conferenceName },
  } = router;
  const props = { conferencePDA, conferenceId, conferenceName };
  const [walletAddress, setWalletAddress] = useState(null);

  useEffect(() => {
    if (!router.isReady) return;
    checkIfWalletIsConnected().then((res) => setWalletAddress(res));
    getReviewedPapers(props.conferencePDA, props.conferenceId).then((res) =>
      setPapers(res)
    );
  }, [router.isReady]); 
  return (
    <>
      <Header props={`Payout to Reviewers`} />
      <div className="pl-5 pt-4 pb-3">
        <h2>Payout to Reviewers</h2>
        <div>
          <p className="pt-2">
            You are paying out to reviewers for conference:{" "}
            <em>
              <b>{props.conferenceName}</b>
            </em>
          </p>
        </div>
        {papers.size > 0 ? (
          <div className="pt-4">
            <PayoutAT
              props={papers}
              conference={props}
              walletAddress={walletAddress}
            />
          </div>
        ) : (
          <div className="font-italic text-muted text-mono">
            <p>No reviewers to pay out!</p>
          </div>
        )}
      </div>
    </>
  );
}
