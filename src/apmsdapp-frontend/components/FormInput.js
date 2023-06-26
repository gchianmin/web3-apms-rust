import { Form, FormGroup, Label, Col, Input, Button } from "reactstrap";
import React, { useState } from "react";
import { RiAddCircleFill, RiDeleteBin6Line } from "react-icons/ri";
import {
  modifyConference,
  initializeAccount,
  createConference,
} from "../Common/AdminInstructions";
import { useRouter } from "next/router";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function FormInput({
  conferencePDA,
  empty,
  existingDetails,
  editToggle,
}) {
  const { user } = useUser();
  var initialData = [];
  const router = useRouter();
  if (existingDetails != undefined) {
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

  const createNewConference = async (
    email,
    createdby,
    name,
    description,
    date,
    venue,
    deadlines,
    conferencelink,
    router
  ) => {
    try {
      const res = await createConference(
        email,
        createdby,
        name,
        description,
        date,
        venue,
        deadlines,
        conferencelink,
        router
      );
  
    return res
    } catch (error) {
      console.log(error);
     
    }
  };
  const handleCreateSubmit = async (event) => {
    try {
      // Stop the form from submitting and refreshing the page.
      event.preventDefault();
      const d = new Date();
      // Get data from the form.
      const data = {
        email: event.target.email.value,
        createdby: event.target.createdby.value,
        name: event.target.name.value,
        description: event.target.description.value,
        date:
          event.target.date.value +
          " " +
          Intl.DateTimeFormat().resolvedOptions().timeZone,
        venue: event.target.venue.value,
        deadlines:
          event.target.deadlines.value +
          " " +
          Intl.DateTimeFormat().resolvedOptions().timeZone,
        conferencelink: event.target.conferencelink.value,
        // image: event.target.image.value,
      };
     
      if (data.email != user.email) {
        alert("please make sure the email address match your login email");
        return;
      }

      const createSuccess = await createNewConference(
        data.email,
        data.createdby,
        data.name,
        data.description,
        data.date,
        data.venue,
        data.deadlines,
        data.conferencelink,
        router
      );
       

      if (createSuccess == 200) {
        const res = await fetch("/api/createconferenceack", {
          body: JSON.stringify({
            organiserName: data.createdby,
            organiserEmail: data.email,
            conferenceName: data.name,
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
        router.push("/main");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const editSubmit = async (event) => {
    event.preventDefault();

    const data = {
      name: event.target.name.value,
      description: event.target.description.value,
      date:
        event.target.date.value +
        " " +
        Intl.DateTimeFormat().resolvedOptions().timeZone,
      venue: event.target.venue.value,
      deadlines:
        event.target.deadlines.value +
        " " +
        Intl.DateTimeFormat().resolvedOptions().timeZone,
      conferencelink: event.target.conferencelink.value,
      technicalProgramsCommittees: formData,
    };

    await modifyConference(
      existingDetails,
      conferencePDA,
      data.name,
      data.description,
      data.date,
      data.venue,
      data.deadlines,
      data.technicalProgramsCommittees,
      data.conferencelink
    );
  };

  return (
    <div>
      {empty ? (
        <Form
          className="align-items-center justify-contents-center px-5 mx-5"
          onSubmit={handleCreateSubmit}
        >
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
                defaultValue={user.email}
                required
              />
            </Col>
          </FormGroup>

          <FormGroup row>
            <Label className="text-monospace" for="createdby" sm={2}>
              Created By
            </Label>
            <Col sm={10}>
              <Input
                id="createdby"
                name="createdby"
                placeholder="display name of the organiser"
                type="text"
                required
              />
            </Col>
          </FormGroup>

          <FormGroup row>
            <Label for="name" sm={2} className="text-monospace">
              Conference Name
            </Label>
            <Col sm={10}>
              <Input
                id="name"
                name="name"
                placeholder="name of your conference"
                type="text"
                required
              />
            </Col>
          </FormGroup>

          <FormGroup row>
            <Label for="description" sm={2} className="text-monospace">
              Description
            </Label>
            <Col sm={10}>
              <Input
                id="description"
                name="description"
                placeholder="a brief description of what the conference does"
                type="textarea"
                required
              />
            </Col>
          </FormGroup>

          <FormGroup row>
            <Label for="date" sm={2} className="text-monospace">
              Date
            </Label>
            <Col sm={10}>
              <Input id="date" name="date" type="date" required />
            </Col>
          </FormGroup>

          <FormGroup row>
            <Label for="venue" sm={2} className="text-monospace">
              Venue
            </Label>
            <Col sm={10}>
              <Input
                id="venue"
                name="venue"
                type="text"
                placeholder="place the conference will be organised"
                required
              />
            </Col>
          </FormGroup>

          <FormGroup row>
            <Label for="deadlines" sm={2} className="text-monospace">
              Paper Submission Deadlines
            </Label>
            <Col sm={10}>
              <Input id="deadlines" name="deadlines" type="date" required />
            </Col>
          </FormGroup>

          <FormGroup row>
            <Label for="conferencelink" sm={2} className="text-monospace">
              Website Link
            </Label>
            <Col sm={10}>
              <Input
                id="conferencelink"
                name="conferencelink"
                type="url"
                required
              />
            </Col>
          </FormGroup>
          <div className="d-flex justify-content-center align-items-center">
            <Button color="primary">Submit</Button>
          </div>
        </Form>
      ) : (
        <Form
          className="align-items-center justify-contents-center "
          onSubmit={editSubmit}
        >
          <FormGroup row>
            <Label for="name" sm={2} className="text-monospace">
              Conference Name
            </Label>
            <Col sm={10}>
              <Input
                id="name"
                name="name"
                placeholder="name of your conference"
                type="text"
                required
                defaultValue={existingDetails.name}
              />
            </Col>
          </FormGroup>

          <FormGroup row>
            <Label for="description" sm={2} className="text-monospace">
              Description
            </Label>
            <Col sm={10}>
              <Input
                id="description"
                name="description"
                placeholder="A brief description of what the conference does"
                type="textarea"
                required
                defaultValue={existingDetails.description}
              />
            </Col>
          </FormGroup>

          <FormGroup row>
            <Label for="date" sm={2} className="text-monospace">
              Date
            </Label>
            <Col sm={10}>
              <Input
                id="date"
                name="date"
                type="date"
                required
                defaultValue={existingDetails.date.split(' ')[0]}
              />
            </Col>
          </FormGroup>

          <FormGroup row>
            <Label for="venue" sm={2} className="text-monospace">
              Venue
            </Label>
            <Col sm={10}>
              <Input
                id="venue"
                name="venue"
                type="text"
                placeholder="place the conference will be organised"
                required
                defaultValue={existingDetails.venue}
              />
            </Col>
          </FormGroup>

          <FormGroup row>
            <Label for="deadlines" sm={2} className="text-monospace">
              Paper Submission Deadlines
            </Label>
            <Col sm={10}>
              <Input
                id="deadlines"
                name="deadlines"
                type="date"
                required
                defaultValue={existingDetails.submissionDeadline.split(' ')[0]}
              />
            </Col>
          </FormGroup>

          <FormGroup row>
            <Label for="conferencelink" sm={2} className="text-monospace">
              Website Link
            </Label>
            <Col sm={10}>
              <Input
                id="conferencelink"
                name="conferencelink"
                type="url"
                required
                defaultValue={existingDetails.conferenceLink}
              />
            </Col>
          </FormGroup>

          <FormGroup row>
            <Label for="tpc" sm={2} className="text-monospace">
              Technical Programs Committees
            </Label>
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

          <div className="d-flex justify-content-center d-grid mx-auto">
            <Button className="mr-5 px-5" color="primary">
              Submit
            </Button>
            <Button className="px-5" color="secondary" onClick={editToggle}>
              Cancel
            </Button>
          </div>
        </Form>
      )}
    </div>
  );
}
