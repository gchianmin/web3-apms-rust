const assert = require('assert')
const anchor = require('@project-serum/anchor')
const { SystemProgram } = anchor.web3
const { PublicKey } = require('@solana/web3.js')

describe("apmsdapp", () => {
  // Configure the client to use the local cluster.
  // const provider = anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.getProvider();
  anchor.setProvider(provider);
  // const conference = anchor.web3.Keypair.generate();
  const program = anchor.workspace.Apmsdapp;

  //it block represents one test
  it('Creates a conference', async () => {
    const [conferencePDA, _] = await PublicKey
      .findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode("CONFERENCE"),
          provider.wallet.publicKey.toBuffer()
        ],
        program.programId
      );
    //call create fn and pass it init message
    await program.rpc.create("IEEE Conference", "A yearly conference for authors globally.", "2023-04-05 00:00:00", "Marina Bay Sand", "2023-02-05 00:00:00", {
      accounts: {
        conference: conferencePDA,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId
      },
      //need pass in as we are creating a new cal acc
      // signers: [conferencePDA]
    })
    const account = await program.account.conference.fetch(conferencePDA)
    console.log(conferencePDA)
    assert.ok(account.name === "IEEE Conference")
    assert.ok(account.description === "A yearly conference for authors globally.")
    assert.ok(account.date === "2023-04-05 00:00:00")
    assert.ok(account.venue === "Marina Bay Sand")
    assert.ok(account.submissionDeadline === "2023-02-05 00:00:00")

  })

  it('Modifying a conference', async () => {
    const [conferencePDA, _] = await PublicKey
      .findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode("CONFERENCE"),
          provider.wallet.publicKey.toBuffer()
        ],
        program.programId
      );

    await program.rpc.modify("ACM Conference", "A yearly conference for authors globally.", "2023-05-05 00:00:00", "Suntec Convention Centre", "2023-03-05 00:00:00", {
      accounts: {
        conference: conferencePDA,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId
      },

    })
    const account = await program.account.conference.fetch(conferencePDA)
    console.log(conferencePDA)
    assert.ok(account.name === "ACM Conference")
    assert.ok(account.description === "A yearly conference for authors globally.")
    assert.ok(account.date === "2023-05-05 00:00:00")
    assert.ok(account.venue === "Suntec Convention Centre")
    assert.ok(account.submissionDeadline === "2023-03-05 00:00:00")
  })

  it('Canceling a conference', async () => {

    const [conferencePDA, _] = await PublicKey
      .findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode("CONFERENCE"),
          provider.wallet.publicKey.toBuffer()
        ],
        program.programId
      );

    await program.rpc.cancel({
      accounts: {
        conference: conferencePDA,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId
      },
    })

    await assert.rejects(
      async () => {
        const acc = await program.account.conference.fetch(conferencePDA)
      },
      {
        name: 'Error',
        message: `Account does not exist ${conferencePDA.toString()}`,
      },
    );
  })
});
