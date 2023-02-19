import { useState, React, useEffect } from "react";
import {
  FormGroup,
  Form,
  FormText,
  Input,
  Button,
  Label,
  Col,
  Row,
} from "reactstrap";
// import DynamicForm from "./DynamicForm";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function FileUpload({ user }) {
  const [file, setFile] = useState(null);
  const [modal, setModal] = useState(false);

  const changeHandler = (event) => {
    if (event.target.files && event.target.files[0]) {
      const i = event.target.files[0];
      setFile(i);
    }
  };

  const uploadFile = async () => {
    if (file.size > MAX_FILE_SIZE) {
      alert("File size too big");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("pda", "pda");
    try {
      const response = await fetch("/api/fileupload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw data;
      }
      setFile(null);
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div>
      <Form>
        <FormGroup row>
          <Label className="text-monospace" for="email" sm={2}>
            Email Address
          </Label>
          <Col sm={10}>
            <Input
              id="email"
              name="email"
              placeholder="email address of the organiser"
              type="email"
              value={user.email}
              required
            />
          </Col>
        </FormGroup>

        <FormGroup row>
          <Label className="text-monospace" for="author" sm={2}>
            Authors and email address
          </Label>
          <Col sm={10}>
            <DynamicForm/>
            {/* <Input
              id="email"
              name="email"
              placeholder="email address of the organiser"
              type="email"
              value={user.email}
              required
            /> */}
          </Col>
        </FormGroup>

        <FormGroup className="input-group">
          <Input
            className="form-control"
            id="file"
            name="file"
            type="file"
            onChange={changeHandler}
            accept=".pdf"
          />
          {/* <div className="input-group-append ">
            <span>
              {" "}
              <Button
                color="primary"
                onClick={uploadFile}
                className="float-right"
              >
                Upload
              </Button>
            </span>
          </div> */}
        </FormGroup>
        <p className="text-muted font-italic">
          <small>Max file size accepted: 5MB.</small>
        </p>
      </Form>
    </div>
  );
}
