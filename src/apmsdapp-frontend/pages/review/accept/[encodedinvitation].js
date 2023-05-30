import { useRouter } from "next/router";
import Header from "../../../components/Header";
import React from "react";
import { useEffect, useState } from "react";
import { Button } from "reactstrap";
// import { useUser } from "@auth0/nextjs-auth0/client";
import Link from "next/link";
import Image from "next/image";
import { PrismaClient } from "@prisma/client";

export const getServerSideProps = async (context) => {
  const prisma = new PrismaClient();

  const { encodedinvitation } = context.query;
  // const router = useRouter();
  const invitation = Buffer.from(encodedinvitation, "base64").toString("utf-8");
  const parsedInv = JSON.parse(invitation);

  const id = Buffer.from(parsedInv.paperid + parsedInv.email).toString(
    "base64"
  );
  const paperDetails = await prisma.Reviewer.findFirst({
    where: {
      id: id,
    },
  });

  return {
    props: {
      invitation: invitation,
      paperDetails: JSON.stringify(paperDetails),
    },
  };
};

export default function AcceptInvitationPage({ invitation, paperDetails }) {
  console.log("enter accept invite page");
  //   const { user } = useUser();
  // const [invitation, setInvitation] = useState(null);
  const router = useRouter();
  const paper = JSON.parse(paperDetails);
  console.log("paper", paper);
  const d = new Date();
  d.setDate(d.getDate() + 14);
  // const {
  //   query: { encodedinvitation },
  // } = router;

  // const decodeInvitation = async () => {
  //   const res = await fetch("/api/decodeinvitation", {
  //     body: JSON.stringify({
  //       encodedinvitation: encodedinvitation,
  //     }),
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     method: "POST",
  //   });
  //   const data = await res.json();
  //   setInvitation(JSON.parse(data));
  //   // console.log("this is res", JSON.parse(data));
  // };

  useEffect(() => {
    if (!router.isReady) return;
    // decodeInvitation();
  }, [router.isReady]);

  const notify = async () => {
    try {
      const res = await fetch("/api/acceptanceack", {
        body: JSON.stringify({
          name: paper.reviewer_name,
          reviewerEmail: paper.reviewer_email,
          organiserEmail: paper.organiser_email,
          conferenceId: paper.conference_id,
          conferencePDA: paper.conference_pda,
          conferenceName: paper.conference_name,
          id: paper.paper_id,
          title: paper.paper_title,
          organiserEmail: paper.organiser_email,
          deadline: d,
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
    } catch (error) {
      console.log(error);
      return;
    }
  };

  return (
    <>
      <Header props={`Paper Review Invitation`} />
      <div className="text-center pt-5">
        <Image src="/logo.png" alt="Logo" width={400} height={300} priority />

        {invitation && (
          <p className="lead hero pb-5 pt-4">
            Hi {paper.reviewer_name}, you are invited to review paper #{paper.paper_id} -{" "}
            {paper.paper_title}. To <em>accept</em> the invitation, please click
            'Confirm' below and login to the system to start reviewing!
          </p>
        )}

        <div className="d-flex justify-content-center d-grid col-4 mx-auto">
          <Link
            className="btn btn-block btn-success mr-4 btn-alignment"
            href="/my-task/"
            role="button"
            onClick={notify}
          >
            Confirm
          </Link>
          <Link
            className="btn btn-block btn-info mt-0 btn-alignment"
            href="/"
            role="button"
          >
            Cancel
          </Link>
        </div>
      </div>
    </>
  );
}
