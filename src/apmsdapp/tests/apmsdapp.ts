const assert = require('assert')
const anchor = require('@project-serum/anchor')
const { SystemProgram } = anchor.web3
const { PublicKey } = require('@solana/web3.js')


describe("apmsdapp", async () => {
  const provider = anchor.getProvider();
  anchor.setProvider(provider);
  const program = anchor.workspace.Apmsdapp;
  const user = program.provider.wallet;
  const newUser = anchor.web3.Keypair.generate();

  const [conferencePDA, _] = await PublicKey
    .findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode("CONFERENCE"),
        provider.wallet.publicKey.toBuffer()
      ],
      program.programId
    );

  const initialize = async () => {
    await program.rpc.initialize({
      accounts: {
        systemProgram: SystemProgram.programId,
        conferenceList: conferencePDA,
        user: user.publicKey,
      },
    });
  }

  const createConference = async (name, description, date, venue, submission_deadline, created_by, organiser_email, conference_link) => {
    await program.rpc.createConference(name, description, date, venue, submission_deadline, created_by, organiser_email, conference_link, {
      accounts: {
        conferenceList: conferencePDA,
        user: user.publicKey,
      },
    });
  }

  const updateConference = async (id, admin, name, description, date, venue, submissionDeadline, paperSubmitted, feeReceived, createdBy, organiserEmail, technicalProgramsCommittees, conferenceLink) => {
    await program.rpc.updateConference(
      { id, admin, name, description, date, venue, submissionDeadline, paperSubmitted, feeReceived, createdBy, organiserEmail, technicalProgramsCommittees, conferenceLink },
      {
        accounts: {
          conferenceList: conferencePDA,
          user: user.publicKey,
        },
      });
  }

  const updateTpc = async (id, tpcName, tpcEmail, tpcWallet) => {
    await program.rpc.updateTpc(
      id, { tpcName, tpcEmail, tpcWallet },
      {
        accounts: {
          conferenceList: conferencePDA,
          user: user.publicKey,
        },
      }
    );
  }

  const deleteConference = async (id) => {
    await program.rpc.deleteConference(
      id,
      {
        accounts: {
          conferenceList: conferencePDA,
          user: user.publicKey,
        },
      }
    );
  }

  const submitPaper = async (id, paperId, authorName, authorEmail, dateSubmitted, paperStatus, version) => {
    await program.rpc.submitPaper(
      id, paperId, { authorName, authorEmail }, dateSubmitted, paperStatus, version,
      {
        accounts: {
          conferenceList: conferencePDA,
          user: user.publicKey,
        },
      }
    );
  }

  const deletePaper = async (id, paperId) => {
    await program.rpc.deletePaper(
      id, paperId,
      {
        accounts: {
          conferenceList: conferencePDA,
          user: user.publicKey,
        },
      }
    );
  }

  const getAllConference = async () => {
    try {
      const conferenceInfo = await program.account.conferenceListAccountData.all()
      console.log("Conferences List", conferenceInfo)
    }
    catch (e) {
      console.log(e)
    }
  }

  it("initialize account data", async () => {

    await initialize()
    const data = await program.account.conferenceListAccountData.fetch(conferencePDA);
    // console.log(data)
    assert.equal(data.count, 0);
    assert.equal(data.conferences.length, 0);
    assert.equal(data.deletedIndexes.length, 0);
  });

  it("create first conference", async () => {

    await createConference("IEEE Conference", "A yearly conference for authors globally.", "2023-04-05 00:00:00", "Marina Bay Sand", "2023-02-05 00:00:00", "May", "a@gmail.com", "https://example-link")
    const data = await program.account.conferenceListAccountData.fetch(conferencePDA);
    // console.log(data)
    assert.equal(data.count, 1);
    assert.equal(data.conferences.length, 1);
    assert.equal(data.deletedIndexes.length, 0);
    const firstConference = data.conferences[0];
    assert.equal(firstConference.id.toBytes().length, 32);
    assert.equal(firstConference.name, "IEEE Conference");
    assert.equal(firstConference.description, "A yearly conference for authors globally.");
    assert.equal(firstConference.date, "2023-04-05 00:00:00");
    assert.equal(firstConference.venue, "Marina Bay Sand");
    assert.equal(firstConference.submissionDeadline, "2023-02-05 00:00:00");
    assert.equal(firstConference.createdBy, "May");
    assert.equal(firstConference.organiserEmail, "a@gmail.com")
    assert.equal(firstConference.conferenceLink, "https://example-link")
  });

  it("create second conference", async () => {

    await createConference("ACM Conference", "ACM Conference description", "2023-05-05 00:00:00", "Suntec Convention Centre", "2023-04-05 00:00:00", "May", "a@gmail.com", "https://example-link")
    const data = await program.account.conferenceListAccountData.fetch(conferencePDA);
    // console.log(data)
    assert.equal(data.count, 2);
    assert.equal(data.conferences.length, 2);
    assert.equal(data.deletedIndexes.length, 0);
    const secondConference = data.conferences[1];
    assert.equal(secondConference.id.toBytes().length, 32);
    assert.equal(secondConference.name, "ACM Conference");
    assert.equal(secondConference.description, "ACM Conference description");
    assert.equal(secondConference.date, "2023-05-05 00:00:00");
    assert.equal(secondConference.venue, "Suntec Convention Centre");
    assert.equal(secondConference.submissionDeadline, "2023-04-05 00:00:00");
    assert.equal(secondConference.createdBy, "May");
    assert.equal(secondConference.organiserEmail, "a@gmail.com")
    assert.equal(secondConference.conferenceLink, "https://example-link")
  });

  it("Fetch All Conferences", async () => {
    getAllConference()
  });

  it("Updating IEEE Conference", async () => {
    const data = await program.account.conferenceListAccountData.fetch(conferencePDA);
    // console.log(data.conferences[0].id)
    let id = data.conferences[0].id
    let admin = data.conferences[0].admin
    let name = "IEEE Conference Updated"
    let description = "IEEE Conference description"
    let date = "2023-08-05 00:00:00"
    let venue = "KLCC Convention Centre"
    let submissionDeadline = "2023-04-05 00:00:00"
    let paperSubmitted = data.conferences[0].paperSubmitted
    let feeReceived = data.conferences[0].feeReceived
    let createdBy = "May"
    let organiserEmail = "a@gmail.com"
    let technicalProgramsCommittees = data.conferences[0].technicalProgramsCommittees
    let conferenceLink = data.conferences[0].conferenceLink

    await updateConference(id, admin, name, description, date, venue, submissionDeadline, paperSubmitted, feeReceived, createdBy, organiserEmail, technicalProgramsCommittees, conferenceLink)

    const updatedData = await program.account.conferenceListAccountData.fetch(conferencePDA);
    // console.log(updatedData)
    assert.equal(updatedData.count, 2);
    assert.equal(updatedData.conferences.length, 2);
    assert.equal(updatedData.deletedIndexes.length, 0);
    const firstConference = updatedData.conferences[0];
    assert.equal(firstConference.id.toBytes().length, 32);
    assert.equal(firstConference.name, "IEEE Conference Updated");
    assert.equal(firstConference.description, "IEEE Conference description");
    assert.equal(firstConference.date, "2023-08-05 00:00:00");
    assert.equal(firstConference.venue, "KLCC Convention Centre");
    assert.equal(firstConference.submissionDeadline, "2023-04-05 00:00:00");
    assert.equal(firstConference.createdBy, "May");
    assert.equal(firstConference.organiserEmail, "a@gmail.com")
  })

  it("Updating TPC for conference 1", async () => {
    const data = await program.account.conferenceListAccountData.fetch(conferencePDA);
    // console.log(data.conferences[0].id)
    let id = data.conferences[0].id
    let tpcName = ["tpc1", "tpc2"]
    let tpcEmail = ["tpc1@gmail.com", "tpc2@gmail.com"]
    let tpcWallet = ["wallet1", "wallet2"]

    await updateTpc(id, tpcName, tpcEmail, tpcWallet)

    const updatedData = await program.account.conferenceListAccountData.fetch(conferencePDA);
    // console.log(updatedData)
    assert.equal(updatedData.count, 2);
    assert.equal(updatedData.conferences.length, 2);
    assert.equal(updatedData.deletedIndexes.length, 0);
    const firstConference = updatedData.conferences[0];
    assert.equal(firstConference.technicalProgramsCommittees.tpcName.toString(), "tpc1,tpc2");
    assert.equal(firstConference.technicalProgramsCommittees.tpcEmail.toString(), "tpc1@gmail.com,tpc2@gmail.com");
    assert.equal(firstConference.technicalProgramsCommittees.tpcWallet.toString(), "wallet1,wallet2");
    assert.equal(firstConference.name, "IEEE Conference Updated");
    assert.equal(firstConference.description, "IEEE Conference description");
    assert.equal(firstConference.date, "2023-08-05 00:00:00");
    assert.equal(firstConference.venue, "KLCC Convention Centre");
    assert.equal(firstConference.submissionDeadline, "2023-04-05 00:00:00");
    assert.equal(firstConference.createdBy, "May");
    assert.equal(firstConference.organiserEmail, "a@gmail.com")
  })

  it("Updating TPC for conference 1 - editing", async () => {
    const data = await program.account.conferenceListAccountData.fetch(conferencePDA);
    console.log(data.conferences[0].id)
    let id = data.conferences[0].id
    let tpcName = ["tpc3", "tpc4"]
    let tpcEmail = ["tpc3@gmail.com", "tpc4@gmail.com"]
    let tpcWallet = ["wallet3", "wallet4"]

    await updateTpc(id, tpcName, tpcEmail, tpcWallet)

    const updatedData = await program.account.conferenceListAccountData.fetch(conferencePDA);
    console.log(updatedData)
    assert.equal(updatedData.count, 2);
    assert.equal(updatedData.conferences.length, 2);
    assert.equal(updatedData.deletedIndexes.length, 0);
    const firstConference = updatedData.conferences[0];
    assert.equal(firstConference.technicalProgramsCommittees.tpcName.toString(), "tpc3,tpc4");
    assert.equal(firstConference.technicalProgramsCommittees.tpcEmail.toString(), "tpc3@gmail.com,tpc4@gmail.com");
    assert.equal(firstConference.technicalProgramsCommittees.tpcWallet.toString(), "wallet3,wallet4");
    assert.equal(firstConference.name, "IEEE Conference Updated");
    assert.equal(firstConference.description, "IEEE Conference description");
    assert.equal(firstConference.date, "2023-08-05 00:00:00");
    assert.equal(firstConference.venue, "KLCC Convention Centre");
    assert.equal(firstConference.submissionDeadline, "2023-04-05 00:00:00");
    assert.equal(firstConference.createdBy, "May");
    assert.equal(firstConference.organiserEmail, "a@gmail.com")
  })

  it("Fetch All Conferences after Updating", async () => {
    getAllConference()
  });

  it("Deleting IEEE Conference", async () => {
    const data = await program.account.conferenceListAccountData.fetch(conferencePDA);
    // console.log(data.conferences[0].id)
    let id = data.conferences[0].id

    await deleteConference(id)

    const updatedData = await program.account.conferenceListAccountData.fetch(conferencePDA);
    // console.log(updatedData)
    assert.equal(updatedData.count, 1);
    assert.equal(updatedData.conferences.length, 1);
    assert.equal(updatedData.deletedIndexes.length, 1);
  })

  it("Fetch All Conferences after deleting", async () => {
    getAllConference()
  });

  it("Submitting a paper", async () => {
    const data = await program.account.conferenceListAccountData.fetch(conferencePDA);
    // console.log(data.conferences[0].id)
    let id = data.conferences[0].id
    let paperId = "example hash"
    let authorName = ["A1", "A2"]
    let authorEmail = ["E1", "E2"]
    let dateSubmitted = "2023-02-05"
    let paperStatus = "Submitted"
    let version = new anchor.BN(1)

    await submitPaper(id, paperId, authorName, authorEmail, dateSubmitted, paperStatus, version)

    const updatedData = await program.account.conferenceListAccountData.fetch(conferencePDA);
    // console.log("sub", updatedData.conferences[0].technicalProgramsCommittees)
    // console.log(updatedData.conferences[0].paperSubmitted[0].paperAuthors)
    assert.equal(updatedData.count, 1);
    assert.equal(updatedData.conferences.length, 1);
    assert.equal(updatedData.deletedIndexes.length, 1);
    assert.equal(updatedData.conferences[0].paperSubmitted.length, 1);
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperId, "example hash");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperAdmin.toString(), user.publicKey.toString());
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperAuthors.authorName.toString(), "A1,A2");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperAuthors.authorEmail.toString(), "E1,E2");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].dateSubmitted, "2023-02-05");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperStatus, "Submitted");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].version, 1);
  })

  it("Submitting a 2nd paper", async () => {
    const data = await program.account.conferenceListAccountData.fetch(conferencePDA);
    // console.log(data.conferences[0].id)
    let id = data.conferences[0].id
    let paperId = "example hash2"
    let authorName = ["A3", "A4"]
    let authorEmail = ["E3", "E4"]
    let dateSubmitted = "2023-02-06"
    let paperStatus = "Submitted"
    let version = new anchor.BN(1)

    await submitPaper(id, paperId, authorName, authorEmail, dateSubmitted, paperStatus, version)

    const updatedData = await program.account.conferenceListAccountData.fetch(conferencePDA);
    // console.log("sub", updatedData.conferences[0].paperSubmitted)
    assert.equal(updatedData.count, 1);
    assert.equal(updatedData.conferences.length, 1);
    assert.equal(updatedData.deletedIndexes.length, 1);
    assert.equal(updatedData.conferences[0].paperSubmitted.length, 2);
    assert.equal(updatedData.conferences[0].paperSubmitted[1].paperId, "example hash2");
    assert.equal(updatedData.conferences[0].paperSubmitted[1].paperAdmin.toString(), user.publicKey.toString());
    assert.equal(updatedData.conferences[0].paperSubmitted[1].paperAuthors.authorName.toString(), "A3,A4");
    assert.equal(updatedData.conferences[0].paperSubmitted[1].paperAuthors.authorEmail.toString(), "E3,E4");
    assert.equal(updatedData.conferences[0].paperSubmitted[1].dateSubmitted, "2023-02-06");
    assert.equal(updatedData.conferences[0].paperSubmitted[1].paperStatus, "Submitted");
    assert.equal(updatedData.conferences[0].paperSubmitted[1].version, 1);
  })

  it("Fetch All Conferences after submitting a paper", async () => {
    getAllConference()
  });

  it("Deleting a paper", async () => {
    const data = await program.account.conferenceListAccountData.fetch(conferencePDA);
    // console.log(data.conferences[0].id)
    let id = data.conferences[0].id
    let paperId = "example hash"

    await deletePaper(id, paperId)

    const updatedData = await program.account.conferenceListAccountData.fetch(conferencePDA);
    // console.log("sub", updatedData.conferences[0].paperSubmitted)
    assert.equal(updatedData.count, 1);
    assert.equal(updatedData.conferences.length, 1);
    assert.equal(updatedData.deletedIndexes.length, 1);
    assert.equal(updatedData.conferences[0].paperSubmitted.length, 1);
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperId, "example hash2");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperAdmin.toString(), user.publicKey.toString());
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperAuthors.authorName.toString(), "A3,A4");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperAuthors.authorEmail.toString(), "E3,E4");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].dateSubmitted, "2023-02-06");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperStatus, "Submitted");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].version, 1);
  })

  it("Fetch All Conferences after deleting a paper", async () => {
    getAllConference()
  });

});