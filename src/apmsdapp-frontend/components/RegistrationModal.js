import React, { useState } from "react";
import {
  Button,
  Form,
  FormGroup,
  Label,
  Col,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
} from "reactstrap";
import { reviewPaper } from "../Common/ReviewerInstructions";
import { useUser } from "@auth0/nextjs-auth0/client";
import { connectWallet } from "../Common/WalletConnection";

export default function RegistrationModal({
  conferencePDA,
  conferenceId,
  paperHash,
  walletAddress,
}) {
  const { user } = useUser();
  const [radioSelected, setRadioSelected] = useState(null);
  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);

  const handleReviewsSubmit = async (event) => {
    event.preventDefault();
    if (!radioSelected) {
      alert("Appoval cannot be empty!");
      return;
    }
    const data = {
      feedback: event.target.feedback.value,
      approval: radioSelected,
    };

    try {
      const d = new Date();
      const feedbackSubmittedDatetime =
        d.toLocaleDateString() +
        " " +
        d.toLocaleTimeString() +
        " " +
        Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (role == "reviewer") {
        const res = await reviewPaper(
          conferencePDA,
          conferenceId,
          paperHash,
          user.email,
          false,
          data.approval,
          data.feedback,
          feedbackSubmittedDatetime
        );
 
        if (res == "ok") {
          alert("reviewed success");
          window.location.reload();
        }
      } else if (role == "chair") {
        const res = await reviewPaper(
          conferencePDA,
          conferenceId,
          paperHash,
          user.email,
          true,
          data.approval,
          data.feedback,
          feedbackSubmittedDatetime
        );
        
        if (res == "ok") {
          alert("reviewed success");
          window.location.reload();
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <Button color="primary" type="button" onClick={toggle}>
        Make Payment
      </Button>
      <Modal isOpen={modal} toggle={toggle}>
        <ModalHeader toggle={toggle}>Payment</ModalHeader>
        <ModalBody>
          <Form
            className="align-items-center justify-contents-center "
            onSubmit={handleReviewsSubmit}
          >
            <FormGroup>
              <Label className="text-monospace" for="feedback" sm={6}>
                Feedback:
              </Label>
              <Col sm={10}>
                <Input
                  id="feedback"
                  name="feedback"
                  placeholder="Enter comments for the paper"
                  type="textarea"
                />
              </Col>
            </FormGroup>

            <FormGroup tag="fieldset">
              <Label className="text-monospace" for="approval" sm={6}>
                Accepting the paper?
              </Label>

              <FormGroup check className="pl-5">
                <Input
                  name="approval"
                  type="radio"
                  onClick={() => setRadioSelected(2)}
                />{" "}
                <Label check>Accepted</Label>
              </FormGroup>

              <FormGroup check className="pl-5">
                <Input
                  name="approval"
                  type="radio"
                  onClick={() => setRadioSelected(3)}
                />{" "}
                <Label check>Accepted with minor revision required</Label>
              </FormGroup>

              <FormGroup check className="pl-5">
                <Input
                  name="approval"
                  type="radio"
                  onClick={() => setRadioSelected(4)}
                />{" "}
                <Label check>Accepted with major revision required</Label>
              </FormGroup>

              <FormGroup check className="pl-5">
                <Input
                  name="approval"
                  type="radio"
                  onClick={() => setRadioSelected(7)}
                />{" "}
                <Label check>Rejected</Label>
              </FormGroup>
            </FormGroup>
            {!walletAddress && (
              <Button color="success" onClick={connectWallet}>
                Connect wallet to proceed
              </Button>
            )}
            <div className="d-flex justify-content-center align-items-center">
              <Button color="primary" className="mr-3">
                Submit
              </Button>

              <Button
                color="secondary"
                type="button"
                className="d-flex justify-content-center align-items-center"
                onClick={toggle}
              >
                Cancel
              </Button>
            </div>
          </Form>
        </ModalBody>
      </Modal>
    </div>
  );
}
