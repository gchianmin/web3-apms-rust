import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { useRouter } from "next/router";
import {
  RiDeleteBin6Line,
  RiDownload2Fill,
  RiInformationLine,
  RiArrowDownSLine,
  RiTeamLine,
} from "react-icons/ri";
import {
  Form,
  FormGroup,
  Label,
  Col,
  Input,
  Button,
  ButtonGroup,
} from "reactstrap";
import {
  checkIfWalletIsConnected,
  connectWallet,
} from "../Common/WalletConnection";
import { reviewPaper } from "../Common/ReviewerInstructions";
import { useUser } from "@auth0/nextjs-auth0/client";
import { getPaper } from "../Common/GetPapers";

export default function ReviewPaper() {
  const { user } = useUser();
  const [walletAddress, setWalletAddress] = useState(null);
  const [review, setReview] = useState(null);
  const [paper, setPaper] = useState(null);
  const [radioSelected, setRadioSelected] = useState(null);
  const router = useRouter();
  const {
    query: {
      conferencePDA,
      conferenceId,
      conferenceName,
      paperTitle,
      paperHash,
    },
  } = router;
  const props = {
    conferencePDA,
    conferenceId,
    conferenceName,
    paperTitle,
    paperHash,
  };

  useEffect(() => {
    if (!router.isReady) return;
    checkIfWalletIsConnected().then((res) => setWalletAddress(res));
  }, [router.isReady]);

  const handleReviewsSubmit = async (event) => {
    event.preventDefault();
    if (!radioSelected){
        alert("Appoval cannot be empty!")
        return
    }
    const data = {
      feedback: event.target.feedback.value,
      approval: radioSelected,
    };
    try {
      const res = await reviewPaper(
        props.conferencePDA,
        props.conferenceId,
        props.paperHash,
        user.email,
        false,
        data.approval,
        data.feedback
      );

      if (res == "ok" ) {
        switch (data.approval) {
          case 2:
            const res = await fetch("/api/paperacceptance", {
              body: JSON.stringify({
                name: 'Author',
                conferenceName: props.conferenceName,
                id: paper.id,
                title: paper.title,
                abstract: paper.abstract,
                feedback: data.feedback,
                authors: authors.map((author) => author.authorName).join(", "),
              }),
              headers: {
                "Content-Type": "application/json",
              },
              method: "POST",
            });
    
            const { error } = await res.json();
            if (error) {
              console.error(error);
              return;
            }
            break;
        
          default:
            break;
        }
        

        alert("reviewed success")
    };
    } catch (error) {
      console.error(error);
    }
  };

  const getFeedback = async () => {
    const paps = await getPaper(props.conferencePDA, props.conferenceId)
    const pap = paps.find(element => element.paperHash == props.paperHash)
    setPaper(pap)
    setReview(pap.reviewer)
    // return (<p>{JSON.stringify(pap.reviewer)}</p>)
  }
  return (
    <>
      <Header props={`Review Paper`} />
      <div className="pl-5 pt-4 pb-3">
        <h2>Review paper</h2>
        <div>
          <p className="pt-2">
            Reviewing Paper:{" "}
            <em>
              <b>{props.paperTitle}</b>
              <RiInformationLine className="ml-2" size={20} color="blue" />
            </em>
          </p>
        </div>

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
        <Button type="button" onClick={getFeedback}>get all feedback</Button>
        <p>{JSON.stringify(review)}</p>
        {/* <div className="pt-4"> */}
        {/* {!walletAddress && renderNotConnectedContainer()}
          {walletAddress && <DynamicForm props={props} />} */}
        {/* </div> */}
      </div>
    </>
  );
}
