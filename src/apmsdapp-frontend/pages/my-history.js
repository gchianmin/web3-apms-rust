import Header from "../components/Header";
import { getPapersSubmitted, getPapersReviewed } from "../Common/GetPapers";
import React, { useState, useEffect } from "react";
import AccordionTable from "../components/AccordionTable";
import { useRouter } from "next/router";
import {
  checkIfWalletIsConnected,
  connectWallet,
} from "../Common/WalletConnection";
import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";

function MyHistory() {
  const router = useRouter();
  const [paperSubmitted, setPaperSubmitted] = useState([]);
  const [paperReviewed, setPaperReviewed] = useState([]);
  const [paperReviewedChair, setPaperReviewedChair] = useState([]);
  const [walletAddress, setWalletAddress] = useState(null);

  const getPapers = async () => {
    try {
      const res = await getPapersSubmitted(walletAddress);
      setPaperSubmitted(res);
    } catch (error) {
      console.log("error in my-history page", error);
    }
  };

  const getPapersReviewer = async () => {
    try {
      const res = await getPapersReviewed("reviewer", walletAddress);
      setPaperReviewed(res);
    } catch (error) {
      console.log("error in my-history page", error);
    }
  };

  const getPapersChair = async () => {
    try {
      const res = await getPapersReviewed("chair", walletAddress);
      setPaperReviewedChair(res);
    } catch (error) {
      console.log("error in my-history page", error);
    }
  };

  useEffect(() => {
    if (!router.isReady) return;
    const getWallet = async () => {
      const res = await checkIfWalletIsConnected();
      setWalletAddress(res);
    };
    getWallet().catch(console.error);
    if (walletAddress) {
      getPapers().catch(console.error);
      getPapersReviewer().catch(console.error);
      getPapersChair().catch(console.error)
    }
  }, [walletAddress]);
  return (
    <>
      <Header props={`History`} />
      <div className="pl-5 pt-4 pb-3">
      <h2>History </h2>
      <p>
        This page shows the history of your action done in each conference. You
        can also check the status of your paper submitted under this page.
      </p>
      <h4 className="pt-3">Paper Submitted</h4>
      {walletAddress && paperSubmitted.length > 0 ? (
        <>
          <AccordionTable
            action="authorViewPaperSubmittedHistory"
            props={JSON.stringify(paperSubmitted)}
            walletAddress={walletAddress}
          />
        </>
      ) : (
        <p className="text-muted font-italic"> No papers Submitted</p>
      )}
      <h4 className="pt-3">Paper Reviewed (Reviewer)</h4>
      {walletAddress && paperReviewed.length > 0 ? (
        <>
          <AccordionTable
            action="reviewerViewPaperReviewedHistory"
            props={JSON.stringify(paperReviewed)}
            walletAddress={walletAddress}
          />
        </>
      ) : (
        <p className="text-muted font-italic"> No papers Reviewed</p>
      )}

      <h4 className="pt-3">Paper Reviewed (Chair)</h4>
      {walletAddress && paperReviewedChair.length > 0 ? (
        <>
          <AccordionTable
            action="chairViewPaperReviewedHistory"
            props={JSON.stringify(paperReviewedChair)}
            walletAddress={walletAddress}
          />
        </>
      ) : (
        <p className="text-muted font-italic"> No papers Reviewed</p>
      )}
      </div>
    </>
  );
}

export default withPageAuthRequired(MyHistory);
