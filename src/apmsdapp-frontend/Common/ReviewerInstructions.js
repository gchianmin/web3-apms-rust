import { IDL, PROGRAM_ID, getProvider } from "../utils/const";
import { PublicKey } from "@solana/web3.js";
import { Program } from "@project-serum/anchor";

export const reviewPaper = async (
  conferencePDA,
  conferenceId,
  paperHash,
  reviewerEmail,
  chair,
  approval,
  feedback,
  feedbackSubmittedDatetime,
) => {
  try {
    const provider = getProvider();
    const program = new Program(IDL, PROGRAM_ID, provider);
    const id = new PublicKey(conferenceId);

    await program.methods
      .reviewPaper(
        id,
        paperHash,
        reviewerEmail,
        chair,
        approval,
        feedback, 
        feedbackSubmittedDatetime,
      )
      .accounts({
        conferenceList: new PublicKey(conferencePDA),
        user: provider.wallet.publicKey,
      })
      .rpc();
    return "ok";
  } catch (error) {
    console.log("Error reviewing a paper : ", error);
  }
};
