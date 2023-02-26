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
import { BN } from "@project-serum/anchor";
import { useRouter } from "next/router";
import { submitPaper } from "../Common/AuthorInstructions";
import { useUser } from "@auth0/nextjs-auth0/client";
import ApiCallers from "../Common/ApiCallers";
import { MAX_FILE_SIZE } from "../utils/const";

const DynamicForm = ({ props }) => {
  const [formFields, setFormFields] = useState([
    { name: "", email: "", affiliation: "" },
  ]);
  const [file, setFile] = useState(null);
  const router = useRouter();
  const { user } = useUser();
  const handleAddField = () => {
    setFormFields([...formFields, { name: "", email: "", affiliation: "" }]);
  };

  const handleRemoveField = (index) => {
    if (formFields.length > 1)
      setFormFields(formFields.filter((field, i) => i !== index));
  };

  const handleInputChange = (index, event) => {
    const newFormFields = [...formFields];
    newFormFields[index][event.target.name] = event.target.value;
    setFormFields(newFormFields);
  };

  const changeHandler = (event) => {
    if (event.target.files && event.target.files[0]) {
      const i = event.target.files[0];
      setFile(i);
    }
  };

  const inputValidaton = (emailValidation) => {
    if (!emailValidation.includes(user.email)) {
      alert(
        "Please include yourself as an author and use the login email address"
      );
      return false;
    }

    if (file.type != "application/pdf") {
      alert("Only PDF is accepted");
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert("File size too big");
      return false;
    }

    return true;
  };

  const uploadFile = async (event) => {
    event.preventDefault();
    var authors = [];
    var emailValidation = [];

    formFields.map((field, index) => {
      authors.push({
        authorName: field.name,
        authorEmail: field.email,
        authorAffiliation: field.affiliation,
      });
      emailValidation.push(field.email);
    });

    if (!inputValidaton(emailValidation)) {
      return;
    }

    const paper = {
      title: event.target.title.value,
      abstract: event.target.abstract.value,
    };

    const d = new Date();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("props", JSON.stringify(props));

    try {
      const response = await ApiCallers({ apiUrl: "/api/fileupload", method: "POST", body: formData });
      const data = await response.json();

      if (!response.ok) {
        alert(`Error ${response.status}!! ${data.message}`);
        throw data.message;
      }

      const submitted = await submitPaper(
        props.conferencePDA,
        props.conferenceId,
        data.entropy,
        data.hash,
        data.fileName,
        paper.title,
        paper.abstract,
        authors,
        d.toLocaleDateString() + " " + d.toLocaleTimeString(),
        new BN(1),
        ""
      );

      if (submitted == "ok" && response.ok) {
        alert(
          "Paper Submitted Successfully. You may view the status under myHistory."
        );
        router.back();
      } else console.log("error");
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div>
      <Form onSubmit={uploadFile}>
        <FormGroup row>
          <Label
            className="text-monospace d-flex align-items-center"
            for="author"
            sm={2}
          >
            Authors
          </Label>

          <Col sm={10}>
            <FormText className="font-italic">
              {" "}
              * Please inclulde yourself as an author
            </FormText>
            {formFields.map((field, index) => (
              <div key={`${field}-${index}`} className="form-row pl-1 pb-2">
                <input
                  id="name"
                  placeholder="name"
                  name="name"
                  type="text"
                  value={field.name}
                  onChange={(event) => handleInputChange(index, event)}
                  className="form-control col-3 mr-3"
                />
                <input
                  id="email"
                  placeholder="email address"
                  name="email"
                  type="email"
                  value={field.email}
                  onChange={(event) => handleInputChange(index, event)}
                  className="form-control col-3 mr-3"
                />
                <input
                  id="affiliation"
                  placeholder="affiliation"
                  name="affiliation"
                  type="text"
                  value={field.affiliation}
                  onChange={(event) => handleInputChange(index, event)}
                  className="form-control col-4"
                />
                {formFields.length != 1 && (
                  <RiDeleteBin6Line
                    className="col-1 my-auto"
                    type="button"
                    onClick={() => handleRemoveField(index)}
                    size={27}
                    color="red"
                  />
                )}
              </div>
            ))}
            <RiAddCircleFill
              className="pt-1"
              type="button"
              size={30}
              color="green"
              onClick={handleAddField}
            />
          </Col>
        </FormGroup>

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
          <Label className="text-monospace" for="email" sm={2}>
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
        <div className="d-flex justify-content-center align-items-center">
          <Button color="primary">Submit</Button>
        </div>
      </Form>
    </div>
  );
};

export default DynamicForm;
