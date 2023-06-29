import Header from "../components/Header";
import { getPaperPendingReview, getPaperPendingPayment, getPaperPendingRevision} from "../Common/GetPapers";
import React, { useState, useEffect } from "react";
import AccordionTable from "../components/AccordionTable";
import { useRouter } from "next/router";
import {
  checkIfWalletIsConnected,
  connectWallet,
} from "../Common/WalletConnection";
import { withPageAuthRequired, useUser } from "@auth0/nextjs-auth0/client";

function MyTask() {
  const router = useRouter();
  const { user } = useUser();
  const [paperToReview, setPaperToReview] = useState([]);
  const [walletAddress, setWalletAddress] = useState(null);
  const [paperToReviewChair, setPaperToReviewChair] = useState([]);
  const [paperToRevise, setPaperToRevise] = useState([]);
  const [paperToPay, setPaperToPay] = useState([]);

  const getPapersToBeReviewed = async () => {
    try {
      const res = await getPaperPendingReview("reviewer", user.email);
      setPaperToReview(res);
    } catch (error) {
      console.log("error in my-task page", error);
    }
  };

  const getPapersToBeReviewedChair = async () => {
    try {
      const res = await getPaperPendingReview("chair", user.email);
      setPaperToReviewChair(res);
    } catch (error) {
      console.log("error in my-task page", error);
    }
  };

  const getPapersToBeRevised = async () => {
    try {
      const res = await getPaperPendingRevision(walletAddress);
      setPaperToRevise(res);
    } catch (error) {
      console.log("error in my-task page", error);
    }
  };

  const getPapersToBePaid = async () => {
    try {
      const res = await getPaperPendingPayment(walletAddress);
      setPaperToPay(res);
    } catch (error) {
      console.log("error in my-task page", error);
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
      getPapersToBePaid().catch(console.error);
    }
    getPapersToBeReviewed();
    getPapersToBeReviewedChair();
    getPapersToBeRevised();
    
  }, [walletAddress]);

  return (
    <>
      <Header props={`Pending Tasks`} />
      <div className="pl-5 pt-4 pb-3">
      <h2>Tasks pending your action</h2>
      <p>
        This page shows the tasks assigned to you eg pending payment or papers
        pending for your reviews
      </p>
  
      <h4 className="pt-3 ">Paper To Revise</h4>
      {paperToRevise.length > 0 ? (
        <AccordionTable
          props={JSON.stringify(paperToRevise)}
          action="authorViewPaperPendingRevision"
          walletAddress={walletAddress}
        />
      ) : (
        <p className="text-muted font-italic">
          {" "}
          No papers pending for revision
        </p>
      )}

      <h4 className="pt-3">Pending Payment</h4>
      {paperToPay.length > 0 ? (
        <AccordionTable
          props={JSON.stringify(paperToPay)}
          action="authorViewPaperPendingPayment"
          walletAddress={walletAddress}
        />
      ) : (
        <p className="text-muted font-italic"> No papers pending for payment</p>
      )}

      <h4 className="pt-3">Paper To Review (Reviewer)</h4>
      {paperToReview.length > 0 ? (
        <AccordionTable
          props={JSON.stringify(paperToReview)}
          action="reviewerViewPaperPendingReviewed"
          walletAddress={walletAddress}
        />
      ) : (
        <p className="text-muted font-italic">
          {" "}
          No papers pending for your review
        </p>
      )}
      <h4 className="pt-3">Paper To Review (Chair)</h4>
      {paperToReviewChair.length > 0 ? (
        <AccordionTable
          props={JSON.stringify(paperToReviewChair)}
          action="chairViewPaperPendingReviewed"
          walletAddress={walletAddress}
        />
      ) : (
        <p className="text-muted font-italic">
          {" "}
          No papers pending for your review
        </p>
      )}
      </div>
    </>
  );
}

export default withPageAuthRequired(MyTask);
