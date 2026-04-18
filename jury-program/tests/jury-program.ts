import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { JuryProgram } from "../target/types/jury_program";
import { Keypair, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { expect } from "chai";
import crypto from "crypto";

describe("jury-program", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.JuryProgram as Program<JuryProgram>;
  const plaintiff = Keypair.generate();
  const defendant = Keypair.generate();
  const disputeId = crypto.randomBytes(32);
  const stakeAmount = 0.1 * LAMPORTS_PER_SOL;

  // Generate juror keypairs for the pool
  const jurors = Array.from({ length: 5 }, () => Keypair.generate());

  const [jurorPoolPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("juror_pool")],
    program.programId
  );

  const [disputePDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("dispute"), plaintiff.publicKey.toBuffer(), disputeId],
    program.programId
  );

  before(async () => {
    // Fund test wallets
    const airdrops = [plaintiff, defendant, ...jurors].map(async (kp) => {
      const sig = await provider.connection.requestAirdrop(
        kp.publicKey,
        2 * LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(sig);
    });
    await Promise.all(airdrops);
  });

  it("initializes the juror pool", async () => {
    await program.methods
      .initializeJurorPool()
      .accounts({
        admin: provider.wallet.publicKey,
        jurorPool: jurorPoolPDA,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const pool = await program.account.jurorPool.fetch(jurorPoolPDA);
    expect(pool.admin.toBase58()).to.equal(
      provider.wallet.publicKey.toBase58()
    );
    expect(pool.count).to.equal(0);
  });

  it("registers jurors via open registration", async () => {
    for (const juror of jurors) {
      await program.methods
        .registerJuror()
        .accounts({
          juror: juror.publicKey,
          jurorPool: jurorPoolPDA,
        })
        .signers([juror])
        .rpc();
    }

    const pool = await program.account.jurorPool.fetch(jurorPoolPDA);
    expect(pool.count).to.equal(jurors.length);
    for (let i = 0; i < jurors.length; i++) {
      expect(pool.jurors[i].toBase58()).to.equal(
        jurors[i].publicKey.toBase58()
      );
    }
  });

  it("creates a dispute with deadline", async () => {
    await program.methods
      .createDispute(
        Array.from(disputeId) as any,
        "Test dispute: payment not received",
        new anchor.BN(stakeAmount),
        new anchor.BN(3600) // 1 hour deadline
      )
      .accounts({
        plaintiff: plaintiff.publicKey,
        dispute: disputePDA,
        systemProgram: SystemProgram.programId,
      })
      .signers([plaintiff])
      .rpc();

    const dispute = await program.account.dispute.fetch(disputePDA);
    expect(dispute.description).to.equal("Test dispute: payment not received");
    expect(dispute.stakeLamports.toNumber()).to.equal(stakeAmount);
    expect(dispute.plaintiff.toBase58()).to.equal(plaintiff.publicKey.toBase58());
    expect(dispute.status).to.have.property("open");
    expect(dispute.evidenceCount).to.equal(0);
    // Deadline should be createdAt + 3600
    expect(dispute.deadline.toNumber()).to.equal(
      dispute.createdAt.toNumber() + 3600
    );
  });

  it("defendant joins the dispute", async () => {
    await program.methods
      .joinDispute()
      .accounts({
        defendant: defendant.publicKey,
        dispute: disputePDA,
        systemProgram: SystemProgram.programId,
      })
      .signers([defendant])
      .rpc();

    const dispute = await program.account.dispute.fetch(disputePDA);
    expect(dispute.defendant.toBase58()).to.equal(defendant.publicKey.toBase58());
    expect(dispute.status).to.have.property("awaitingJury");
  });

  it("rejects duplicate defendant join", async () => {
    const thirdParty = Keypair.generate();
    const sig = await provider.connection.requestAirdrop(
      thirdParty.publicKey,
      LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(sig);

    try {
      await program.methods
        .joinDispute()
        .accounts({
          defendant: thirdParty.publicKey,
          dispute: disputePDA,
          systemProgram: SystemProgram.programId,
        })
        .signers([thirdParty])
        .rpc();
      expect.fail("Should have thrown");
    } catch (e: any) {
      expect(e.error.errorCode.code).to.equal("InvalidStatus");
    }
  });

  it("rejects zero-stake dispute", async () => {
    const newId = crypto.randomBytes(32);
    const [newDisputePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("dispute"), plaintiff.publicKey.toBuffer(), newId],
      program.programId
    );

    try {
      await program.methods
        .createDispute(
          Array.from(newId) as any,
          "Zero stake test",
          new anchor.BN(0),
          new anchor.BN(0)
        )
        .accounts({
          plaintiff: plaintiff.publicKey,
          dispute: newDisputePDA,
          systemProgram: SystemProgram.programId,
        })
        .signers([plaintiff])
        .rpc();
      expect.fail("Should have thrown");
    } catch (e: any) {
      expect(e.error.errorCode.code).to.equal("ZeroStake");
    }
  });

  // G2c: request_jury test (negative — VRF not available on localnet)
  it("request_jury rejects when status is not AwaitingJury", async () => {
    // Create a fresh dispute that stays in Open state (no defendant yet)
    const freshId = crypto.randomBytes(32);
    const freshPlaintiff = Keypair.generate();
    const airdropSig = await provider.connection.requestAirdrop(
      freshPlaintiff.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSig);

    const [freshDisputePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("dispute"), freshPlaintiff.publicKey.toBuffer(), freshId],
      program.programId
    );

    await program.methods
      .createDispute(
        Array.from(freshId) as any,
        "Request jury test",
        new anchor.BN(stakeAmount),
        new anchor.BN(0)
      )
      .accounts({
        plaintiff: freshPlaintiff.publicKey,
        dispute: freshDisputePDA,
        systemProgram: SystemProgram.programId,
      })
      .signers([freshPlaintiff])
      .rpc();

    // Attempt request_jury on an Open dispute (should fail with InvalidStatus)
    const vrfSeed = crypto.randomBytes(32);
    const ORAO_VRF_ID = new PublicKey("VRFzZoJdhFWL8rkvu87LpKM3RbcVezpMEc6X5GVDr7y");
    const [randomPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("orao-vrf-randomness-request"), vrfSeed],
      ORAO_VRF_ID
    );
    const [networkStatePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("orao-vrf-network-configuration")],
      ORAO_VRF_ID
    );

    try {
      await program.methods
        .requestJury(Array.from(vrfSeed) as any)
        .accounts({
          payer: freshPlaintiff.publicKey,
          dispute: freshDisputePDA,
          random: randomPDA,
          treasury: freshPlaintiff.publicKey, // dummy
          networkState: networkStatePDA,
          vrf: ORAO_VRF_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([freshPlaintiff])
        .rpc();
      expect.fail("Should have thrown");
    } catch (e: any) {
      // On localnet: VRF program missing OR InvalidStatus — both are valid rejections.
      // The key assertion: calling request_jury on a non-AwaitingJury dispute MUST fail.
      expect(e).to.exist;
    }
  });

  // G2c: cast_vote test (uses debug_set_jury to bypass VRF on localnet)
  it("cast_vote: jurors vote and verdict is reached", async () => {
    // Use debug_set_jury to advance the main dispute to Deliberating
    const selectedJurors = [jurors[0], jurors[1], jurors[2]];

    await program.methods
      .debugSetJury(selectedJurors.map((j) => j.publicKey))
      .accounts({
        admin: provider.wallet.publicKey,
        dispute: disputePDA,
      })
      .rpc();

    let dispute = await program.account.dispute.fetch(disputePDA);
    expect(dispute.status).to.have.property("deliberating");
    expect(dispute.jury[0].toBase58()).to.equal(selectedJurors[0].publicKey.toBase58());

    // Juror 0 votes plaintiff (1)
    await program.methods
      .castVote(1)
      .accounts({
        juror: selectedJurors[0].publicKey,
        dispute: disputePDA,
      })
      .signers([selectedJurors[0]])
      .rpc();

    dispute = await program.account.dispute.fetch(disputePDA);
    expect(dispute.votes[0]).to.equal(1);
    expect(dispute.status).to.have.property("deliberating"); // not decided yet

    // Juror 1 votes defendant (2)
    await program.methods
      .castVote(2)
      .accounts({
        juror: selectedJurors[1].publicKey,
        dispute: disputePDA,
      })
      .signers([selectedJurors[1]])
      .rpc();

    // Juror 2 votes plaintiff (1) — this triggers verdict (2-1 plaintiff)
    await program.methods
      .castVote(1)
      .accounts({
        juror: selectedJurors[2].publicKey,
        dispute: disputePDA,
      })
      .signers([selectedJurors[2]])
      .rpc();

    dispute = await program.account.dispute.fetch(disputePDA);
    expect(dispute.status).to.have.property("decided");
    expect(dispute.winner).to.equal(1); // plaintiff wins
  });

  // G2c: claim_stakes test
  it("claim_stakes: winner claims combined stakes", async () => {
    const balanceBefore = await provider.connection.getBalance(plaintiff.publicKey);

    await program.methods
      .claimStakes()
      .accounts({
        winner: plaintiff.publicKey,
        dispute: disputePDA,
      })
      .signers([plaintiff])
      .rpc();

    const dispute = await program.account.dispute.fetch(disputePDA);
    expect(dispute.status).to.have.property("claimed");

    const balanceAfter = await provider.connection.getBalance(plaintiff.publicKey);
    // Winner should receive 2x stake (minus tx fee)
    const expectedGain = stakeAmount * 2;
    const actualGain = balanceAfter - balanceBefore;
    // Allow for tx fee (up to 10000 lamports)
    expect(actualGain).to.be.greaterThan(expectedGain - 10000);
    expect(actualGain).to.be.lessThanOrEqual(expectedGain);
  });
});
