import React, { useState } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import {
  RiDeleteBin6Line,
  RiDownload2Fill,
  RiInformationLine,
  RiArrowDownSLine,
  RiTeamLine,
} from "react-icons/ri";
import Multiselect from "multiselect-react-dropdown";
import { BN } from "@project-serum/anchor";
import { assignReviewersandChair } from "../Common/AdminInstructions";

function AssignReviewerModal({
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

  const onSelectReviewers = (selectedList, selectedItem) => {
    // selectedItem.tpcWallet = "";
    selectedItem.approval = new BN(0);
    selectedItem.feedback = "";
    setSelectedReviewers(selectedList);
  };
  const onSelectChair = (selectedList, selectedItem) => {
    // selectedItem.tpcWallet = "";
    selectedItem.approval = new BN(0);
    selectedItem.feedback = "";
    setSelectedChair(selectedItem);
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
    await assignReviewersandChair(
      conference.conferencePDA,
      conference.conferenceId,
      paperId,
      selectedReviewers,
      selectedChair
    );
  };
  return (
    <div>
      <Button type="button" onClick={reviewerToggle} className="btn-info">
        Assign/Modify Reviewers
      </Button>
      {/* <RiTeamLine
        type="button"
        size={30}
        onClick={reviewerToggle}
        color="green"
      /> */}
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
