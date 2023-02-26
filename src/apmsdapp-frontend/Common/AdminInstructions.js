import { IDL, PROGRAM_ID, getProvider } from "../utils/const";
import { PublicKey } from "@solana/web3.js";
import { Program, utils } from "@project-serum/anchor";

export const updateTpc = async (conferencePDA, conferenceDetails, tpc) => {
  try {
    const provider = getProvider();
    const program = new Program(IDL, PROGRAM_ID, provider);
    if (conferenceDetails.admin != provider.wallet.publicKey.toString()) {
      alert("you are not the admin");
    } else {
      await program.methods
        .updateTpc(conferenceDetails.id, tpc)
        .accounts({
          conferenceList: new PublicKey(conferencePDA),
          user: provider.wallet.publicKey,
        })
        .rpc();

      alert("Successfully added committees!");
      window.location.reload();
    }
  } catch (error) {
    console.error(error);
  }
};

export const modifyConference = async (
  existingDetails,
  conferencePDA,
  name,
  description,
  date,
  venue,
  submissionDeadline,
  technicalProgramsCommittees,
  conferenceLink
) => {
  try {
    const provider = getProvider();
    const program = new Program(IDL, PROGRAM_ID, provider);

    if (existingDetails.admin != provider.wallet.publicKey.toString()) {
      alert("you are not the admin");
    } else {
      let id = existingDetails.id;
      let paperSubmitted = existingDetails.paperSubmitted;
      let feeReceived = existingDetails.feeReceived;
      let createdBy = existingDetails.createdBy;
      let organiserEmail = existingDetails.organiserEmail;
      let admin = provider.wallet.publicKey;
      await program.methods
        .updateConference({
          id,
          admin,
          name,
          description,
          date,
          venue,
          submissionDeadline,
          paperSubmitted,
          feeReceived,
          createdBy,
          organiserEmail,
          technicalProgramsCommittees,
          conferenceLink,
        })
        .accounts({
          conferenceList: new PublicKey(conferencePDA),
          user: provider.wallet.publicKey,
        })
        .rpc();

      alert("Successfully modified the conference!");
      window.location.reload();
    }
  } catch (error) {
    console.log("Error modifying conference account: ", error);
  }
};

export const cancelConference = async (
  conferencePDA,
  existingDetails,
  router
) => {
  try {
    const provider = getProvider();
    const program = new Program(IDL, PROGRAM_ID, provider);
    if (existingDetails.admin != provider.wallet.publicKey.toString()) {
      alert("you are not the admin");
    } else {
      await program.methods
        .deleteConference(existingDetails.id)
        .accounts({
          conferenceList: new PublicKey(conferencePDA),
          user: provider.wallet.publicKey,
        })
        .rpc();

      alert("Successfully deleted the conference!");
      router.push("/main");
    }
  } catch (error) {
    console.log("Error deleting conference account: ", error);
  }
};

export const initializeAccount = async () => {
  try {
    const provider = getProvider();
    const program = new Program(IDL, PROGRAM_ID, provider);
    const [conferencePDA, _] = await PublicKey.findProgramAddressSync(
      [
        utils.bytes.utf8.encode("CONFERENCE"),
        provider.wallet.publicKey.toBuffer(),
      ],
      program.programId
    );
    await program.methods
      .initialize()
      .accounts({
        systemProgram: SYSTEM_PROGRAM.PROGRAM_ID,
        conferenceList: conferencePDA,
        user: provider.wallet.publicKey,
      })
      .rpc();
  } catch (error) {
    console.error(error);
  }
};

export const createConference = async (
  email,
  createdby,
  name,
  description,
  date,
  venue,
  deadlines,
  conferencelink,
  router
) => {
  try {
    const provider = getProvider();
    const program = new Program(IDL, PROGRAM_ID, provider);
    const [conferencePDA, _] = await PublicKey.findProgramAddressSync(
      [
        utils.bytes.utf8.encode("CONFERENCE"),
        provider.wallet.publicKey.toBuffer(),
      ],
      program.programId
    );
    await program.methods
      .createConference(
        name,
        description,
        date,
        venue,
        deadlines,
        createdby,
        email,
        conferencelink
      )
      .accounts({
        conferenceList: conferencePDA,
        user: provider.wallet.publicKey,
      })
      .rpc();
    router.push("/main");
  } catch (error) {
    console.error(error);
  }
};

export const assignReviewersandChair = async (
  conferencePDA,
  conferenceId,
  paperId,
  reviewers,
  chair
) => {
  try {
    const provider = getProvider();
    const program = new Program(IDL, PROGRAM_ID, provider);
    const conferenceListPDA = new PublicKey(conferencePDA);
    let id = new PublicKey(conferenceId);

    await program.methods
      .assignReviewer(id, paperId, reviewers, chair)
      .accounts({
        conferenceList: conferenceListPDA,
        user: provider.wallet.publicKey,
      })
      .rpc();
    // await program.rpc.assignReviewer(id, paperId, reviewers, chair, {
    //   accounts: {
    //     conferenceList: conferenceListPDA,
    //     user: provider.wallet.publicKey,
    //   },
    // });
    alert("added successfully");
    window.location.reload();
  } catch (error) {
    alert("error assigning reviewers and chair: ", error);
    console.log("error assigning reviewers: ", error);
  }
};
