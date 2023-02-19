import React, { useState } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { useRouter } from "next/router";
import FormInput from "./FormInput";
import TpcForm from "./TpcForm";

function Popup({
  modifyConference,
  cancelConference,
  connectWallet,
  walletAddress,
  handleSubmit,
  existingDetails,
  conferenceList,
  conferencePDA,
  conferenceName,
  tpc,
  updateTpc,
}) {
  const [editModal, setEditModal] = useState(false);
  const [tpcModal, setTpcModal] = useState(false);
  const editToggle = () => setEditModal(!editModal);
  const tpcToggle = () => setTpcModal(!tpcModal);
  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);
  const router = useRouter();

  const sendProps = (href, conferenceList, conferencePDA, conferenceName) => {
    router.push({
      pathname: href,
      query: {
        conferenceList,
        conferencePDA,
        conferenceName,
      },
    });
  };

  return (
    <div>
      {tpc ? (
        <div className="d-flex justify-content-center d-grid col-4 mx-auto">
        <Button
        className="btn btn-block btn-primary mt-0 btn-alignment"
        onClick={tpcToggle}
      >
        Add Committees
      </Button>
      <Modal isOpen={tpcModal} toggle={tpcToggle} size="xl" id="tpc">
            <ModalHeader toggle={tpcToggle}>Adding Technical Program Committees</ModalHeader>
            <ModalBody>
              <p><small>Click the add button to add a committee:</small></p>
              <TpcForm conferenceId={existingDetails.id} existingTpc={existingDetails.technicalProgramsCommittees} updateTpc={updateTpc}tpcToggle={tpcToggle}/>
            </ModalBody>
            {/* <ModalFooter>
              {!walletAddress && (
                <Button color="success" onClick={connectWallet}>
                  Connect wallet to proceed
                </Button>
              )}
              {walletAddress && (
                <Button color="warning" onClick={updateTpc}>
                  Confirm
                </Button>
              )}{" "}
              <Button color="secondary" onClick={toggle}>
                Cancel
              </Button>
            </ModalFooter> */}
          </Modal>
      </div>
      
      ) : (
        <>
          <div className="d-flex justify-content-center d-grid col-7 mx-auto">
            <Button
              className="btn btn-block btn-info mr-4 btn-alignment"
              onClick={() =>
                sendProps("/submit-paper", conferenceList, conferencePDA, conferenceName)
              }
            >
              Submit Paper
            </Button>

            <Button
              className="btn btn-block mr-4 mt-0 btn-alignment btn-success"
              onClick={() =>
                sendProps("/view-paper", conferenceList, conferencePDA, conferenceName)
              }
            >
              View Paper Submitted
            </Button>

            <Button
              className="btn btn-block btn-primary mr-4 mt-0 btn-alignment"
              onClick={editToggle}
            >
              Edit
            </Button>
            <Button
              className="btn btn-block btn-danger mt-0 btn-alignment"
              onClick={toggle}
            >
              Cancel
            </Button>
          </div>

         

          <Modal isOpen={editModal} toggle={editToggle} size="xl">
            <ModalHeader toggle={editToggle}>Editing a conference</ModalHeader>
            <ModalBody>
              <FormInput
                empty={false}
                existingDetails={existingDetails}
                handleSubmit={handleSubmit}
                editToggle={editToggle}
                modifyConference={modifyConference}
              />
            </ModalBody>
          </Modal>

          <Modal isOpen={modal} toggle={toggle} id="cancel">
            <ModalHeader toggle={toggle}>Canceling a conference</ModalHeader>
            <ModalBody>
              Confirm cancelling the conference? Please note that this action is
              irreversible.
              <p className="text-primary font-italic pt-2 ">
                <small>
                  You will need to connect your wallet beforehand if you have
                  not done so.
                </small>
              </p>
            </ModalBody>
            <ModalFooter>
              {!walletAddress && (
                <Button color="success" onClick={connectWallet}>
                  Connect wallet to proceed
                </Button>
              )}
              {walletAddress && (
                <Button color="warning" onClick={cancelConference}>
                  Confirm
                </Button>
              )}{" "}
              <Button color="secondary" onClick={toggle}>
                Cancel
              </Button>
            </ModalFooter>
          </Modal>
        </>
      )}
    </div>
  );
}

export default Popup;
