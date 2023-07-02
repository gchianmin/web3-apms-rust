import {
  IDL,
  PROGRAM_ID,
  getProvider
} from "../utils/const";
import {
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { Program, utils, BN } from "@project-serum/anchor";

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
        systemProgram: program.PROGRAM_ID,
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
    const conferenceInfo =
      await program.account.conferenceListAccountData.all();
    if (!conferenceInfo.find(c=>c.publicKey.toString() == conferencePDA.toString())) {
      await initializeAccount();
    }
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
  
    return (200)
  } catch (error) {
    console.log(error);
    return (error.statusCode || 500)
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

    const res =  await program.methods
      .assignReviewer(id, paperId, reviewers, chair)
      .accounts({
        conferenceList: conferenceListPDA,
        user: provider.wallet.publicKey,
      })
      .rpc();

    alert("added successfully");
    return res;
    
    
  } catch (error) {
    console.log("error assigning reviewers: ", error);
  }
};


export const payout = async (recipient) => {
  try {
    const provider = getProvider();
    const program = new Program(IDL, PROGRAM_ID, provider);
    const res = await program.methods.payoutReviewer(new BN(1*LAMPORTS_PER_SOL))
    .accounts({
      payer: program.provider.wallet.publicKey,
      recipient: recipient,
      systemProgram: program.PROGRAM_ID,
    })
    .rpc();

    return res;
  } catch (error) {
    console.log("Error paying: ", error);
  }
};

export const payoutReviewers = async (conferenceId, conferencePDA, recipient, amount) => {
  try {
    const provider = getProvider();
    const program = new Program(IDL, PROGRAM_ID, provider);

    const res =  await program.methods.payoutReviewer(new PublicKey(conferenceId), new PublicKey(recipient), new BN(amount * LAMPORTS_PER_SOL))
      .accounts({
        conferenceList: new PublicKey(conferencePDA),
        recepient: new PublicKey(recipient),
        systemProgram: program.PROGRAM_ID,
      }).rpc();
    
    return res;
  } catch (error) {
    console.log("Error paying: ", error);
  }
};