import Header from "../components/Header";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import {
  checkIfWalletIsConnected,
} from "../Common/WalletConnection";
import AccordionTable from "../components/AccordionTable";
import { getPaper } from "../Common/GetPapers";

export default function ViewPaper() {
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
    getPaper(props.conferencePDA, props.conferenceId).then((res) =>
      setPapers(res)
    );
  }, [router.isReady]);

  return (
    <>
      <Header props={`Papers Submitted`} />
      <div className="pl-5 pt-4 pb-3">
        <h2>Papers Submitted</h2>
        <div>
          <p className="pt-2">
            You are viewing papers submitted to your conference:{" "}
            <em>
              <b>{props.conferenceName}</b>
            </em>
          </p>
        </div>

        {papers.length > 0 ? (
          <div className="pt-4">
            <AccordionTable
              props={JSON.stringify(papers)}
              conference={props}
              walletAddress={walletAddress}
              action="organiserViewAllPapersSubmitted"
            />
          </div>
        ) : (
          <div className="font-italic text-muted text-mono">
            <p>No papers submitted yet!</p>
          </div>
        )}
      </div>
    </>
  );
}
