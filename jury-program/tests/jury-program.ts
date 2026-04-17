import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { JuryProgram } from "../target/types/jury_program";
import { Keypair, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
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

  before(async () => {
    // Fund test wallets
    const sig1 = await provider.connection.requestAirdrop(
      plaintiff.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(sig1);

    const sig2 = await provider.connection.requestAirdrop(
      defendant.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(sig2);
  });

  it("creates a dispute", async () => {
    const [disputePDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("dispute"), plaintiff.publicKey.toBuffer(), disputeId],
      program.programId
    );

    await program.methods
      .createDispute(
        Array.from(disputeId) as any,
        "Test dispute: payment not received",
        new anchor.BN(stakeAmount)
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
    // Status should be Open (first variant)
    expect(dispute.status).to.have.property("open");
  });

  it("defendant joins the dispute", async () => {
    const [disputePDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("dispute"), plaintiff.publicKey.toBuffer(), disputeId],
      program.programId
    );

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
    const [disputePDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("dispute"), plaintiff.publicKey.toBuffer(), disputeId],
      program.programId
    );

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
    const [disputePDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("dispute"), plaintiff.publicKey.toBuffer(), newId],
      program.programId
    );

    try {
      await program.methods
        .createDispute(
          Array.from(newId) as any,
          "Zero stake test",
          new anchor.BN(0)
        )
        .accounts({
          plaintiff: plaintiff.publicKey,
          dispute: disputePDA,
          systemProgram: SystemProgram.programId,
        })
        .signers([plaintiff])
        .rpc();
      expect.fail("Should have thrown");
    } catch (e: any) {
      expect(e.error.errorCode.code).to.equal("ZeroStake");
    }
  });

  it("rejects oversized description", async () => {
    const newId = crypto.randomBytes(32);
    const [disputePDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("dispute"), plaintiff.publicKey.toBuffer(), newId],
      program.programId
    );

    try {
      await program.methods
        .createDispute(
          Array.from(newId) as any,
          "x".repeat(257),
          new anchor.BN(stakeAmount)
        )
        .accounts({
          plaintiff: plaintiff.publicKey,
          dispute: disputePDA,
          systemProgram: SystemProgram.programId,
        })
        .signers([plaintiff])
        .rpc();
      expect.fail("Should have thrown");
    } catch (e: any) {
      expect(e.error.errorCode.code).to.equal("DescriptionTooLong");
    }
  });
});
