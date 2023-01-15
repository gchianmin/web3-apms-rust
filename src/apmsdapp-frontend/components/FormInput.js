import React from "react";
import {
  Form,
  FormGroup,
  Label,
  Col,
  Input,
  FormText,
  Button,
  FormFeedback,
} from "reactstrap";

export default function FormInput({ handleSubmit, empty, existingDetails, editToggle }) {
  return (
    <div>
      {empty ? (
        <Form
          className="align-items-center justify-contents-center px-5 mx-5"
          onSubmit={handleSubmit}
        >
          <FormGroup row>
            <Label className="text-monospace" for="email" sm={2}>
              Email address
            </Label>
            <Col sm={10}>
              <Input
                id="email"
                name="email"
                placeholder="email address of the organiser"
                type="email"
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
                placeholder="A brief description of what the conference does"
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

          {/* <FormGroup row>
            <Label for="image" sm={2} className="text-monospace">
              Image
            </Label>
            <Col sm={10}>
              <Input id="image" name="image" type="file" required />
              <FormText className="font-italic">Max image size: 3MB</FormText>
            </Col>
          </FormGroup> */}
          <div className="d-flex justify-content-center align-items-center">
            <Button color="primary">Submit</Button>
          </div>
        </Form>
      ) 
      : 
      (
        <Form
          className="align-items-center justify-contents-center "
          onSubmit={handleSubmit}
        >
          {/* <FormGroup row>
            <Label className="text-monospace" for="email" sm={2}>
              Email address
            </Label>
            <Col sm={10}>
              <Input
                id="email"
                name="email"
                placeholder="email address of the organiser"
                type="email"
                required
              />
            </Col>
          </FormGroup> */}

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
              <Input id="date" name="date" type="date" required defaultValue={existingDetails.date}/>
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
              <Input id="deadlines" name="deadlines" type="date" required defaultValue={existingDetails.submissionDeadline}/>
            </Col>
          </FormGroup>

          {/* <FormGroup row>
            <Label for="image" sm={2} className="text-monospace">
              Image
            </Label>
            <Col sm={10}>
              <Input id="image" name="image" type="file" required />
              <FormText className="font-italic">Max image size: 3MB</FormText>
            </Col>
          </FormGroup> */}
          <div className="d-flex justify-content-center d-grid mx-auto">
            <Button className="mr-5 px-5" color="primary">Submit</Button>
            <Button className="px-5" color="secondary" onClick={editToggle}>
            Cancel
          </Button>
          </div>
        </Form>
      )}
    </div>
  );
}
