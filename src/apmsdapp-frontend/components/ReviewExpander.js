import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  UncontrolledCollapse,
  Card,
  CardBody,
  Form,
  FormGroup,
  Label,
  Col,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import { reviewPaper } from "../Common/ReviewerInstructions";
import { useUser } from "@auth0/nextjs-auth0/client";
import { getPaper } from "../Common/GetPapers";
import { connectWallet } from "../Common/WalletConnection";

export default function ReviewExpander({
  role,
  conferencePDA,
  conferenceId,
  paperHash,
  walletAddress,
}) {
  const { user } = useUser();
  const [review, setReview] = useState(null);
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
    console.log("data", data);
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
        console.log("res", res);
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
        console.log("res", res);
        if (res == "ok") {
          alert("reviewed success");
          window.location.reload();
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getFeedback = async () => {
    const paps = await getPaper(conferencePDA, conferenceId);
    const pap = paps.find((element) => element.paperHash == paperHash);
    setReview(pap.reviewer);
    // return (<p>{JSON.stringify(pap.reviewer)}</p>)
  };

  return (
    <div>
      {/* <div> */}
      <Button color="primary" type="button" onClick={toggle}>
        Review
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
                  // required
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
        {/* <ModalFooter>
        {!walletAddress && (
            <Button color="success" onClick={connectWallet}>
              Connect wallet to proceed
            </Button>
          )}
          <Button color="primary" type="button" onClick={handleReviewsSubmit}>
            Submit
          </Button>{" "}
          <Button color="secondary" type="button" onClick={toggle}>
            Cancel
          </Button>
        </ModalFooter> */}
      </Modal>
      {/* </div> */}
      {/* <Button
        color="primary"
        id="toggler"
        style={{
          marginBottom: "1rem",
        }}
      >
        Review
      </Button> */}
      {/* <UncontrolledCollapse toggler="#toggler"> */}
      {/* <Card>
          <CardBody> */}

      {/* </CardBody>
        </Card> */}
      {/* </UncontrolledCollapse> */}
      {/* <Button type="button" onClick={getFeedback}>
        get all feedback
      </Button>
      <p>{JSON.stringify(review)}</p> */}
    </div>
  );
}
