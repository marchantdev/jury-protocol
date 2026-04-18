/**
 * G1 Evidence: Full lifecycle with throwaway wallets.
 * Logs every tx signature for the evidence artifact.
 * Run via: anchor test --validator legacy (with Anchor.toml pointing to this file)
 */
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { JuryProgram } from "../target/types/jury_program";
import { Keypair, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import crypto from "crypto";

const RUNS = 3;

describe(`G1 evidence: ${RUNS} throwaway-wallet lifecycle runs`, () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.JuryProgram as Program<JuryProgram>;

  const [jurorPoolPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("juror_pool")],
    program.programId
  );

  // Initialize pool once before all runs
  before(async () => {
    const sig = await program.methods
      .initializeJurorPool()
      .accounts({
        admin: provider.wallet.publicKey,
        jurorPool: jurorPoolPDA,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log(`  TX initialize_juror_pool: ${sig}`);
    console.log(`  Admin wallet: ${provider.wallet.publicKey.toBase58()}`);
    console.log(`  Program ID: ${program.programId.toBase58()}`);
  });

  for (let run = 1; run <= RUNS; run++) {
    describe(`Run ${run}`, () => {
      const plaintiff = Keypair.generate();
      const defendant = Keypair.generate();
      const jurors = Array.from({ length: 5 }, () => Keypair.generate());
      const disputeId = crypto.randomBytes(32);
      const stakeAmount = 0.05 * LAMPORTS_PER_SOL;

      const [disputePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("dispute"), plaintiff.publicKey.toBuffer(), disputeId],
        program.programId
      );

      before(async () => {
        // Fund all wallets
        const airdrops = [plaintiff, defendant, ...jurors].map(async (kp) => {
          const sig = await provider.connection.requestAirdrop(kp.publicKey, 2 * LAMPORTS_PER_SOL);
          await provider.connection.confirmTransaction(sig);
        });
        await Promise.all(airdrops);
      });

      it("register_juror (5 throwaway wallets)", async () => {
        for (const juror of jurors) {
          const sig = await program.methods
            .registerJuror()
            .accounts({
              juror: juror.publicKey,
              jurorPool: jurorPoolPDA,
            })
            .signers([juror])
            .rpc();
          console.log(`  TX register_juror: ${sig} (${juror.publicKey.toBase58()})`);
        }
      });

      it("create_dispute (throwaway plaintiff)", async () => {
        const sig = await program.methods
          .createDispute(
            Array.from(disputeId) as any,
            `Evidence run ${run} - payment dispute`,
            new anchor.BN(stakeAmount),
            new anchor.BN(3600)
          )
          .accounts({
            plaintiff: plaintiff.publicKey,
            dispute: disputePDA,
            systemProgram: SystemProgram.programId,
          })
          .signers([plaintiff])
          .rpc();
        console.log(`  TX create_dispute: ${sig}`);
        console.log(`  Plaintiff: ${plaintiff.publicKey.toBase58()}`);
        console.log(`  Dispute PDA: ${disputePDA.toBase58()}`);
      });

      it("join_dispute (throwaway defendant)", async () => {
        const sig = await program.methods
          .joinDispute()
          .accounts({
            defendant: defendant.publicKey,
            dispute: disputePDA,
            systemProgram: SystemProgram.programId,
          })
          .signers([defendant])
          .rpc();
        console.log(`  TX join_dispute: ${sig}`);
        console.log(`  Defendant: ${defendant.publicKey.toBase58()}`);
      });

      it("submit_evidence (plaintiff)", async () => {
        const [evidencePDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("evidence"), disputePDA.toBytes(), new Uint8Array([0])],
          program.programId
        );
        const sig = await program.methods
          .submitEvidence(`https://evidence.example.com/run${run}/proof1.pdf`)
          .accounts({
            party: plaintiff.publicKey,
            dispute: disputePDA,
            evidenceEntry: evidencePDA,
            systemProgram: SystemProgram.programId,
          })
          .signers([plaintiff])
          .rpc();
        console.log(`  TX submit_evidence: ${sig}`);
      });

      it("debug_set_jury + cast_vote (3 jurors vote)", async () => {
        const selectedJurors = [jurors[0], jurors[1], jurors[2]];

        // Set jury (bypasses VRF on localnet)
        const sig1 = await program.methods
          .debugSetJury(selectedJurors.map((j) => j.publicKey))
          .accounts({
            admin: provider.wallet.publicKey,
            dispute: disputePDA,
          })
          .rpc();
        console.log(`  TX debug_set_jury: ${sig1}`);

        // Cast votes: 2 plaintiff, 1 defendant -> plaintiff wins
        for (let i = 0; i < 3; i++) {
          const vote = i < 2 ? 1 : 2; // 2 plaintiff, 1 defendant
          const sig = await program.methods
            .castVote(vote)
            .accounts({
              juror: selectedJurors[i].publicKey,
              dispute: disputePDA,
            })
            .signers([selectedJurors[i]])
            .rpc();
          console.log(`  TX cast_vote (juror ${i}, vote=${vote === 1 ? "plaintiff" : "defendant"}): ${sig}`);
        }
      });

      it("claim_stakes (winner claims)", async () => {
        const sig = await program.methods
          .claimStakes()
          .accounts({
            winner: plaintiff.publicKey,
            dispute: disputePDA,
          })
          .signers([plaintiff])
          .rpc();
        console.log(`  TX claim_stakes: ${sig}`);
        console.log(`  Winner: ${plaintiff.publicKey.toBase58()}`);
        console.log(`  --- Run ${run} complete: full lifecycle with throwaway wallets ---`);
      });
    });
  }
});
