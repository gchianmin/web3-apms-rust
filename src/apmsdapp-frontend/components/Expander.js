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
} from "reactstrap";
import { reviewPaper } from "../Common/ReviewerInstructions";
import { useUser } from "@auth0/nextjs-auth0/client";
import { getPaper } from "../Common/GetPapers";

export default function Expander({props, paperHash}) {
  const { user } = useUser();
  const [review, setReview] = useState(null);
  const [radioSelected, setRadioSelected] = useState(null);

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
      const res = await reviewPaper(
        props.conferencePDA,
        props.conferenceId,
        paperHash,
        user.email,
        false,
        data.approval,
        data.feedback
      );
      console.log("res", res);
      if (res == "ok") {
        alert("reviewed success");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getFeedback = async () => {
    const paps = await getPaper(props.conferencePDA, props.conferenceId);
    const pap = paps.find((element) => element.paperHash == paperHash);
    setReview(pap.reviewer);
    // return (<p>{JSON.stringify(pap.reviewer)}</p>)
  };
  return (
    <div>
      <Button
        color="primary"
        id="toggler"
        style={{
          marginBottom: "1rem",
        }}
      >
        Review
      </Button>
      <UncontrolledCollapse toggler="#toggler">
        <Card>
          <CardBody>
            <Form
              className="align-items-center justify-contents-center "
              onSubmit={handleReviewsSubmit}
            >
              <FormGroup>
                <Label className="text-monospace" for="feedback" sm={2}>
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
                <Label className="text-monospace" for="approval" sm={2}>
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

              <div className="d-flex justify-content-center align-items-center">
                <Button color="primary">Submit</Button>
              </div>
            </Form>
          </CardBody>
        </Card>
      </UncontrolledCollapse>
      {/* <Button type="button" onClick={getFeedback}>
        get all feedback
      </Button>
      <p>{JSON.stringify(review)}</p> */}
    </div>
  );
}
