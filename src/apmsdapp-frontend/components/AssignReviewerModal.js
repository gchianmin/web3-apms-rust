import React, { useState } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { useRouter } from "next/router";
import FormInput from "./FormInput";
import TpcForm from "./TpcForm";
import {
  RiDeleteBin6Line,
  RiDownload2Fill,
  RiInformationLine,
  RiArrowDownSLine,
  RiTeamLine,
} from "react-icons/ri";
import Multiselect from "multiselect-react-dropdown";
import {
  Program,
  AnchorProvider,
  web3,
  utils,
  BN,
} from "@project-serum/anchor";

function AssignReviewerModal({
  reviewers,
  chair,
  paperId,
  assignReviewersandChair,
  tpc,
  walletAddress,
  connectWallet,
}) {
  const [reviewerModal, setReviewerModal] = useState(false);
  const [selectedReviewers, setSelectedReviewers] = useState([]);
  const [selectedChair, setSelectedChair] = useState(null);
  const reviewerToggle = () => setReviewerModal(!reviewerModal);

  const onSelectReviewers = (selectedList, selectedItem) => {
    selectedItem.tpcWallet = "";
    selectedItem.approval = new BN(0);
    selectedItem.feedback = "";
    // console.log(selectedList);
    setSelectedReviewers(selectedList);
  };
  const onSelectChair = (selectedList, selectedItem) => {
    selectedItem.tpcWallet = "";
    selectedItem.approval = new BN(0);
    selectedItem.feedback = "";
    // console.log(selectedItem);
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
    // console.log(selectedReviewers)
    // console.log(selectedChair)

    await assignReviewersandChair(paperId, selectedReviewers, selectedChair);
  };
  return (
    <div>
      <Button type="button" onClick={reviewerToggle} className="btn-info">Assign/Modify Reviewers</Button>
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
            options={tpc} // Options to display in the dropdown
            showCheckbox={true}
            placeholder="Select"
            hidePlaceholder={true}
            onSelect={onSelectReviewers} // Function will trigger on select event
            showArrow={true}
            selectionLimit={3}
            // selectedValues={reviewers}
            emptyRecordMsg="Not found"
            displayValue="tpcName" // Property name to display in the dropdown options
          />

          <p className="pt-5">Select a paper chair:</p>

          <Multiselect
            options={tpc} // Options to display in the dropdown
            singleSelect={true}
            placeholder="Select"
            hidePlaceholder={true}
            onSelect={onSelectChair} // Function will trigger on select event
            // selectedValues={chair}
            emptyRecordMsg="Not found"
            displayValue="tpcName" // Property name to display in the dropdown options
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
