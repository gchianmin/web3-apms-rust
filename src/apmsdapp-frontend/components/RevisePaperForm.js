import React, { useState } from "react";
import { RiAddCircleFill, RiDeleteBin6Line } from "react-icons/ri";
import {
  FormGroup,
  Form,
  FormText,
  Input,
  Button,
  Label,
  Col,
} from "reactstrap";
import { useRouter } from "next/router";
import { revisePaper } from "../Common/AuthorInstructions";
import ApiCallers from "../Common/ApiCallers";
import { MAX_FILE_SIZE } from "../utils/const";

const RevisePaperForm = ({ props, prevPaper }) => {
  const [file, setFile] = useState(null);
  const [responseLetter, setResponseLetter] = useState(null);
  const router = useRouter();

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

  const changeHandler = (event) => {
    if (event.target.files && event.target.files[0]) {
      const i = event.target.files[0];
      setFile(i);
    }
  };

  const changeHandlerForResponseLetter = (event) => {
    if (event.target.files && event.target.files[0]) {
      const i = event.target.files[0];
      setResponseLetter(i);
    }
  };

  const inputValidaton = () => {
    if (file.type != "application/pdf" || responseLetter.type != "application/pdf") {
      alert("Only PDF is accepted");
      return false;
    }

    if (file.size > MAX_FILE_SIZE || responseLetter.size > MAX_FILE_SIZE) {
      alert("File size too big");
      return false;
    }

    return true;
  };

  const uploadFile = async (event) => {
    event.preventDefault();

    if (!inputValidaton()) {
      return;
    }

    const paper = {
      title: event.target.title.value,
      abstract: event.target.abstract.value,
    };

    const d = new Date();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("responseLetter", responseLetter);
    formData.append("props", JSON.stringify(props));

    try {
      const response = await ApiCallers({
        apiUrl: "/api/fileupload",
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      // console.log("0989908",data)
      if (!response.ok) {
        alert(`Error ${response.status}!! ${data.message}`);
        throw data.message;
      }

      const submitted = await revisePaper(
        props.conferencePDA,
        props.conferenceId,
        prevPaper.paperHash,
        data.entropy,
        data.hash,
        data.fileName,
        paper.title,
        paper.abstract,
        d.toLocaleDateString() + " " + d.toLocaleTimeString(),
        data.responseLetterHash,
        data.responseLetterName,
      );

      if (submitted == "ok" && response.ok) {
        alert(
          "Paper Submitted Successfully. You may view the status under myHistory."
        );
        router.push("/my-history");
      } else console.log("error");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <div>
        <p className="pt-2">
          You are submitting a revised paper to conference:{" "}
          <em>
            <b>{props.conferenceName}</b>
          </em>
        </p>
        <a
          className="font-italic text-success lead"
          type="button"
          onClick={() =>
            sendProps(
              `/papers/${prevPaper.paperHash}`,
              props.conferencePDA,
              props.conferenceId,
              props.conferenceName
            )
          }
        >
          → Click here to view the previous paper ←
        </a>
      </div>

      <Form onSubmit={uploadFile} className="pt-3 my-3">
        <FormGroup row>
          <Label
            className="text-monospace d-flex align-items-center "
            for="title"
            sm={2}
          >
            Paper Title
          </Label>
          <Col sm={10} className="d-flex align-items-center ">
            <Input
              id="title"
              name="title"
              placeholder="Title of the paper"
              type="text"
              required
            />
          </Col>
        </FormGroup>

        <FormGroup row>
          <Label
            className="text-monospace d-flex align-items-center"
            for="abstract"
            sm={2}
          >
            Paper Abstract
          </Label>
          <Col sm={10} className="d-flex align-items-center">
            <Input
              id="abstract"
              name="abstract"
              placeholder="Abstract of the paper"
              type="textarea"
              required
            />
          </Col>
        </FormGroup>

        <FormGroup row>
          <Label className="text-monospace" for="paper" sm={2}>
            Paper
          </Label>
          <Col>
            <Input
              className="form-control"
              id="file"
              name="file"
              type="file"
              onChange={changeHandler}
              accept=".pdf"
            />
            <FormText>
              Max file size accepted: 5MB. Only PDF is accepted.
            </FormText>
          </Col>
        </FormGroup>

        <FormGroup row>
          <Label className="text-monospace" for="letter" sm={2}>
            Response Letter <small className="font-italic">[to address reviewers&apos; feedback]</small>
          </Label>
          <Col>
            <Input
              className="form-control"
              id="responseletter"
              name="responseletter"
              type="file"
              onChange={changeHandlerForResponseLetter}
              accept=".pdf"
            />
            <FormText>
              Max file size accepted: 5MB. Only PDF is accepted.
            </FormText>
          </Col>
        </FormGroup>

        <div className="d-flex justify-content-center align-items-center">
          <Button color="primary">Submit</Button>
        </div>
      </Form>
    </div>
  );
};

export default RevisePaperForm;
