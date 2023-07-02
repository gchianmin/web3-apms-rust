import React, { useState } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import Multiselect from "multiselect-react-dropdown";
import { BN } from "@project-serum/anchor";
import { assignReviewersandChair } from "../Common/AdminInstructions";
import { getConference } from "../Common/GetConferences";
import Link from "next/link";
import useSWR from "swr";
import Loading from "../components/Loading";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

function GetReviewerList(pid) {
  const { data, error, isLoading } = useSWR(`/api/papers/${pid}`, fetcher);

  return {
    reviewerList: data,
    isLoading,
    isError: error,
  };
}

function AssignReviewerModal({
  paper,
  paperId,
  conference,
  tpc,
  walletAddress,
  connectWallet,
}) {
  const [reviewerModal, setReviewerModal] = useState(false);
  const [selectedReviewers, setSelectedReviewers] = useState([]);
  const [selectedChair, setSelectedChair] = useState(null);
  const reviewerToggle = () => setReviewerModal(!reviewerModal);
  const { reviewerList, isLoading } = GetReviewerList(paper.paperId);
  if (isLoading) return <Loading />;

  const acceptedReviewer = tpc.filter((tpc) => {
    const matchingReviewer = JSON.parse(reviewerList).find(
      (reviewer) =>
        reviewer.reviewer_email === tpc.tpcEmail &&
        reviewer.acceptance == 1 &&
        reviewer.role == "reviewer"
    );
    return matchingReviewer !== undefined;
  });

  const acceptedChair = tpc.filter((tpc) => {
    const matchingChair = JSON.parse(reviewerList).find(
      (reviewer) =>
        reviewer.reviewer_email === tpc.tpcEmail &&
        reviewer.acceptance == 1 &&
        reviewer.role == "chair"
    );
    return matchingChair !== undefined;
  });

  const d = new Date();
  d.setDate(d.getDate() + 5);
  const onSelectReviewers = (selectedList, selectedItem) => {
    if (
      paper.paperAuthors.some(
        (author) => author.authorEmail === selectedItem.tpcEmail
      )
    ) {
      alert("A paper reviewer cannot be one of the authors!!");
      reviewerToggle();
      return;
    } else {
      selectedItem.approval = new BN(0);
      selectedItem.feedback = "";
      selectedItem.feedbackSubmittedDatetime = "";
      selectedItem.transactionDatetime = "";
      selectedItem.reviewDeadline =
        d.toLocaleDateString() +
        " " +
        d.toLocaleTimeString() +
        " " +
        Intl.DateTimeFormat().resolvedOptions().timeZone;
      const isAcceptedReviewerSelected = acceptedReviewer.some((accepted) => {
        return selectedList.some((selectedReviewer) => {
          return accepted.tpcEmail === selectedReviewer.tpcEmail;
        });
      });
  
      if (acceptedReviewer.length > 0 && !isAcceptedReviewerSelected) {
        alert(
          "You can't remove a reviewer that has agreed to review! Please select the correct reviewers."
        );
        reviewerToggle();
        return;
      }
      setSelectedReviewers(selectedList);
    }
  };

  const onSelectChair = (selectedList, selectedItem) => {
    if (
      paper.paperAuthors.some(
        (author) => author.authorEmail === selectedItem.tpcEmail
      )
    ) {
      alert("A paper chair cannot be one of the authors!!");
      reviewerToggle();
      return;
    } else if (
      acceptedChair.length > 0 &&
      acceptedChair[0].tpcEmail != selectedItem.tpcEmail
    ) {
      alert(
        "You can't select other chair as a chair has agreed to review! Please select the correct chair."
      );
      reviewerToggle();
      return;
    } else {
      selectedItem.approval = new BN(0);
      selectedItem.feedback = "";
      selectedItem.feedbackSubmittedDatetime = "";
      selectedItem.transactionDatetime = "";
      selectedItem.reviewDeadline =
        d.toLocaleDateString() +
        " " +
        d.toLocaleTimeString() +
        " " +
        Intl.DateTimeFormat().resolvedOptions().timeZone;
      setSelectedChair(selectedItem);
    }
  };

  const handleSubmit = async () => {
    if (
      selectedReviewers.some(
        (item) => JSON.stringify(item) === JSON.stringify(selectedChair)
      )
    ) {
      alert("A paper chair cannot be one of the reviewers!!");
      return;
    }

    try {
      const assign = await assignReviewersandChair(
        conference.conferencePDA,
        conference.conferenceId,
        paperId,
        selectedReviewers,
        selectedChair
      );
      // const assign = 1
      if (assign) {
        const res = await fetch("/api/assignreviewer", {
          body: JSON.stringify({
            conferencePda: conference.conferencePDA,
            conferenceId: conference.conferenceId,
            conferenceName: conference.conferenceName,
            paperId: paper.paperId,
            paperTitle: paper.paperTitle,
            paperAbstract: paper.paperAbstract,
            paperAuthors: paper.paperAuthors
              .map((author) => author.authorName)
              .join(", "),
            paperReviewers: selectedReviewers,
            paperChair: selectedChair,
            invitationSent: 1,
            acceptance: 0,
            acceptanceDeadline: d,
            organiserEmail: (
              await getConference(
                conference.conferencePDA,
                conference.conferenceId
              )
            ).organiserEmail,
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        });

        const { error } = await res.json();
        if (error) {
          console.error(error);
          return;
        }
      }
      window.location.reload();
    } catch (error) {
      console.log("error assigning: ", error);
    }
  };
  return (
    <div>
      <Button type="button" onClick={reviewerToggle} className="btn-info">
        Assign/Modify Reviewers
      </Button>

      <Modal
        isOpen={reviewerModal}
        toggle={reviewerToggle}
        size="xl"
        id="reviewer"
      >
        <ModalHeader toggle={reviewerToggle}>
          Adding Reviewers to The Paper
        </ModalHeader>
        <ModalBody>
          <p>
            Click {""}
            <Link href={`/reviewer/${paper.paperId}`} className="custom-link ">
              {" "}
              here
            </Link>{" "}
            {""} to view the review invitation status first.
          </p>

          <p>
            <i>
              * Note that you can&apos;t remove reviewers/paper chair that have
              agreed to review.
            </i>
          </p>

          <p>Select reviewers:</p>

          <Multiselect
            options={tpc}
            showCheckbox={true}
            placeholder="Select"
            hidePlaceholder={true}
            onSelect={onSelectReviewers}
            showArrow={true}
            selectionLimit={3}
            emptyRecordMsg="Not found"
            displayValue="tpcName"
          />
          <p className="pt-5">Select a paper chair:</p>
          <Multiselect
            options={tpc}
            singleSelect={true}
            placeholder="Select"
            hidePlaceholder={true}
            onSelect={onSelectChair}
            emptyRecordMsg="Not found"
            displayValue="tpcName"
          />
        </ModalBody>
        <ModalFooter>
          {!walletAddress && (
            <Button color="success" onClick={connectWallet}>
              Connect wallet to proceed
            </Button>
          )}
          {walletAddress && (
            <Button color="warning" onClick={handleSubmit}>
              Confirm
            </Button>
          )}{" "}
          <Button color="secondary" onClick={reviewerToggle}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default AssignReviewerModal;
