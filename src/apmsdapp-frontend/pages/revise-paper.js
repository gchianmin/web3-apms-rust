import React from "react";
import Header from "../components/Header";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import RevisePaperForm from "../components/RevisePaperForm";
import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import {
  checkIfWalletIsConnected,
  connectWallet,
} from "../Common/WalletConnection";
import { getPaperWithHash } from "../Common/GetPapers";

function RevisePaper() {
  const router = useRouter();
  const {
    query: { conferencePDA, conferenceId, conferenceName, paperHash },
  } = router;
  const props = { conferencePDA, conferenceId, conferenceName, paperHash };

  const [walletAddress, setWalletAddress] = useState(null);
  const [prevPaper, setPrevPaper] = useState(null);


  const renderNotConnectedContainer = () => (
    <div className="pl-5 pb-3 font-italic text-muted">
      <p>In order to submit a paper, please connect your wallet first.</p>
      <div className="pt-3">
        <button
          onClick={() => setWalletAddress(connectWallet)}
          type="button"
          className="btn btn-success "
        >
          {" "}
          Connect to Wallet{" "}
        </button>
      </div>
    </div>
  );

  const getPrevPaper = async () => {
    try {
      const res = await getPaperWithHash(
        props.conferencePDA,
        props.conferenceId,
        props.paperHash
      );
      setPrevPaper(res)

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!router.isReady) return;
    checkIfWalletIsConnected().then((res) => setWalletAddress(res));
    getPrevPaper();
  }, [router.isReady]);

  return (
    <>
      <Header props={`Submit A Paper`} />
      <div className="pl-5 pt-4 pb-3">
        <h2>Submit a paper</h2>
        {/* <div>
          <p className="pt-2">
            You are submitting a paper to conference:{" "}
            <em>
              <b>{props.conferenceName}</b>
            </em>
          </p>
        </div> */}
        <div className="pt-4">
          {!walletAddress && renderNotConnectedContainer()}
          {walletAddress && <RevisePaperForm props={props} prevPaper={prevPaper}/>}
        </div>
      </div>
    </>
  );
}

export default withPageAuthRequired(RevisePaper);
