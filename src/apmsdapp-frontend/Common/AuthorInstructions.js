import { IDL, PROGRAM_ID, getProvider } from "../utils/const";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Program, BN, utils } from "@project-serum/anchor";
import ApiCallers from "./ApiCallers";

export const submitPaper = async (
  conferencePDA,
  conferenceId,
  paperId,
  paperHash,
  paperName,
  paperTitle,
  paperAbstract,
  authors,
  dateSubmitted,
  version,
  prevVersion
) => {
  try {
    const provider = getProvider();
    const program = new Program(IDL, PROGRAM_ID, provider);
    const id = new PublicKey(conferenceId);

    await program.methods
      .submitPaper(
        id,
        paperId,
        paperHash,
        paperName,
        paperTitle,
        paperAbstract,
        authors,
        dateSubmitted,
        version,
        prevVersion
      )
      .accounts({
        conferenceList: new PublicKey(conferencePDA),
        user: provider.wallet.publicKey,
      })
      .rpc();
    return "ok";
  } catch (error) {
    console.log("Error submitting a paper : ", error);
  }
};

export const deletePaper = async (conferencePDA, conferenceId, paperHash) => {
  try {
    const provider = getProvider();
    const program = new Program(IDL, PROGRAM_ID, provider);
    const conferenceListPDA = new PublicKey(conferencePDA);

    let id = new PublicKey(conferenceId);

    await program.methods
      .deletePaper(id, paperHash)
      .accounts({
        conferenceList: conferenceListPDA,
        user: provider.wallet.publicKey,
      })
      .rpc();

    await deleteFile(paperHash, conferenceListPDA, conferenceId);
  } catch (error) {
    console.log("Error deleting paper: ", error);
  }
};
export const deleteFileIfUnsuccess = async (paperHash, conferencePDA, conferenceId) => {
  try {
    const formData = new FormData();
    formData.append("paperHash", paperHash);
    formData.append("conferenceListPDA", conferencePDA);
    formData.append("conferenceId", conferenceId);

    const response = await ApiCallers({
      apiUrl: "/api/filedelete",
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      alert(`Error ${response.status}!! ${data.message}`);
      throw data.message;
    }
    // alert("Paper Deleted Successfully.");
    // window.location.reload();
    // router.push('/my-history')
  } catch (error) {
    console.log(error.message);
  }
};

export const deleteFile = async (paperHash, conferencePDA, conferenceId) => {
  try {
    const formData = new FormData();
    formData.append("paperHash", paperHash);
    formData.append("conferenceListPDA", conferencePDA);
    formData.append("conferenceId", conferenceId);

    const response = await ApiCallers({
      apiUrl: "/api/filedelete",
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      alert(`Error ${response.status}!! ${data.message}`);
      throw data.message;
    }
    alert("Paper Deleted Successfully.");
    window.location.reload();
    // router.push('/my-history')
  } catch (error) {
    console.log(error.message);
  }
};

export const revisePaper = async (
  conferencePDA,
  conferenceId,
  prevPaperHash,
  paperId,
  paperHash,
  paperName,
  paperTitle,
  paperAbstract,
  dateSubmitted
) => {
  try {
    const provider = getProvider();
    const program = new Program(IDL, PROGRAM_ID, provider);
    const id = new PublicKey(conferenceId);

    await program.methods
      .revisePaper(
        id,
        prevPaperHash,
        paperId,
        paperHash,
        paperName,
        paperTitle,
        paperAbstract,
        dateSubmitted
      )
      .accounts({
        conferenceList: new PublicKey(conferencePDA),
        user: provider.wallet.publicKey,
      })
      .rpc();
    return "ok";
  } catch (error) {
    console.log("Error revising a paper : ", error);
  }
};

export const makePayment = async (
  conferencePDA,
  conferenceId,
  paperHash
) => {
  try {
    const provider = getProvider();
    const program = new Program(IDL, PROGRAM_ID, provider);
    const id = new PublicKey(conferenceId);
    console.log("money from: ", provider.wallet.publicKey.toString())
    console.log("paying money to: ", conferencePDA.toString());
    await program.methods
      .makePayment(
        id,
        paperHash,
        new BN(2 * LAMPORTS_PER_SOL),
      )
      .accounts({
        conferenceList: new PublicKey(conferencePDA),
        user: provider.wallet.publicKey,
        systemProgram: program.PROGRAM_ID,
      })
      .rpc();

    return "ok";
  } catch (error) {
    console.log("Error paying for a paper : ", error);
  }
};
