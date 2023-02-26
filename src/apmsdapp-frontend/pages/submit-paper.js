import React from "react";
import Header from "../components/Header";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import DynamicForm from "../components/DynamicForm";
import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import {
  checkIfWalletIsConnected,
  connectWallet,
} from "../Common/WalletConnection";

function SubmitPaper() {
  const router = useRouter();
  const {
    query: { conferencePDA, conferenceId, conferenceName },
  } = router;
  const props = { conferencePDA, conferenceId, conferenceName };

  const [walletAddress, setWalletAddress] = useState(null);

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

  useEffect(() => {
    if (!router.isReady) return;
    checkIfWalletIsConnected().then((res) => setWalletAddress(res));
  }, [router.isReady]);

  return (
    <>
      <Header props={`Submit A Paper`} />
      <div className="pl-5 pt-4 pb-3">
        <h2>Submit a paper</h2>
        <div>
          <p className="pt-2">
            You are submitting a paper to conference:{" "}
            <em>
              <b>{props.conferenceName}</b>
            </em>
          </p>
        </div>
        <div className="pt-4">
          {!walletAddress && renderNotConnectedContainer()}
          {walletAddress && <DynamicForm props={props} />}
        </div>
      </div>
    </>
  );
}

export default withPageAuthRequired(SubmitPaper);
