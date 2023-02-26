import React, { useState } from "react";
import { Form, FormGroup, Col, Button, Input } from "reactstrap";
import { RiAddCircleFill, RiDeleteBin6Line } from "react-icons/ri";
import { updateTpc } from "../Common/AdminInstructions";

const TpcForm = ({
  existingDetails,
  tpcToggle,
  conferencePDA,
}) => {
  var initialData = [];
  if (existingDetails.technicalProgramsCommittees.length > 0) {
    initialData = existingDetails.technicalProgramsCommittees;
  }
  const [formData, setFormData] = useState(initialData);
  const addField = () => {
    setFormData([...formData, { tpcName: "", tpcEmail: "" }]);
  };

  const deleteField = (index) => {
    setFormData(formData.filter((_, i) => i !== index));
  };

  const handleChange = (event, index) => {
    const { name, value } = event.target;
    setFormData(
      formData.map((field, i) =>
        index === i ? { ...field, [name]: value } : field
      )
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    updateTpc(conferencePDA, existingDetails, formData);
  };

  const renderForm = () => (
    <Form onSubmit={handleSubmit}>
      <FormGroup>
        <Col sm={10}>
          {formData.map((field, index) => (
            <div key={`${field}-${index}`} className="form-row pl-1 pb-2">
              <label
                htmlFor={`field${index + 1}`}
                className="text-monospace d-flex align-items-center mr-2"
              >
                Name
              </label>
              <Input
                type="text"
                id="tpcName"
                name={Object.keys(field)[0]}
                value={field[Object.keys(field)[0]]}
                onChange={(event) => handleChange(event, index)}
                className="form-control col-4 mr-2"
                placeholder="Name"
              />
              <label
                htmlFor={`field${index + 1}`}
                className="text-monospace d-flex align-items-center mr-2"
              >
                Email
              </label>
              <Input
                type="email"
                id="tpcEmail"
                name={Object.keys(field)[1]}
                value={field[Object.keys(field)[1]]}
                onChange={(event) => handleChange(event, index)}
                className="form-control col-4"
                placeholder="Email Address"
              />
              <RiDeleteBin6Line
                className=" my-auto"
                type="button"
                onClick={() => deleteField(index)}
                size={27}
                color="red"
              />
            </div>
          ))}
          <RiAddCircleFill
            className="pt-1"
            type="button"
            size={30}
            color="green"
            onClick={addField}
          />
        </Col>
      </FormGroup>
      <div className="d-flex justify-content-center d-grid mx-auto">
        <Button className="mr-5 px-5" color="primary">
          Submit
        </Button>
        <Button className="px-5" color="secondary" onClick={tpcToggle}>
          Cancel
        </Button>
      </div>
    </Form>
  );

  return <>{renderForm()}</>;
};

export default TpcForm;
