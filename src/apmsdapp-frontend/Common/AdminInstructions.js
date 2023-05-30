import {
  IDL,
  PROGRAM_ID,
  getProvider,
  OPTS,
  SOLANA_NETWORK,
} from "../utils/const";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  Connection,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
  TransactionMessage,
  VersionedTransaction,
  Logs,
  sendAndConfirmTransaction
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
      console.log("nah", conferenceInfo)
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
    router.push("/main");
  } catch (error) {
    console.log(error);
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
    alert("error assigning reviewers and chair: ", error);
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

// export const payoutReviewers = async (conferenceId, conferencePDA, recipient) => {
//   try {
//     const provider = getProvider();
//     const program = new Program(IDL, PROGRAM_ID, provider);
//     console.log(recipient.toString())
    
//     // const res = await program.methods.withdraw(conferenceId, new BN(1*LAMPORTS_PER_SOL))
//     // .accounts({
//     //   user: provider.wallet.publicKey,
//     //   systemProgram: program.PROGRAM_ID,
//     //   conferenceList: new PublicKey(conferencePDA),
//     // })
//     // .rpc();

//     const result = await program.methods.payoutReviewer(new BN(1*LAMPORTS_PER_SOL))
//     .accounts({
//       payer: program.provider.wallet.publicKey,
//       recipient: recipient,
//       systemProgram: program.PROGRAM_ID,
//       conferenceList: new PublicKey(conferencePDA),
//     }).signers([new PublicKey(conferencePDA).publicKey]).rpc();
//     return result;
//   } catch (error) {
//     console.log("Error paying: ", error);
//   }
// };
export const payoutReviewers = async (conferenceId, conferencePDA, recipient, amount) => {
  try {
    const provider = getProvider();
    const program = new Program(IDL, PROGRAM_ID, provider);
    console.log(recipient.toString())
    
    // const res = await program.methods.withdraw(conferenceId, new BN(1*LAMPORTS_PER_SOL))
    // .accounts({
    //   user: provider.wallet.publicKey,
    //   systemProgram: program.PROGRAM_ID,
    //   conferenceList: new PublicKey(conferencePDA),
    // })
    // .rpc();
    // for (const i in recipient) {
    const res =  await program.methods.payoutReviewer(new PublicKey(conferenceId), new PublicKey(recipient), new BN(amount * LAMPORTS_PER_SOL))
      .accounts({
        conferenceList: new PublicKey(conferencePDA),
        recepient: new PublicKey(recipient),
        systemProgram: program.PROGRAM_ID,
      }).rpc();
    // }
    
    return res;
  } catch (error) {
    console.log("Error paying: ", error);
  }
};

// export const payoutReviewers = async (conferenceId, conferencePDA, recipient) => {
//   try {
//     const provider = getProvider();
//     const program = new Program(IDL, PROGRAM_ID, provider);
//     const programId = new web3.PublicKey(PROGRAM_ID);
//     const mintAddress = new web3.PublicKey(conferencePDA);
//     const connection = new Connection(SOLANA_NETWORK);
    
//     // The addresses of the recipients
//     // const recipients = [
//     //   new anchor.web3.PublicKey("recipientAddress1Here"),
//     //   new anchor.web3.PublicKey("recipientAddress2Here"),
//     //   new anchor.web3.PublicKey("recipientAddress3Here"),
//     // ];
    
//     // The amount of SOL tokens to send to each recipient
//     const amount = 1;
    
//     // Construct the transaction
//     const transaction = new web3.Transaction();
//     recipient.forEach((rec) => {
//       transaction.add(
//         SystemProgram.transfer({
//           fromPubkey: provider.wallet.publicKey,
//           toPubkey: rec,
//           lamports: web3.LAMPORTS_PER_SOL * 1,
//         })
//       );
//     });
    
//     // Sign and send the transaction
//     await connection.sendTransaction(transaction, [provider.wallet.payer]);
//   } catch (error) {
//     console.log("Error paying: ", error);
//   }
// };