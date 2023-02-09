import React, { useState } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { useRouter } from "next/router";
import FormInput from "./FormInput";

function Popup({
  cancelConference,
  connectWallet,
  walletAddress,
  handleSubmit,
  existingDetails,
  conferenceList,
  conferencePDA,
  conferenceName
}) {
  const [editModal, setEditModal] = useState(false);
  const editToggle = () => setEditModal(!editModal);
  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);
  const router = useRouter();

  const sendProps = (conferenceList, conferencePDA, conferenceName) => {
    router.push({
      pathname: "/submit-paper",
      query : {
        conferenceList, 
        conferencePDA, 
        conferenceName,
      }
    })
  }

  return (
    <div>
      <div className="d-flex justify-content-center d-grid col-7 mx-auto">
      <Button
          className="btn btn-block btn-info mr-4 btn-alignment"
          onClick={() => sendProps(conferenceList, conferencePDA, conferenceName)}
        >
          Submit Paper
        </Button>

        <Button
          className="btn btn-block btn-primary mr-4 mt-0 btn-alignment"
          onClick={editToggle}
        >
          Edit
        </Button>
        <Button
          className="btn btn-block btn-danger mt-0 btn-alignment"
          onClick={(toggle)}
        >
          Cancel
        </Button>

      </div>

      <Modal isOpen={editModal} toggle={editToggle} size="xl">
        <ModalHeader toggle={editToggle}>Editing a conference</ModalHeader>
        <ModalBody>
          <FormInput  empty={false} existingDetails={existingDetails} handleSubmit={handleSubmit} editToggle={editToggle}/>
          {/* <div className="d-flex justify-content-center align-items-center pt-3"> */}
          {/* <Button color="secondary" onClick={editToggle}>
            Cancel
          </Button>
          </div> */}
        </ModalBody>
        
        {/* <ModalFooter> */}
          {/* {!walletAddress && (
            <Button color="success" onClick={connectWallet}>
              Connect wallet to proceed
            </Button>
          )}
          {walletAddress && (
            <Button color="warning" onClick={handleSubmit}>
              Confirm
            </Button>
          )}{" "} */}
          
        {/* </ModalFooter> */}
      </Modal>

      <Modal isOpen={modal} toggle={toggle} id="cancel" >
        <ModalHeader toggle={toggle}>Canceling a conference</ModalHeader>
        <ModalBody>
          Confirm cancelling the conference? Please note that this action is
          irreversible.
          <p className="text-primary font-italic pt-2 ">
            <small>
              You will need to connect your wallet beforehand if you have not
              done so.
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
    </div>
  );
}

export default Popup;
