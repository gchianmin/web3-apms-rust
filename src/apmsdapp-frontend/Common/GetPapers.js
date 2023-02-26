import { IDL, PROGRAM_ID, getProvider } from "../utils/const";
import { PublicKey } from "@solana/web3.js";
import { Program } from "@project-serum/anchor";

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
            return(data.conferences[i].paperSubmitted)
            // break;
        }
      }
      console.log("ger",papers);
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