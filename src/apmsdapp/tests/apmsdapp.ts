import { AnchorError } from "@project-serum/anchor";

const assert = require('assert')
const anchor = require('@project-serum/anchor')
const { SystemProgram } = anchor.web3
const { PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js')


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

  const updateTpc = async (id, tpc) => {
    await program.rpc.updateTpc(
      id, tpc,
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

  const submitPaper = async (id, paperId, paperHash, paperName, paperTitle, paperAbstract, authors, dateSubmitted, version, prevVersion) => {
    await program.rpc.submitPaper(
      id, paperId, paperHash, paperName, paperTitle, paperAbstract, authors, dateSubmitted, version, prevVersion,
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

  const assignReviewer = async (conferenceId, paperId, reviewers, chair) => {
    await program.rpc.assignReviewer(
      conferenceId, paperId, reviewers, chair,
      {
        accounts: {
          conferenceList: conferencePDA,
          user: user.publicKey,
        },
      }
    );
  }

  const reviewPaper = async (conferenceId, paperHash, reviewerEmail, chair, approval, feedback) => {
    await program.rpc.reviewPaper(
      conferenceId, paperHash, reviewerEmail, chair, approval, feedback,
      {
        accounts: {
          conferenceList: conferencePDA,
          user: user.publicKey,
        },
      }
    )
  }

  const revisePaper = async (conferenceId, prevPaperHash, paperId, paperHash, paperName, paperTitle, paperAbstract, dateSubmitted ) => {
    await program.rpc.revisePaper(
      conferenceId, prevPaperHash, paperId, paperHash, paperName, paperTitle, paperAbstract, dateSubmitted,
      {
        accounts: {
          conferenceList: conferencePDA,
          user: user.publicKey,
        },
      }
    )
  }

  const makePayment = async (conferenceId, paperHash, amount) => {
    try {

      await program.rpc.makePayment(conferenceId, paperHash, new anchor.BN(2), {
        accounts: {
          conferenceList: conferencePDA,
          user: user.publicKey,
          systemProgram: SystemProgram.programId,
        },
      });
      console.log("money from: ", user.publicKey.toString())
      console.log("paying money to: ", conferencePDA.toString());

    } catch (error) {
      console.log("Error payiing: ", error);
    }
  }

  const payoutReviewer = async (conferenceId) => {
    try {
      const res = await program.rpc.payoutReviewer(conferenceId, {
        accounts: {
          conferenceList: conferencePDA,
          user: user.publicKey,
          systemProgram: SystemProgram.programId,
        },
      });
      return res
    } catch (error) {
      console.log("Error payout: ", error);
    }
    
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
    let tpcName = "tpc1"
    let tpcEmail = "tpc1@gmail.com"

    await updateTpc(id, [{ tpcName, tpcEmail }])

    const updatedData = await program.account.conferenceListAccountData.fetch(conferencePDA);
    // console.log(updatedData)
    assert.equal(updatedData.count, 2);
    assert.equal(updatedData.conferences.length, 2);
    assert.equal(updatedData.deletedIndexes.length, 0);
    const firstConference = updatedData.conferences[0];
    assert.equal(Object.entries(firstConference.technicalProgramsCommittees).toString(), Object.entries([{ tpcEmail: 'tpc1@gmail.com', tpcName: 'tpc1' }]).toString())
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
    let tpc1 = { tpcName: "tpc3", tpcEmail: "tpc3@gmail.com" }
    let tpc2 = { tpcName: "tpc4", tpcEmail: "tpc4@gmail.com" }
    let newArr = []
    newArr.push(tpc1)
    newArr.push(tpc2)


    await updateTpc(id, newArr)

    const updatedData = await program.account.conferenceListAccountData.fetch(conferencePDA);
    // console.log(updatedData)
    assert.equal(updatedData.count, 2);
    assert.equal(updatedData.conferences.length, 2);
    assert.equal(updatedData.deletedIndexes.length, 0);
    const firstConference = updatedData.conferences[0];
    assert.equal(Object.entries(firstConference.technicalProgramsCommittees).toString(), Object.entries(newArr).toString())
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


  //id, paperId, paperHash, paperName, paperTitle, paperAbstract, authors, dateSubmitted, version, preVersion
  it("Submitting a paper", async () => {
    const data = await program.account.conferenceListAccountData.fetch(conferencePDA);
    // console.log(data.conferences[0].id)
    let id = data.conferences[0].id
    let paperId = "Po90y"
    let paperHash = "example hash"
    let paperName = "filename"
    let paperTitle = "example title"
    let paperAbstract = "example abstract"
    let authors = [{ authorName: "A1", authorEmail: "E1", authorAffiliation: "AU1" }]
    let dateSubmitted = "2023-02-05"
    // let paperStatus = new anchor.BN(0)
    let version = new anchor.BN(1)
    let prevVersion = "";

    await submitPaper(id, paperId, paperHash, paperName, paperTitle, paperAbstract, authors, dateSubmitted, version, prevVersion)

    const updatedData = await program.account.conferenceListAccountData.fetch(conferencePDA);
    // console.log("sub", updatedData.conferences[0].technicalProgramsCommittees)
    console.log(updatedData.conferences[0].paperSubmitted[0])
    assert.equal(updatedData.count, 1);
    assert.equal(updatedData.conferences.length, 1);
    assert.equal(updatedData.deletedIndexes.length, 1);
    assert.equal(updatedData.conferences[0].paperSubmitted.length, 1);
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperId, "Po90y");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperHash, "example hash");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperName, "filename");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperTitle, "example title");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperAbstract, "example abstract");
    assert.equal(Object.entries(updatedData.conferences[0].paperSubmitted[0].paperAuthors).toString(), Object.entries(authors).toString())
    assert.equal(updatedData.conferences[0].paperSubmitted[0].dateSubmitted, "2023-02-05");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperStatus, 0);
    assert.equal(updatedData.conferences[0].paperSubmitted[0].prevVersion, "");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].version, 1);
    assert.equal(updatedData.conferences[0].paperSubmitted[0].reviewer.length, 0);
    // assert.equal(updatedData.conferences[0].paperSubmitted[0].paperChair, []);
    // assert.equal(updatedData.conferences[0].paperSubmitted[0].paperChair, {});

  })

  it("Submitting a 2nd paper", async () => {
    const data = await program.account.conferenceListAccountData.fetch(conferencePDA);
    // console.log(data.conferences[0].id)

    let id = data.conferences[0].id
    let paperId = "Po904"
    let paperHash = "example hash2"
    let paperName = "filename2"
    let paperTitle = "example title2"
    let paperAbstract = "example abstract2"
    let authors = [{ authorName: "A3", authorEmail: "E3", authorAffiliation: "AU3" }, { authorName: "A4", authorEmail: "E4", authorAffiliation: "AU4" }]
    let dateSubmitted = "2023-02-06"
    // let paperStatus = new anchor.BN(0)
    let version = new anchor.BN(1)
    let prevVersion = "";

    await submitPaper(id, paperId, paperHash, paperName, paperTitle, paperAbstract, authors, dateSubmitted, version, prevVersion)

    const updatedData = await program.account.conferenceListAccountData.fetch(conferencePDA);
    console.log("sub", updatedData.conferences[0].paperSubmitted)
    console.log(updatedData.conferences[0].paperSubmitted[1].paperAuthors)
    assert.equal(updatedData.count, 1);
    assert.equal(updatedData.conferences.length, 1);
    assert.equal(updatedData.deletedIndexes.length, 1);
    assert.equal(updatedData.conferences[0].paperSubmitted.length, 2);
    assert.equal(updatedData.conferences[0].paperSubmitted[1].paperId, "Po904");
    assert.equal(updatedData.conferences[0].paperSubmitted[1].paperHash, "example hash2");
    assert.equal(updatedData.conferences[0].paperSubmitted[1].paperName, "filename2");
    assert.equal(updatedData.conferences[0].paperSubmitted[1].paperTitle, "example title2");
    assert.equal(updatedData.conferences[0].paperSubmitted[1].paperAbstract, "example abstract2");
    assert.equal(Object.entries(updatedData.conferences[0].paperSubmitted[1].paperAuthors).toString(), Object.entries(authors).toString())
    assert.equal(updatedData.conferences[0].paperSubmitted[1].dateSubmitted, "2023-02-06");
    assert.equal(updatedData.conferences[0].paperSubmitted[1].paperStatus, 0);
    assert.equal(updatedData.conferences[0].paperSubmitted[1].prevVersion, "");
    assert.equal(updatedData.conferences[0].paperSubmitted[1].version, 1);
    assert.equal(updatedData.conferences[0].paperSubmitted[0].reviewer.length, 0);
  })

  it("Fetch All Conferences after submitting a paper", async () => {
    getAllConference()
  });

  it("Deleting a paper", async () => {
    const data = await program.account.conferenceListAccountData.fetch(conferencePDA);
    // console.log(data.conferences[0].id)
    let id = data.conferences[0].id
    let paperId = "example hash"
    let authors = [{ authorName: "A3", authorEmail: "E3" }, { authorName: "A4", authorEmail: "E4" }]

    await deletePaper(id, paperId)

    const updatedData = await program.account.conferenceListAccountData.fetch(conferencePDA);
    // console.log("sub", updatedData.conferences[0].paperSubmitted)
    assert.equal(updatedData.count, 1);
    assert.equal(updatedData.conferences.length, 1);
    assert.equal(updatedData.deletedIndexes.length, 1);
    assert.equal(updatedData.conferences[0].paperSubmitted.length, 1);
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperId, "Po904");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperHash, "example hash2");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperName, "filename2");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperTitle, "example title2");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperAbstract, "example abstract2");
    assert.equal(Object.entries(updatedData.conferences[0].paperSubmitted[0].paperAuthors).toString(), Object.entries(authors).toString())
    assert.equal(updatedData.conferences[0].paperSubmitted[0].dateSubmitted, "2023-02-06");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperStatus, 0);
    assert.equal(updatedData.conferences[0].paperSubmitted[0].prevVersion, "");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].version, 1);
  })

  it("Fetch All Conferences after deleting a paper", async () => {
    getAllConference()
  });

  it("Assigning a reviewer", async () => {
    const data = await program.account.conferenceListAccountData.fetch(conferencePDA);
    // console.log(data.conferences[0].id)
    let id = data.conferences[0].id
    let paperId = "example hash2"
    // let reviewers = [{tpcName: "Reviewer1", tpcEmail: "E1", tpcWallet: "", approval: new anchor.BN(0), feedback:""}]
    let reviewers = [{ tpcName: "Reviewer1", tpcEmail: "E1", approval: new anchor.BN(0), feedback: "" }, { tpcName: "Reviewer2", tpcEmail: "E2", approval: new anchor.BN(0), feedback: "" }]
    let chair = { tpcName: "Chair", tpcEmail: "C1", approval: new anchor.BN(0), feedback: "" }
    // let authors = [{authorName: "A3", authorEmail:"E3"},{authorName: "A4", authorEmail:"E4"} ]

    await assignReviewer(id, paperId, reviewers, chair)

    const updatedData = await program.account.conferenceListAccountData.fetch(conferencePDA);
    console.log("sub", updatedData.conferences[0].paperSubmitted[0].reviewer)
    assert.equal(updatedData.count, 1);
    assert.equal(updatedData.conferences.length, 1);
    assert.equal(updatedData.deletedIndexes.length, 1);
    assert.equal(updatedData.conferences[0].paperSubmitted.length, 1);
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperId, "Po904");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperHash, "example hash2");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperName, "filename2");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperTitle, "example title2");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperAbstract, "example abstract2");
    assert.equal(Object.entries(updatedData.conferences[0].paperSubmitted[0].reviewer).toString(), Object.entries(reviewers).toString())
    assert.equal(updatedData.conferences[0].paperSubmitted[0].dateSubmitted, "2023-02-06");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperStatus, 1);
    assert.equal(updatedData.conferences[0].paperSubmitted[0].prevVersion, "");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].version, 1);
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperChair.tpcName, "Chair");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperChair.tpcEmail, "C1");
    // assert.equal(updatedData.conferences[0].paperSubmitted[0].paperChair.tpcWallet, "");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperChair.approval, 0);
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperChair.feedback, "");
  })

  it("Review a Paper", async () => {
    const data = await program.account.conferenceListAccountData.fetch(conferencePDA);
    // console.log(data.conferences[0].id)
    let id = data.conferences[0].id
    let paperId = "example hash2"
    // let reviewers = [{ tpcName: "Reviewer1", tpcEmail: "E1", tpcWallet: "", approval: new anchor.BN(0), feedback: "" }, { tpcName: "Reviewer2", tpcEmail: "E2", tpcWallet: "", approval: new anchor.BN(0), feedback: "" }]
    let feedback = "example feedback"
    await reviewPaper(id, paperId, "E1", false, 2, feedback)

    const updatedData = await program.account.conferenceListAccountData.fetch(conferencePDA);
    console.log("sub reviewer", updatedData.conferences[0].paperSubmitted[0].reviewer)
    assert.equal(updatedData.count, 1);
    assert.equal(updatedData.conferences.length, 1);
    assert.equal(updatedData.deletedIndexes.length, 1);
    assert.equal(updatedData.conferences[0].paperSubmitted.length, 1);
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperId, "Po904");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperHash, "example hash2");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperName, "filename2");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperTitle, "example title2");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperAbstract, "example abstract2");
    // assert.equal( Object.entries(updatedData.conferences[0].paperSubmitted[0].reviewer).toString(), Object.entries(reviewers).toString())
    assert.equal(updatedData.conferences[0].paperSubmitted[0].dateSubmitted, "2023-02-06");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperStatus, 1);
    assert.equal(updatedData.conferences[0].paperSubmitted[0].prevVersion, "");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].version, 1);
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperChair.tpcName, "Chair");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperChair.tpcEmail, "C1");
    // assert.equal(updatedData.conferences[0].paperSubmitted[0].paperChair.tpcWallet, "");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperChair.approval, 0);
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperChair.feedback, "");

  })

  it("Review a Paper - Chair - Fail scenario", async () => {
    try {
      const data = await program.account.conferenceListAccountData.fetch(conferencePDA);
      let id = data.conferences[0].id
      let paperId = "example hash2"
      // let reviewers = [{ tpcName: "Reviewer1", tpcEmail: "E1", tpcWallet: "", approval: new anchor.BN(0), feedback: "" }]
      let feedback = "example feedback from a chair"
      await reviewPaper(id, paperId, "C1", true, 2, feedback)
      assert.ok(false);

    } catch (error) {
      assert(error instanceof AnchorError);
      const err: AnchorError = error;
      const errMsg =
        "All the reviewers must finish reviewing before the chair can make the final review";
      assert.strictEqual(err.error.errorMessage, errMsg);
      assert.strictEqual(err.error.errorCode.number, 6003);
    }

  })

  it("Review a Paper for Reviewer 2", async () => {
    const data = await program.account.conferenceListAccountData.fetch(conferencePDA);
    let id = data.conferences[0].id
    let paperId = "example hash2"
    let feedback = "example feedback from reviewer 2"
    await reviewPaper(id, paperId, "E2", false, 2, feedback)

    const updatedData = await program.account.conferenceListAccountData.fetch(conferencePDA);
    // console.log("sub reviewer", updatedData.conferences[0].paperSubmitted[0].reviewer)
    assert.equal(updatedData.count, 1);
    assert.equal(updatedData.conferences.length, 1);
    assert.equal(updatedData.deletedIndexes.length, 1);
    assert.equal(updatedData.conferences[0].paperSubmitted.length, 1);
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperId, "Po904");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperHash, "example hash2");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperName, "filename2");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperTitle, "example title2");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperAbstract, "example abstract2");
    // assert.equal( Object.entries(updatedData.conferences[0].paperSubmitted[0].reviewer).toString(), Object.entries(reviewers).toString())
    assert.equal(updatedData.conferences[0].paperSubmitted[0].dateSubmitted, "2023-02-06");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperStatus, 1);
    assert.equal(updatedData.conferences[0].paperSubmitted[0].prevVersion, "");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].version, 1);
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperChair.tpcName, "Chair");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperChair.tpcEmail, "C1");
    // assert.equal(updatedData.conferences[0].paperSubmitted[0].paperChair.tpcWallet, "");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperChair.approval, 0);
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperChair.feedback, "");

  })

  it("Review a Paper - Chair", async () => {
    const data = await program.account.conferenceListAccountData.fetch(conferencePDA);
    let id = data.conferences[0].id
    let paperId = "example hash2"
    let reviewers = [{ tpcName: "Reviewer1", tpcEmail: "E1", tpcWallet: "", approval: new anchor.BN(0), feedback: "" }]
    let feedback = "example feedback from a chair"
    await reviewPaper(id, paperId, "C1", true, 3, feedback)

    const updatedData = await program.account.conferenceListAccountData.fetch(conferencePDA);
    // console.log("paper chair", updatedData.conferences[0].paperSubmitted[0].paperChair)
    // console.log("reviewer", updatedData.conferences[0].paperSubmitted[0].reviewer)

    assert.equal(updatedData.count, 1);
    assert.equal(updatedData.conferences.length, 1);
    assert.equal(updatedData.deletedIndexes.length, 1);
    assert.equal(updatedData.conferences[0].paperSubmitted.length, 1);
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperId, "Po904");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperHash, "example hash2");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperName, "filename2");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperTitle, "example title2");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperAbstract, "example abstract2");
    // assert.equal( Object.entries(updatedData.conferences[0].paperSubmitted[0].reviewer).toString(), Object.entries(reviewers).toString())
    assert.equal(updatedData.conferences[0].paperSubmitted[0].dateSubmitted, "2023-02-06");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperStatus, 3);
    assert.equal(updatedData.conferences[0].paperSubmitted[0].prevVersion, "");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].version, 1);
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperChair.tpcName, "Chair");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperChair.tpcEmail, "C1");
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperChair.tpcWallet.toString(), user.publicKey)
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperChair.approval, 3);
    assert.equal(updatedData.conferences[0].paperSubmitted[0].paperChair.feedback, "example feedback from a chair");

  })

  it("Fetch Papers", async () => {
    const data = await program.account.conferenceListAccountData.fetch(conferencePDA);
    let conferenceId = data.conferences[0].id
    const updatedData = await program.account.conferenceListAccountData.fetch(conferencePDA);
    console.log("paper", updatedData.conferences[0].paperSubmitted[0])
  });

  it("Revise a paper", async () => {
    const data = await program.account.conferenceListAccountData.fetch(conferencePDA);
    let conferenceId = data.conferences[0].id
    let prevPaperHash = "example hash2"
    let paperId = "Po905"
    let paperName = "resubmitfilename"
    let paperHash = "example hash2 (resubmit)"
    let paperTitle = "example title (resubmit)"
    let paperAbstract = "example abstract (resubmit)"
    let dateSubmitted = "2023-03-06"

    await revisePaper(conferenceId, prevPaperHash, paperId, paperHash, paperName, paperTitle, paperAbstract, dateSubmitted)

    const updatedData = await program.account.conferenceListAccountData.fetch(conferencePDA);
    console.log("prev", updatedData.conferences[0].paperSubmitted.find((p) => p.paperHash ==="example hash2"))
    console.log("revised", updatedData.conferences[0].paperSubmitted.find((p) => p.paperHash ==="example hash2 (resubmit)"))
    let prevPaper = updatedData.conferences[0].paperSubmitted.find((p) => p.paperHash ==="example hash2")
    let revisedPaper = updatedData.conferences[0].paperSubmitted.find((p) => p.paperHash ==="example hash2 (resubmit)")
    assert.equal(updatedData.count, 1);
    assert.equal(updatedData.conferences.length, 1);
    assert.equal(updatedData.deletedIndexes.length, 1);
    assert.equal(updatedData.conferences[0].paperSubmitted.length, 2);
    assert.equal(prevPaper.paperStatus, 5);
    assert.equal(revisedPaper.paperId, "Po905");
    assert.equal(revisedPaper.paperHash, "example hash2 (resubmit)");
    assert.equal(revisedPaper.paperName, "resubmitfilename");
    assert.equal(revisedPaper.paperTitle, "example title (resubmit)");
    assert.equal(revisedPaper.paperAbstract, "example abstract (resubmit)");
    assert.equal(revisedPaper.paperAuthors.length, prevPaper.paperAuthors.length)
    assert.equal(revisedPaper.dateSubmitted, "2023-03-06");
    assert.equal(revisedPaper.paperStatus, 1);
    assert.equal(revisedPaper.prevVersion, prevPaper.paperHash);
    assert.equal(revisedPaper.version, 2);
    assert.equal(revisedPaper.paperChair.length, prevPaper.paperChair.length);
  })

  it("Make a payment", async () => {
    const data = await program.account.conferenceListAccountData.fetch(conferencePDA);
    let conferenceId = data.conferences[0].id

    await makePayment(conferenceId, "example hash2", new anchor.BN(2))

    const updatedData = await program.account.conferenceListAccountData.fetch(conferencePDA);
    // console.log(updatedData)
    // console.log(user.balance)
    let paper = updatedData.conferences[0].paperSubmitted.find((p) => p.paperHash ==="example hash2")

    // console.log("prev", updatedData.conferences[0].paperSubmitted)
    // console.log("revised", updatedData.conferences[0].paperSubmitted.find((p) => p.paperHash ==="example hash2 (resubmit)"))
    // console.log(updatedData.conferences[0].paperSubmitted[1].paperAuthors)
    assert.equal(updatedData.count, 1);
    assert.equal(updatedData.conferences.length, 1);
    assert.equal(updatedData.deletedIndexes.length, 1);
    assert.equal(updatedData.conferences[0].paperSubmitted.length, 2);
    assert.equal(paper.paperId, "Po904");
    assert.equal(paper.paperHash, "example hash2");
    assert.equal(paper.paperName, "filename2");
    assert.equal(paper.paperTitle, "example title2");
    assert.equal(paper.paperAbstract, "example abstract2");
    // assert.equal(Object.entries(paper.paperAuthors).toString(), Object.entries(authors).toString())
    assert.equal(paper.dateSubmitted, "2023-02-06");
    assert.equal(paper.paperStatus, 8);
    assert.equal(paper.prevVersion, "");
    assert.equal(paper.version, 1);
    assert.equal(paper.feePaid, 2);
    assert.equal(updatedData.conferences[0].feeReceived, 2)
  })
  
  it("Make a payout", async () => {
    const data = await program.account.conferenceListAccountData.fetch(conferencePDA);
    let conferenceId = data.conferences[0].id

    const res = await payoutReviewer(conferenceId)
    console.log(res)

    // const updatedData = await program.account.conferenceListAccountData.fetch(conferencePDA);
    // // console.log(updatedData)
    // console.log(user.balance)
    // let paper = updatedData.conferences[0].paperSubmitted.find((p) => p.paperHash ==="example hash2")

    // console.log("prev", updatedData.conferences[0].paperSubmitted)
    // console.log("revised", updatedData.conferences[0].paperSubmitted.find((p) => p.paperHash ==="example hash2 (resubmit)"))
    // console.log(updatedData.conferences[0].paperSubmitted[1].paperAuthors)
    // assert.equal(updatedData.count, 1);
    // assert.equal(updatedData.conferences.length, 1);
    // assert.equal(updatedData.deletedIndexes.length, 1);
    // assert.equal(updatedData.conferences[0].paperSubmitted.length, 2);
    // assert.equal(paper.paperId, "Po904");
    // assert.equal(paper.paperHash, "example hash2");
    // assert.equal(paper.paperName, "filename2");
    // assert.equal(paper.paperTitle, "example title2");
    // assert.equal(paper.paperAbstract, "example abstract2");
    // // assert.equal(Object.entries(paper.paperAuthors).toString(), Object.entries(authors).toString())
    // assert.equal(paper.dateSubmitted, "2023-02-06");
    // assert.equal(paper.paperStatus, 8);
    // assert.equal(paper.prevVersion, "");
    // assert.equal(paper.version, 1);
    // assert.equal(paper.feePaid, 2);
    // assert.equal(updatedData.conferences[0].feeReceived, 2)
  })

});

