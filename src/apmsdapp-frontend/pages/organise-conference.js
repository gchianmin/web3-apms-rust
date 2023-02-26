import React from "react";
import Header from "../components/Header";
import { useEffect, useState } from "react";
import FormInput from "../components/FormInput";
import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import {
  checkIfWalletIsConnected,
  connectWallet,
} from "../Common/WalletConnection";

// page for a user to create a conference
function OrganiseConference() {
  const [walletAddress, setWalletAddress] = useState(null);

  const renderNotConnectedContainer = () => (
    <div className="pl-5 pb-3 font-italic text-muted">
      <p>
        In order to organise a conference, please connect your wallet first.
      </p>
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

  const renderConnectedContainer = () => (
    <>
      <div className="pl-5 pb-3 font-italic text-muted">
        <p>Complete the following form to organise a conference.</p>
      </div>
      <FormInput empty={true} />
    </>
  );

  useEffect(() => {
    checkIfWalletIsConnected().then((res) => setWalletAddress(res));
  }, []);

  return (
    <>
      <Header props={`Organise a Conference`} />
      <div className="pl-5 pt-4 pb-3">
        <h2>Organising a Conference</h2>
      </div>
      {!walletAddress && renderNotConnectedContainer()}
      {walletAddress && renderConnectedContainer()}
    </>
  );
}

export default withPageAuthRequired(OrganiseConference);
