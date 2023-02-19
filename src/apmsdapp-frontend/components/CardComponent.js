import React from "react";
import {
  Card,
  CardBody,
  CardTitle,
  CardSubtitle,
  CardText,
  CardImg,
} from "reactstrap";

export default function CardComponent({ props, pk, img }) {

  return (
    <div className="my-2">
      <a
        href={"/conferences/" + pk.toString() + "-" + props.id.toString()}
        className="text-decoration-none"
        props={props}
      >
        <Card
          style={{
            width: "100%",
          }}
        >
          <CardImg
            alt="Card image"
            src="https://picsum.photos/900/180"
            style={{
              height: 180,
            }}
            top
            width="100%"
          />
       
          <CardBody>
            <CardTitle tag="h5">{props.name}</CardTitle>
            <CardText className="text-sm font-italic text-info">
              Organised By: {props.createdBy}
            </CardText>
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
