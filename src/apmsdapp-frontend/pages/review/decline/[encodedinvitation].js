import { useRouter } from "next/router";
import Header from "../../../components/Header";
import { useEffect, React } from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "../../../lib/prisma";

export const getServerSideProps = async (context) => {
  const { encodedinvitation } = context.query;
  const invitation = Buffer.from(encodedinvitation, "base64").toString("utf-8");
  const parsedInv = JSON.parse(invitation);

  const id = Buffer.from(parsedInv.paperid + parsedInv.email + parsedInv.role).toString(
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

export default function DeclineInvitationPage({ invitation, paperDetails }) {
  const router = useRouter();
  const paper = JSON.parse(paperDetails);
  
  useEffect(() => {
    if (!router.isReady) return;
  }, [router.isReady]);

  const notify = async () => {
    try {
      const res = await fetch("/api/declineack", {
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
          role: paper.role,
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
        <Image src="/confman.png" alt="Logo" width={400} height={300} priority />

        {invitation && (
          <p className="lead hero pb-5 pt-4">
            Hi {paper.reviewer_name}, you are invited to review paper #{paper.paper_id} -{" "}
            {paper.paper_title}. To <em>decline</em> the invitation, please click
            &apos;Confirm&apos; below. We look forward to your next contribution!
          </p>
        )}

        <div className="d-flex justify-content-center d-grid col-4 mx-auto">
          <Link
            className="btn btn-block btn-success mr-4 btn-alignment"
            href="/"
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
