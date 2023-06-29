import { IDL, PROGRAM_ID, getProvider } from "../utils/const";
import { Program } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";

// get a list of all the conferences organised
export const getAllConferences = async () => {
  try {
    const provider = getProvider();
    const program = new Program(IDL, PROGRAM_ID, provider);
    const allConferences =
      await program.account.conferenceListAccountData.all();
    return allConferences;
  } catch (error) {
    console.error(error);
  }
};

export const getConference = async (conferenceListPDA, conferenceId) => {
    try {
      const provider = getProvider();
      const program = new Program(IDL, PROGRAM_ID, provider);
      const conferencePDA = new PublicKey(conferenceListPDA)
     
      const conferenceInfo =
        await program.account.conferenceListAccountData.fetch(conferencePDA);
      const conference = conferenceInfo.conferences.find(
        (element) => element.id.toString() == conferenceId
      );
      return conference
    } catch (error) {
      console.log(error);
    }
  };
