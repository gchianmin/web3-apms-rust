import { useRouter } from "next/router";
import Header from "../../components/Header";
import React from "react";
import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  CardText,
  CardImg,
  CardFooter,
} from "reactstrap";
import Popup from "../../components/Popup";
import { getConference } from "../../Common/GetConferences";
import { checkIfWalletIsConnected } from "../../Common/WalletConnection";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function ViewIndividualConferencePage() {
  const router = useRouter();
  const [conferenceDetails, setConferenceDetails] = useState([]);
  const [walletAddress, setWalletAddress] = useState(null);
  const {
    query: { conferenceId, conference },
  } = router;
  const queryProps = { conferenceId, conference };
  
  const getDetails = () => {
    try {
      if (conferenceDetails) {
        return (
          <>
            <Card className="my-2">
              <CardImg
                alt="sample image"
                src="https://picsum.photos/900/180"
                top
                width="100%"
              />
              <CardBody>
                <CardTitle tag="h4">{conferenceDetails.name}</CardTitle>
                <CardText>
                  <small className="text-muted font-italic">
                    Organised By: {conferenceDetails.createdBy}

                  </small>
                </CardText>
                <CardText className="lead">
                  {conferenceDetails.description}
                </CardText>
                <CardText>Date: {conferenceDetails.date}</CardText>
                <CardText>Venue: {conferenceDetails.venue}</CardText>
                <CardText>
                  Paper Submission Deadline:{" "}
                  {conferenceDetails.submissionDeadline}
                </CardText>
                <CardText>
                  Conference website:{" "}
                  <a
                    href={conferenceDetails.conferenceLink}
                    className="text-primary font-italic"
                  >
                    {conferenceDetails.conferenceLink}
                  </a>
                </CardText>
              </CardBody>

              <hr />

              <CardBody>
                <CardTitle tag="h4">Technical Programs Committees </CardTitle>
                <CardText>
                  {conferenceDetails.technicalProgramsCommittees.length == 0 ? (
                    <div>
                      <span>
                        Committees have not been added by the organiser. Please
                        check back later..
                      </span>
                      {walletAddress == conferenceDetails.admin && (
                        <Popup
                          tpc={true}
                          existingDetails={conferenceDetails}
                          walletAddress={walletAddress}
                          conferencePDA={queryProps.conference}
                        />
                      )}
                    </div>
                  ) : (
                    <>
                      {conferenceDetails.technicalProgramsCommittees.map(
                        (tpc) => (
                          <li key={tpc.tpcEmail}>{tpc.tpcName}</li>
                        )
                      )}
                    </>
                  )}
                </CardText>
              </CardBody>
              <CardFooter>
           
                  <Popup
                    walletAddress={walletAddress}
                    existingDetails={conferenceDetails}
                    conferencePDA={queryProps.conference}
                    tpc={false}
                  />
            
              </CardFooter>
            </Card>
          </>
        );
      } else {
        return (
          <>
            <div className="pl-5 pt-4 pb-3">
              <h2>Conference Details</h2>
            </div>
            <div className="pl-5 pb-3 font-italic text-muted text-mono">
              <p>Something Wrong/The conference has been cancelled.</p>
            </div>
          </>
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!router.isReady) return;
    checkIfWalletIsConnected().then((res) => setWalletAddress(res));
    getConference(queryProps.conference, queryProps.conferenceId).then((res) =>
      setConferenceDetails(res)
    );
  }, [router.isReady]);

  return (
    <>
      <Header props={`Conference Details`} />
      {getDetails()}
    </>
  );
}
