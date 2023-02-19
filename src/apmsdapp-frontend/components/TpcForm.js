import React, { useState } from "react";
import { Form, FormGroup, Col, Button } from "reactstrap";
import { RiAddCircleFill, RiDeleteBin6Line } from "react-icons/ri";

const TpcForm = ({ conferenceId, existingTpc, updateTpc, tpcToggle }) => {
  var initialData = [];
  if (existingTpc.length>0) {
    initialData = existingTpc
  }
  const [formData, setFormData] = useState(initialData);
  // console.log(formData);
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
    // console.log(formData);
  };

  const renderForm = () => (
    <Form >
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
              <input
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
              <input
                type="text"
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
    </Form>
  );
  return (
    <div>
      {conferenceId == undefined
        ? renderForm() 
        :  (
          <div>
            {renderForm()}
          <div className="d-flex justify-content-center d-grid mx-auto">
            <Button className="mr-5 px-5" color="primary" onClick={()=>updateTpc(conferenceId, formData)}>
              Submit
            </Button>
            <Button className="px-5" color="secondary" onClick={tpcToggle}>
              Cancel
            </Button>
          </div>
          </div>
        )}
    </div>
  );
};

export default TpcForm;
