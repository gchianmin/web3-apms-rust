const assert = require('assert')
const anchor = require('@project-serum/anchor')
const { SystemProgram } = anchor.web3
const { PublicKey } = require('@solana/web3.js')


interface ConferenceListAccountData {
  count: number;
  deletedIndexes: number[];
  conferences: Conference[];
}

interface Conference {
  id: anchor.web3.PublicKey;
  name: String;
  description: String;
  date: String;
  venue: String;
  submission_deadline: String;
  paper_submitted: anchor.BN;
  fee_received: anchor.BN;
}


// Configure the client to use the local cluster.
const provider = anchor.getProvider();
anchor.setProvider(provider);
const program = anchor.workspace.Apmsdapp;
// let creatorKey = provider.wallet.publicKey
// let stateSigner
const user = program.provider.wallet;
const conferenceListKeypair = anchor.web3.Keypair.generate();

describe("apmsdapp", () => {
  it("initialize account data", async () => {
    await program.rpc.initialize({
        accounts: {
          systemProgram: SystemProgram.programId,
          conferenceList: conferenceListKeypair.publicKey,
          user: user.publicKey,
        },
        signers: [conferenceListKeypair],
      });

    const data = await program.account.conferenceListAccountData.fetch(conferenceListKeypair.publicKey);
    console.log(data)
    assert.equal(data.count, 0);
    assert.equal(data.conferences.length, 0);
    assert.equal(data.deletedIndexes.length, 0);
  });

  it("create first conference", async () => {

    await program.rpc.createConference("IEEE Conference", "A yearly conference for authors globally.", "2023-04-05 00:00:00", "Marina Bay Sand", "2023-02-05 00:00:00", {
      accounts: {
        conferenceList: conferenceListKeypair.publicKey,
        user: user.publicKey,
      },
    });

    const data = await program.account.conferenceListAccountData.fetch(conferenceListKeypair.publicKey);
    console.log(data)
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
  });

  it("create second conference", async () => {

    await program.rpc.createConference("ACM Conference", "ACM Conference description", "2023-05-05 00:00:00", "Suntec Convention Centre", "2023-04-05 00:00:00", {
      accounts: {
        conferenceList: conferenceListKeypair.publicKey,
        user: user.publicKey,
      },
    });

    const data = await program.account.conferenceListAccountData.fetch(conferenceListKeypair.publicKey);
    console.log(data)
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
  });

  it("Fetch All Conferences",async () => {
      try{
        const conferenceInfo = await program.account.conferenceListAccountData.all()
        console.log("Conferences List", conferenceInfo)
      }
      catch (e) {
        console.log(e)
      }
    });
  
  it("Updating IEEE Conference", async() => {
    const data = await program.account.conferenceListAccountData.fetch(conferenceListKeypair.publicKey);
    // const conferenceInfo = await program.account.conferenceListAccountData.all()
    // const conf_id = conferenceInfo[0].account.conferences[0].id
  
    let updatedContent = {id: data.conferences[0].id, name:"IEEE Conference Updated", description: "IEEE Conference description", date: "2023-08-05 00:00:00", venue: "KLCC Convention Centre", submission_deadline:"2023-04-05 00:00:00", paper_submitted: new anchor.BN(0), fee_received:new anchor.BN(0)}
    console.log(updatedContent)

    await program.rpc.updateConference(updatedContent.web3.serialize(), 
      {
        accounts: {
          conferenceList: conferenceListKeypair.publicKey,
          user: user.publicKey,
        },
      }
    );

    // const data = await program.account.conferenceListAccountData.fetch(conferenceListKeypair.publicKey);
    // console.log(data)
    // assert.equal(data.count, 2);
    // assert.equal(data.conferences.length, 2);
    // assert.equal(data.deletedIndexes.length, 0);
    // const firstConference = data.conferences[0];
    // assert.equal(firstConference.id.toBytes().length, 32);
    // assert.equal(firstConference.name, "IEEE Conference Updated");
    // assert.equal(firstConference.description, "IEEE Conference description");
    // assert.equal(firstConference.date, "2023-08-05 00:00:00");
    // assert.equal(firstConference.venue, "KLCC Convention Centre");
    // assert.equal(firstConference.submissionDeadline, "2023-04-05 00:00:00");
    
  })






});

  // it('Create State', async () => {
  //   ;[stateSigner] = await PublicKey.findProgramAddressSync(
  //     [anchor.utils.bytes.utf8.encode('state')],
  //     program.programId,
  //   )

  //   try {
  //     const stateInfo = await program.account.stateAccount.fetch(stateSigner)
  //   } catch {
  //     await program.rpc.createState({
  //       accounts: {
  //         state: stateSigner,
  //         authority: creatorKey,
  //         ...defaultAccounts,
  //       },
  //     })

  //     const stateInfo = await program.account.stateAccount.fetch(stateSigner)
  //     console.log(stateInfo)
  //     assert(
  //       stateInfo.authority.toString() === creatorKey.toString(),
  //       'State Creator is Invalid',
  //     )
  //   }
  // })

  // //it block represents one test
  // it('Creates the first conference', async () => {
  //   const stateInfo = await program.account.stateAccount.fetch(stateSigner);
  //   console.log(stateInfo.conferenceCount);

  //   if (stateInfo.conferenceCount > 0) {
  //     return;
  //   }

  //   const [conferenceSigner, _] = await PublicKey
  //     .findProgramAddressSync(
  //       [
  //         anchor.utils.bytes.utf8.encode("CONFERENCE"),
  //         stateInfo.conferenceCount.toBuffer("be", 8),
  //         // provider.wallet.publicKey.toBuffer(),
  //       ],
  //       program.programId
  //     );

  //   try {
  //     const conferenceInfo = await program.account.conferenceAccount.fetch(conferenceSigner);
  //     console.log(conferenceInfo);
  //   }
  //   catch {
  //     await program.rpc.create("IEEE Conference", "A yearly conference for authors globally.", "2023-04-05 00:00:00", "Marina Bay Sand", "2023-02-05 00:00:00", {
  //       accounts: {
  //         state: stateSigner,
  //         conference: conferenceSigner,
  //         authority: creatorKey,
  //         ...defaultAccounts
  //       },
  //     })
      
  //     const conferenceInfo = await program.account.conference.fetch(conferenceSigner)
  //     console.log(conferenceInfo)
  //     assert(conferenceInfo.authority.toString() === creatorKey.toString(), "Conference Creator is Invalid")

  //     assert.ok(conferenceInfo.name === "IEEE Conference")
  //     assert.ok(conferenceInfo.description === "A yearly conference for authors globally.")
  //     assert.ok(conferenceInfo.date === "2023-04-05 00:00:00")
  //     assert.ok(conferenceInfo.venue === "Marina Bay Sand")
  //     assert.ok(conferenceInfo.submissionDeadline === "2023-02-05 00:00:00")
  //   }
  // })

  // it('Creates the second conference', async () => {
  //   const stateInfo = await program.account.stateAccount.fetch(stateSigner);
  //   console.log(stateInfo.conferenceCount);

  //   const [conferenceSigner, _] = await PublicKey
  //     .findProgramAddressSync(
  //       [
  //         anchor.utils.bytes.utf8.encode("CONFERENCE"),
  //         stateInfo.conferenceCount.toBuffer("be", 8),
  //         // provider.wallet.publicKey.toBuffer(),
  //       ],
  //       program.programId
  //     );

  //   try {
  //     const conferenceInfo = await program.account.conferenceAccount.fetch(conferenceSigner);
  //     console.log(conferenceInfo);
  //   }
  //   catch {
  //     await program.rpc.create("ACM Conference", "ACM Conference description.", "2023-05-05 00:00:00", "Suntec Convention Centre", "2023-02-05 00:00:00", {
  //       accounts: {
  //         state: stateSigner,
  //         conference: conferenceSigner,
  //         authority: creatorKey,
  //         ...defaultAccounts
  //       },
  //     })
      
  //     const conferenceInfo = await program.account.conference.fetch(conferenceSigner)
  //     console.log(conferenceInfo)
  //     assert(conferenceInfo.authority.toString() === creatorKey.toString(), "Conference Creator is Invalid")

  //     assert.ok(conferenceInfo.name === "ACM Conference")
  //     assert.ok(conferenceInfo.description === "ACM Conference description.")
  //     assert.ok(conferenceInfo.date === "2023-05-05 00:00:00")
  //     assert.ok(conferenceInfo.venue === "Suntec Convention Centre")
  //     assert.ok(conferenceInfo.submissionDeadline === "2023-02-05 00:00:00")
  //   }
  // })

  //   it("Fetch All Conferences",async () => {
  //   try{
  //     const conferenceInfo = await program.account.conference.all()
  //     const stateInfo = await program.account.stateAccount.fetch(stateSigner)
  //     console.log("Conference Count", stateInfo.conferenceCount)
  //     console.log("Conferences List", conferenceInfo)
  //   }
  //   catch (e) {
  //     console.log(e)
  //   }
  // });

  // it('Modifying a conference', async () => {
  //   const [conferencePDA, _] = await PublicKey
  //     .findProgramAddressSync(
  //       [
  //         anchor.utils.bytes.utf8.encode("CONFERENCE"),
  //         provider.wallet.publicKey.toBuffer()
  //       ],
  //       program.programId
  //     );

  //   await program.rpc.modify("ACM Conference", "A yearly conference for authors globally.", "2023-05-05 00:00:00", "Suntec Convention Centre", "2023-03-05 00:00:00", {
  //     accounts: {
  //       conference: conferencePDA,
  //       user: provider.wallet.publicKey,
  //       systemProgram: SystemProgram.programId
  //     },

  //   })
  //   const account = await program.account.conference.fetch(conferencePDA)
  //   console.log(conferencePDA)
  //   assert.ok(account.name === "ACM Conference")
  //   assert.ok(account.description === "A yearly conference for authors globally.")
  //   assert.ok(account.date === "2023-05-05 00:00:00")
  //   assert.ok(account.venue === "Suntec Convention Centre")
  //   assert.ok(account.submissionDeadline === "2023-03-05 00:00:00")
  // })

  // it("Fetch All Conferences again",async () => {
  //   try{
  //     const conferenceInfo = await program.account.conference.all()
  //     const stateInfo = await program.account.stateAccount.fetch(stateSigner)
  //     console.log("Conference Count", stateInfo.conferenceCount)
  //     console.log("Conferences List", conferenceInfo)
  //   }
  //   catch (e) {
  //     console.log(e)
  //   }
  // });
  
  // it('Canceling a conference', async () => {

  //   const [conferencePDA, _] = await PublicKey
  //     .findProgramAddressSync(
  //       [
  //         anchor.utils.bytes.utf8.encode("CONFERENCE"),
  //         provider.wallet.publicKey.toBuffer()
  //       ],
  //       program.programId
  //     );

  //   await program.rpc.cancel({
  //     accounts: {
  //       conference: conferencePDA,
  //       user: provider.wallet.publicKey,
  //       systemProgram: SystemProgram.programId
  //     },
  //   })

  //   await assert.rejects(
  //     async () => {
  //       const acc = await program.account.conference.fetch(conferencePDA)
  //     },
  //     {
  //       name: 'Error',
  //       message: `Account does not exist ${conferencePDA.toString()}`,
  //     },
  //   );
  // })

