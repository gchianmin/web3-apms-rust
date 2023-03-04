import { IDL, PROGRAM_ID, getProvider } from "../utils/const";
import { PublicKey } from "@solana/web3.js";
import { Program } from "@project-serum/anchor";
import { getAllConferences } from "./GetConferences";

export const getPaper = async (conferencePDA, conferenceId) => {
  try {
    const provider = getProvider();
    const program = new Program(IDL, PROGRAM_ID, provider);
    const conferenceListPDA = new PublicKey(conferencePDA);
    const data = await program.account.conferenceListAccountData.fetch(
      conferenceListPDA
    );

    for (let i in data.conferences) {
      if (data.conferences[i].id == conferenceId) {
        return data.conferences[i].paperSubmitted;
        // break;
      }
    }
    console.log("ger", papers);
  } catch (error) {
    console.log("Error getting a paper : ", error);
  }
};

export const getPaperStatus = (status) => {
  const statusMap = {
    0: "Submitted",
    1: "Under Review",
    2: "Accepted",
    3: "Accepted with Minor Revision",
    4: "Accepted with Major Revision",
    5: "Under Revision",
    6: "Rejected (Passed Deadline)",
    7: "Paper Rejected",
  };

  return statusMap[status] || "Unknown status";
};

export const getPaperPendingReview = async (reviewerEmail) => {
  try {
    const provider = getProvider();
    const program = new Program(IDL, PROGRAM_ID, provider);
    const allAccounts = await getAllConferences();
    let conferences = [];
    let paperWithReviewer = [];

    for (const acc in allAccounts) {
      const conferencePDA = allAccounts[acc].publicKey;
      const res = await program.account.conferenceListAccountData.fetch(
        conferencePDA
      );
      for (const conf in res.conferences) {
        if (
          res.conferences[conf].technicalProgramsCommittees.find(
            (tpc) => tpc.tpcEmail === reviewerEmail
          )
        ) {
          res.conferences[conf].pk = conferencePDA;
          conferences.push(res.conferences[conf]);
        }
      }
    }

    for (const conference in conferences) {
      const paper = conferences[conference].paperSubmitted.find((p) =>
        p.reviewer.find((r) => (r.tpcEmail === reviewerEmail) && r.feedback == "")
      );

      if (paper) {
        paper.pk = conferences[conference].pk
        paper.conferenceId = conferences[conference].id
        paper.conferenceName = conferences[conference].name
        paperWithReviewer.push(paper);}
    }

    return paperWithReviewer;
  } catch (error) {
    console.log("Error getting a paper : ", error);
  }
};
