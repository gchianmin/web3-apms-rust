import React from "react";
import {
  Card,
  CardBody,
  CardTitle,
  CardSubtitle,
  CardText,
} from "reactstrap";

export default function CardComponent({ props }) {
  
  return (
    
    <div className="grid">
      <a
        href={"/conferences/" + props.pubkey.toString()}
        className="text-decoration-none"
        props={props}
      >
        <Card
          style={{
            width: "18rem",
          }}
        >
          <img alt="Sample" src="https://picsum.photos/300/200" />
          <CardBody>
            <CardTitle tag="h5">{props.name}</CardTitle>
            <CardSubtitle className="mb-2 text-secondary" tag="h6">
              {props.date}
            </CardSubtitle>
            <CardText>{props.description}</CardText>
          </CardBody>
        </Card>
      </a>
    </div>
  );
}
