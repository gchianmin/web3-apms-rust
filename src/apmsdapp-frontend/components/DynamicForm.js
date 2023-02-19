import React, { useState, useEffect } from "react";
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
import {
  Program,
  AnchorProvider,
  web3,
  utils,
  BN,
} from "@project-serum/anchor";
import { useRouter } from "next/router";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const DynamicForm = ({ user, submitPaper, props}) => {
  const [formFields, setFormFields] = useState([{ name: "", email: "" }]);
  const [file, setFile] = useState(null);
  const [hash, setHash] = useState(null);
  const router = useRouter();
  const userEmail = user == undefined ? null : user.email;
  console.log("passed", {props})
  const handleAddField = () => {
    setFormFields([...formFields, { name: "", email: "" }]);
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

  // const deleteFile = async(paperId) => {
  //   try {
  //     paperId = "969e9f7f1f336a6309cd66080502c15d"
  //     const response = await fetch("/api/filedelete", {
  //       // method: "POST",
  //       body: paperId,
  //     });
  //     const data = await response.json();

  //     if (!response.ok) {
  //       alert(`Error ${response.status}!! ${data.message}`)
  //       throw data.message;
  //     }

  //     alert("Paper Deleted Successfully.")
  //     // router.push('/my-history')
  //   } catch (error) {
  //     console.log(error.message);
  //   }
  // }

  const uploadFile = async (event) => {
    event.preventDefault();
    var authors = []
    formFields.map((field, index)=>{
      authors.push({authorName: field.name, authorEmail: field.email})
    })
    console.log(authors)
    if (file.size > MAX_FILE_SIZE) {
      alert("File size too big");
      return;
    }
    const d = new Date();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("props", JSON.stringify(props));
    try {
      const response = await fetch("/api/fileupload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        alert(`Error ${response.status}!! ${data.message}`)
        throw data.message;
      }
      setHash(data.hash)
      console.log("Data", data.hash);
      const submitted = await submitPaper(data.hash, data.fileName, authors, d.toLocaleDateString() + " " + d.toLocaleTimeString(), new BN(1), "");
      // console.log(submitted)
      if (submitted=="ok" && response.ok) {
        alert("Paper Submitted Successfully. You may view the status under myHistory.")
        router.back()
    }
      else alert("error")
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div>
      <Form onSubmit={uploadFile}>
        <FormGroup row>
          <Label className="text-monospace d-flex align-items-center" for="main-email" sm={2}>
            Email Address
          </Label>
          <Col sm={10} className="d-flex align-items-center">
            <Input
              id="main-email"
              name="main-email"
              placeholder="email address of the organiser"
              type="email"
              value={userEmail}
              required
            />
          </Col>
        </FormGroup>

        <FormGroup row>
          <Label className="text-monospace d-flex align-items-center" for="author" sm={2}>
            Authors
          </Label>

          <Col sm={10} >
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
                  className="form-control col-5 mr-2"
                />
                <input
                  id="email"
                  placeholder="email address"
                  name="email"
                  type="email"
                  value={field.email}
                  onChange={(event) => handleInputChange(index, event)}
                  className="form-control col-5"
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
        {/* <div className="d-flex justify-content-center align-items-center">
          <Button color="primary" onClick={uploadFile}>Delete</Button>
        </div> */}
      </Form>
    </div>
  );
};

export default DynamicForm;