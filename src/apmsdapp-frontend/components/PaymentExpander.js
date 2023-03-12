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
import { makePayment } from "../Common/AuthorInstructions";

export default function PaymentExpander({
  conferencePDA,
  conferenceId,
  paperHash,
}) {
  const { user } = useUser();
  const [review, setReview] = useState(null);
  const [radioSelected, setRadioSelected] = useState(null);

  const handlePaymentSubmit = async (event) => {
    event.preventDefault();
    try {
      const res = await makePayment(conferencePDA, conferenceId, paperHash)
      console.log("res", res);
      if (res == "ok") {
        alert("payment success");
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
    }
  };

//   const getFeedback = async () => {
//     const paps = await getPaper(conferencePDA, conferenceId);
//     const pap = paps.find((element) => element.paperHash == paperHash);
//     setReview(pap.reviewer);
//     // return (<p>{JSON.stringify(pap.reviewer)}</p>)
//   };

  return (
    <div>
      <Button
        color="primary"
        id="toggler"
        style={{
          marginBottom: "1rem",
        }}
      >
        Pay
      </Button>
      <UncontrolledCollapse toggler="#toggler">
        <Card>
          <CardBody>
            <Form
              className="align-items-center justify-contents-center "
              onSubmit={handlePaymentSubmit}
            >
              <p>Congratulations on your paper acceptance!</p>
              <p>Click "Pay" to pay 2 SOL for the registration.</p>
              <div className="d-flex justify-content-center align-items-center">
                <Button color="primary">Pay</Button>
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
