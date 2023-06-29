import { useRouter } from "next/router";
import Header from "../../components/Header";
import { useEffect, useState, React } from "react";
import { Table, Button } from "reactstrap";
import { prisma } from "../../lib/prisma";

export const getServerSideProps = async (context) => {
  const { pid } = context.query;
  const reviewerList = await prisma.Reviewer.findMany({
    where: {
      paper_id: pid,
    },
  });
 
  return { props: { reviewerList: JSON.stringify(reviewerList) } };
};

export default function ViewReviewerDetails({ reviewerList }) {
  const router = useRouter();
  const {
    query: { pid },
  } = router;
  useEffect(() => {
    if (!router.isReady) return;

  }, [router.isReady]);

  
  const acceptanceEnum = (acceptance) => {
    const acceptanceMap = {
      0: "Pending",
      1: "Accepted",
      2: "Declined",
    };
    return acceptanceMap[acceptance] || "Unknown acceptance";
  };

  return (
    <>
      <Header props={`ReviewerList`} />
      <div className="pl-5 pt-4 pb-3">
        <h2>Reviewer List for Paper #{router.query.pid} </h2>
        <Table responsive={true}>
          <thead className="text-center">
            <tr>
              <th>Role</th>
              <th> Name</th>
              <th> Email</th>
              <th>Invitation Sent Date</th>
              <th>Invitation Expiry</th>
              <th>Acceptance</th>
            </tr>
          </thead>
          <tbody>
            {JSON.parse(reviewerList).map((reviewer) => (
              <tr key={reviewer.id}>
                <td className="text-center">{reviewer.role}</td>
                <td className="text-center">{reviewer.reviewer_name}</td>
                <td className="text-center">{reviewer.reviewer_email}</td>
                <td className="text-center">{reviewer.invitation_sent_date}</td>
                <td className="text-center">{reviewer.invitation_exp}</td>
                <td className="text-center">{acceptanceEnum(reviewer.acceptance)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        {/* ); */}
      </div>
    </>
  );
}
