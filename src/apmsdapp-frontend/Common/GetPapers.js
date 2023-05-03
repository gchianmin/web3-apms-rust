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
    8: "Payment Completed",
  };

  return statusMap[status] || "Unknown status";
};

export const getPaperWithHash = async (
  conferencePDA,
  conferenceId,
  paperHash
) => {
  try {
    const provider = getProvider();
    const program = new Program(IDL, PROGRAM_ID, provider);
    const conferenceListPDA = new PublicKey(conferencePDA);
    const conferenceInfo =
      await program.account.conferenceListAccountData.fetch(conferenceListPDA);
    const conference = conferenceInfo.conferences.find(
      (element) => element.id.toString() == conferenceId
    );

    const paper = conference.paperSubmitted.find(
      (element) => element.paperHash == paperHash
    );
    return paper;

    // console.log("ger", papers);
  } catch (error) {
    console.log("Error getting a paper : ", error);
  }
};

export const getPaperPendingReview = async (role, reviewerEmail) => {
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
    if (role == "reviewer") {
      for (const conference in conferences) {
        const paper = conferences[conference].paperSubmitted.find((p) =>
          p.reviewer.find(
            (r) => r.tpcEmail === reviewerEmail && r.feedback == ""
          )
        );

        if (paper) {
          paper.pk = conferences[conference].pk;
          paper.conferenceId = conferences[conference].id;
          paper.conferenceName = conferences[conference].name;
          paperWithReviewer.push(paper);
        }
      }

      return paperWithReviewer;
    } else if (role == "chair") {
      for (const conference in conferences) {
        const paper = conferences[conference].paperSubmitted.find(
          (p) =>
            p.paperChair.tpcEmail === reviewerEmail &&
            p.paperChair.feedback == ""
        );

        if (paper) {
          paper.pk = conferences[conference].pk;
          paper.conferenceId = conferences[conference].id;
          paper.conferenceName = conferences[conference].name;
          paperWithReviewer.push(paper);
        }
      }

      return paperWithReviewer;
    }
  } catch (error) {
    console.log("Error getting a paper : ", error);
  }
};

export const getPapersSubmitted = async (walletAddress) => {
  try {
    const provider = getProvider();
    const program = new Program(IDL, PROGRAM_ID, provider);
    const allAccounts = await getAllConferences();
    let paperSubmitted = [];

    for (const acc in allAccounts) {
      const conferencePDA = allAccounts[acc].publicKey;
      const res = await program.account.conferenceListAccountData.fetch(
        conferencePDA
      );
      for (const conf in res.conferences) {
        const paper = res.conferences[conf].paperSubmitted.filter(
          (p) => p.paperAdmin.toString() === walletAddress
        );

        for (const p in paper) {
          paper[p].pk = conferencePDA;
          paper[p].conferenceId = res.conferences[conf].id;
          paper[p].conferenceName = res.conferences[conf].name;
          paperSubmitted.push(paper[p]);
        }
      }
    }

    return paperSubmitted;
  } catch (error) {
    console.log("Error getting a paper : ", error);
  }
};

export const getPapersReviewed = async (role, walletAddress) => {
  try {
    const provider = getProvider();
    const program = new Program(IDL, PROGRAM_ID, provider);
    const allAccounts = await getAllConferences();
    let paperReviewed = [];

    if (role == "reviewer") {
      for (const acc in allAccounts) {
        const conferencePDA = allAccounts[acc].publicKey;
        const res = await program.account.conferenceListAccountData.fetch(
          conferencePDA
        );
        for (const conf in res.conferences) {
          const paper = res.conferences[conf].paperSubmitted.filter((p) =>
            p.reviewer.find(
              (r) => (r.tpcWallet.toString() === walletAddress && r.approval > 0)
            )
          );

          for (const p in paper) {
            paper[p].pk = conferencePDA;
            paper[p].conferenceId = res.conferences[conf].id;
            paper[p].conferenceName = res.conferences[conf].name;
            paperReviewed.push(paper[p]);
          }
        }
      }

      return paperReviewed;

    } else if (role == "chair") {
      let paperReviewedChair = [];
      for (const acc in allAccounts) {
        const conferencePDA = allAccounts[acc].publicKey;
        const res = await program.account.conferenceListAccountData.fetch(
          conferencePDA
        );
        for (const conf in res.conferences) {
          const paper = res.conferences[conf].paperSubmitted.filter(
            (p) =>
              p.paperChair.tpcWallet.toString() === walletAddress &&
              p.paperChair.approval > 0
          );

          for (const p in paper) {
            paper[p].pk = conferencePDA;
            paper[p].conferenceId = res.conferences[conf].id;
            paper[p].conferenceName = res.conferences[conf].name;
            paperReviewedChair.push(paper[p]);
          }
        }
      }

      return paperReviewedChair;
    }
  } catch (error) {
    console.log("Error getting a paper : ", error);
  }
};

export const getPaperPendingPayment = async (walletAddress) => {
  try {
    const provider = getProvider();
    const program = new Program(IDL, PROGRAM_ID, provider);
    const allAccounts = await getAllConferences();
    let paperSubmitted = [];

    for (const acc in allAccounts) {
      const conferencePDA = allAccounts[acc].publicKey;
      const res = await program.account.conferenceListAccountData.fetch(
        conferencePDA
      );
      for (const conf in res.conferences) {
        const paper = res.conferences[conf].paperSubmitted.find(
          (p) =>
            p.paperStatus == 2 &&
            p.feePaid == 0 &&
            p.paperAdmin.toString() === walletAddress
        );

        if (paper) {
          paper.pk = conferencePDA;
          paper.conferenceId = res.conferences[conf].id;
          paper.conferenceName = res.conferences[conf].name;
          paperSubmitted.push(paper);
        }
      }
    }

    return paperSubmitted;
  } catch (error) {
    console.log("Error getting a paper : ", error);
  }
};

export const getPaperPendingRevision = async (walletAddress) => {
  try {
    const provider = getProvider();
    const program = new Program(IDL, PROGRAM_ID, provider);
    const allAccounts = await getAllConferences();
    let paperSubmitted = [];

    for (const acc in allAccounts) {
      const conferencePDA = allAccounts[acc].publicKey;
      const res = await program.account.conferenceListAccountData.fetch(
        conferencePDA
      );
      for (const conf in res.conferences) {
        const paper = res.conferences[conf].paperSubmitted.find(
          (p) =>
            (p.paperStatus == 3 || p.paperStatus == 4) &&
            p.feePaid == 0 &&
            p.paperAdmin.toString() === walletAddress
        );

        if (paper) {
          paper.pk = conferencePDA;
          paper.conferenceId = res.conferences[conf].id;
          paper.conferenceName = res.conferences[conf].name;
          paperSubmitted.push(paper);
        }
      }
    }

    return paperSubmitted;
  } catch (error) {
    console.log("Error getting a paper : ", error);
  }
};
