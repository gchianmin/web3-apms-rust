import React from "react";
import {
  Card,
  CardBody,
  CardTitle,
  CardSubtitle,
  CardText,
  CardImg,
} from "reactstrap";
import { useRouter } from "next/router";

const sendProps = (href, conferenceId, router) => {
  console.log("vfvdff", conferenceId)
  router.push({
    pathname: href,
    query: {
      conferenceId,
    },
  });
};

// if page == main
const renderMainContainer = (props, pk, router) => (
  <>
    <div className="my-2" >
      <a
        className="text-decoration-none"
        onClick={() =>
          sendProps(
            `/conferences/${pk.toString()}`,
            props.id.toString(),
            router
          )
        }
        type="button"
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
  </>
);


export default function CardComponent({
  props,
  pk,
  page,
}) {
  const router = useRouter();
  return page == "main"
    ? renderMainContainer(props, pk, router)
    : <p>Not Main</p>
}
