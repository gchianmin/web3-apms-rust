import React, { useState } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import { useRouter } from "next/router";
import FormInput from "./FormInput";
import TpcForm from "./TpcForm";
import { cancelConference } from "../Common/AdminInstructions";
import { connectWallet } from "../Common/WalletConnection";
import { useUser } from "@auth0/nextjs-auth0/client";

function Popup({ walletAddress, existingDetails, conferencePDA, tpc }) {
  const [editModal, setEditModal] = useState(false);
  const [tpcModal, setTpcModal] = useState(false);
  const editToggle = () => setEditModal(!editModal);
  const tpcToggle = () => setTpcModal(!tpcModal);
  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);
  const router = useRouter();
  const { user } = useUser();

  const sendProps = (href, conferencePDA, conferenceId, conferenceName) => {
    router.push({
      pathname: href,
      query: {
        conferencePDA,
        conferenceId,
        conferenceName,
      },
    });
  };

  return (
    <div>
      {tpc ? (
        <div className="d-flex justify-content-center d-grid col-4 mx-auto">
          {user && <Button
            className="btn btn-block btn-primary mt-0 btn-alignment"
            onClick={tpcToggle}
          >
            Add Committees
          </Button>}
          <Modal isOpen={tpcModal} toggle={tpcToggle} size="xl" id="tpc">
            <ModalHeader toggle={tpcToggle}>
              Adding Technical Program Committees
            </ModalHeader>
            <ModalBody>
              <p>
                <small>Click the add button to add a committee:</small>
              </p>
              <TpcForm
                existingDetails={existingDetails}
                tpcToggle={tpcToggle}
                conferencePDA={conferencePDA}
              />
            </ModalBody>
          </Modal>
        </div>
      ) : (
        <>
          <div className="d-flex justify-content-center d-grid col-7 mx-auto">
            <Button
              className="btn btn-block btn-info mr-4 btn-alignment"
              onClick={() =>
                sendProps(
                  "/submit-paper",
                  conferencePDA,
                  existingDetails.id.toString(),
                  existingDetails.name
                )
              }
            >
              Submit Paper
            </Button>

            {user && walletAddress == existingDetails.admin && (
              <>
                <Button
                  className="btn btn-block mr-4 mt-0 btn-alignment btn-success"
                  onClick={() =>
                    sendProps(
                      "/view-paper",
                      conferencePDA,
                      existingDetails.id.toString(),
                      existingDetails.name
                    )
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
              </>
            )}
          </div>

          <Modal isOpen={editModal} toggle={editToggle} size="xl">
            <ModalHeader toggle={editToggle}>Editing a conference</ModalHeader>
            <ModalBody>
              <FormInput
                empty={false}
                existingDetails={existingDetails}
                conferencePDA={conferencePDA}
                editToggle={editToggle}
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
                <Button
                  color="warning"
                  onClick={() =>
                    cancelConference(conferencePDA, existingDetails, router)
                  }
                >
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
