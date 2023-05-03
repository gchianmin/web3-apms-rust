import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Col,
  Input,
} from "reactstrap";
import { makePayment } from "../Common/AuthorInstructions";
import { connectWallet } from "../Common/WalletConnection";

function PaymentExpander({
  conferencePDA,
  conferenceId,
  paperHash,
  walletAddress,
  paper,
}) {
  const [modal, setModal] = useState(false);
  const toggle = () => setModal(!modal);
  const [radioSelected, setRadioSelected] = useState(null);

  const handlePaymentSubmit = async (event) => {
    event.preventDefault();
    if (!radioSelected) {
      alert("Presenter cannot be empty!");
      return;
    }
    const presenter = {
      presenterName: getName(radioSelected),
      presenterEmail: radioSelected,
      presenterAffiliation: getAffiliation(radioSelected),
    };
    console.log(presenter)
    const d = new Date();
    const paymentDate = d.toLocaleDateString() + " " + d.toLocaleTimeString() + " " + Intl.DateTimeFormat().resolvedOptions().timeZone
   
    try {
      console.log("ok");
      const res = await makePayment(
        conferencePDA,
        conferenceId,
        paper.paperHash,
        paymentDate, 
        presenter,
      );
      console.log("res", res);

      if (res == "ok") {
        alert("payment success");
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const authors = [];
  for (const [key, value] of Object.entries(paper.paperAuthors)) {
    authors.push(value.authorEmail);
    console.log(authors);
  }

  const getName = (email) => {
    return paper.paperAuthors.find((a) => a.authorEmail == email).authorName;
  };

  const getAffiliation = (email) => {
    return paper.paperAuthors.find((a) => a.authorEmail == email).authorAffiliation;
  };

  return (
    <div>
      <Button color="primary" type="button" onClick={toggle}>
        Register
      </Button>
      <Modal isOpen={modal} toggle={toggle} size="xl">
        <ModalHeader toggle={toggle}>Registration and Payment</ModalHeader>
        <ModalBody>
          <div className="lead pl-3">
            <p>Congratulations on your paper acceptance! 🎉</p>
            <p>
              Fill up the form and pay 2 SOL to register for the conference.
            </p>

            <p>Paper ID: {paper.paperId}</p>
            <p>Paper Title: {paper.paperTitle}</p>
            <p>
              Authors:{" "}
              {paper.paperAuthors.map((name) => (
                <>
                  {name.authorName} - {name.authorAffiliation} <br />
                </>
              ))}
            </p>
          </div>

          <Form
            className="align-items-center justify-contents-center "
            onSubmit={handlePaymentSubmit}
          >
            {/* <FormGroup>
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
            </FormGroup> */}

            <FormGroup tag="fieldset">
              <Label for="presenter" sm={6}>
                Who will be presenting the papers?
              </Label>

              <FormGroup check className="pl-5">
                {authors.map((r, index) => (
                  <div key={index}>
                    {" "}
                    <Input
                      name="presenter"
                      type="radio"
                      onClick={() => setRadioSelected(r)}
                    />
                    <Label check>{getName(r)}</Label>
                  </div>
                ))}
              </FormGroup>
            </FormGroup>
            {!walletAddress && (
              <Button color="success" onClick={connectWallet}>
                Connect wallet to proceed
              </Button>
            )}
            <div className="d-flex justify-content-center align-items-center">
              <Button color="primary" className="mr-3">
                Submit Details and Pay
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
          <Button color="primary" type="button" onClick={handlePaymentSubmit}>
            Pay
          </Button>{" "}
          <Button color="secondary" type="button" onClick={toggle}>
            Cancel
          </Button>
        </ModalFooter> */}
      </Modal>
    </div>
  );
}

export default PaymentExpander;
