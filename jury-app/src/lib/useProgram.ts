import { useMemo } from "react";
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import IDL from "./idl.json";
import { PROGRAM_ID, DISPUTE_SEED, EVIDENCE_SEED, getJurorPoolPDA } from "./program";

// Anchor 0.30+ IDL type
type JuryProgram = any;

const ORAO_VRF_ID = new PublicKey("VRFzZoJdhFWL8rkvu87LpKM3RbcVezpMEc6X5GVDr7y");

// Dummy wallet for read-only Anchor provider (never signs, only reads)
const READ_ONLY_WALLET = {
  publicKey: PublicKey.default,
  signTransaction: async (tx: any) => tx,
  signAllTransactions: async (txs: any) => txs,
};

export function useProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const program = useMemo(() => {
    if (!wallet) return null;
    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });
    return new Program(IDL as any, provider) as Program<JuryProgram>;
  }, [connection, wallet]);

  const readOnlyProgram = useMemo(() => {
    const provider = new AnchorProvider(connection, READ_ONLY_WALLET as any, {
      commitment: "confirmed",
    });
    return new Program(IDL as any, provider) as Program<JuryProgram>;
  }, [connection]);

  return { program, readOnlyProgram, connection };
}

export async function createDisputeTx(
  program: Program<JuryProgram>,
  plaintiff: PublicKey,
  description: string,
  stakeSol: number,
  deadlineSeconds: number = 0
): Promise<string> {
  const disputeId = new Uint8Array(32);
  crypto.getRandomValues(disputeId);

  const stakeLamports = new BN(Math.floor(stakeSol * LAMPORTS_PER_SOL));
  const deadline = new BN(deadlineSeconds);

  const [disputePDA] = PublicKey.findProgramAddressSync(
    [DISPUTE_SEED, plaintiff.toBytes(), disputeId],
    PROGRAM_ID
  );

  const sig = await (program.methods as any)
    .createDispute(Array.from(disputeId), description, stakeLamports, deadline)
    .accounts({
      plaintiff,
      dispute: disputePDA,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return sig as string;
}

export interface DisputeAccount {
  publicKey: PublicKey;
  id: number[];
  plaintiff: PublicKey;
  defendant: PublicKey;
  description: string;
  stakeLamports: BN;
  status: any;
  jury: PublicKey[];
  votes: number[];
  vrfSeed: number[];
  winner: number;
  createdAt: BN;
  deadline: BN;
  evidenceCount: number;
  bump: number;
}

export interface EvidenceEntryAccount {
  publicKey: PublicKey;
  dispute: PublicKey;
  party: PublicKey;
  uri: string;
  submittedAt: BN;
  index: number;
  bump: number;
}

export async function fetchAllDisputes(
  program: Program<JuryProgram>
): Promise<DisputeAccount[]> {
  const accounts = await (program.account as any).dispute.all();
  return accounts.map((a: any) => ({
    publicKey: a.publicKey,
    ...a.account,
  }));
}

export async function fetchDispute(
  program: Program<JuryProgram>,
  disputePDA: PublicKey
): Promise<DisputeAccount | null> {
  try {
    const account = await (program.account as any).dispute.fetch(disputePDA);
    return { publicKey: disputePDA, ...account } as DisputeAccount;
  } catch {
    return null;
  }
}

export async function fetchEvidenceEntries(
  program: Program<JuryProgram>,
  disputePDA: PublicKey,
  count: number
): Promise<EvidenceEntryAccount[]> {
  const entries: EvidenceEntryAccount[] = [];
  for (let i = 0; i < count; i++) {
    const [evidencePDA] = PublicKey.findProgramAddressSync(
      [EVIDENCE_SEED, disputePDA.toBytes(), new Uint8Array([i])],
      PROGRAM_ID
    );
    try {
      const account = await (program.account as any).evidenceEntry.fetch(evidencePDA);
      entries.push({ publicKey: evidencePDA, ...account } as EvidenceEntryAccount);
    } catch {
      // Entry may not exist yet
    }
  }
  return entries;
}

export async function joinDisputeTx(
  program: Program<JuryProgram>,
  defendant: PublicKey,
  disputePDA: PublicKey
): Promise<string> {
  const sig = await (program.methods as any)
    .joinDispute()
    .accounts({
      defendant,
      dispute: disputePDA,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  return sig as string;
}

function getOraoNetworkStatePDA(): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("orao-vrf-network-configuration")],
    ORAO_VRF_ID
  );
  return pda;
}

function getOraoRandomnessPDA(seed: Uint8Array): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("orao-vrf-randomness-request"), seed],
    ORAO_VRF_ID
  );
  return pda;
}

export async function requestJuryTx(
  program: Program<JuryProgram>,
  payer: PublicKey,
  disputePDA: PublicKey
): Promise<string> {
  const vrfSeed = new Uint8Array(32);
  crypto.getRandomValues(vrfSeed);

  const networkState = getOraoNetworkStatePDA();
  const random = getOraoRandomnessPDA(vrfSeed);

  const nsAccount = await program.provider.connection.getAccountInfo(networkState);
  if (!nsAccount) throw new Error("Orao VRF network state not found");
  const treasury = new PublicKey(nsAccount.data.subarray(40, 72));

  const sig = await (program.methods as any)
    .requestJury(Array.from(vrfSeed))
    .accounts({
      payer,
      dispute: disputePDA,
      random,
      treasury,
      networkState,
      vrf: ORAO_VRF_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  return sig as string;
}

export async function initializeJurorPoolTx(
  program: Program<JuryProgram>,
  admin: PublicKey
): Promise<string> {
  const [jurorPoolPDA] = getJurorPoolPDA();
  const sig = await (program.methods as any)
    .initializeJurorPool()
    .accounts({
      admin,
      jurorPool: jurorPoolPDA,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  return sig as string;
}

export async function registerJurorTx(
  program: Program<JuryProgram>,
  juror: PublicKey
): Promise<string> {
  const [jurorPoolPDA] = getJurorPoolPDA();
  const sig = await (program.methods as any)
    .registerJuror()
    .accounts({
      juror,
      jurorPool: jurorPoolPDA,
    })
    .rpc();
  return sig as string;
}

export async function revealJuryTx(
  program: Program<JuryProgram>,
  dispute: DisputeAccount
): Promise<string> {
  const vrfSeed = new Uint8Array(dispute.vrfSeed);
  const random = getOraoRandomnessPDA(vrfSeed);
  const [jurorPoolPDA] = getJurorPoolPDA();

  const sig = await (program.methods as any)
    .revealJury()
    .accounts({
      dispute: dispute.publicKey,
      jurorPool: jurorPoolPDA,
      random,
    })
    .rpc();
  return sig as string;
}

export async function castVoteTx(
  program: Program<JuryProgram>,
  juror: PublicKey,
  disputePDA: PublicKey,
  vote: number
): Promise<string> {
  const sig = await (program.methods as any)
    .castVote(vote)
    .accounts({
      juror,
      dispute: disputePDA,
    })
    .rpc();
  return sig as string;
}

export async function claimStakesTx(
  program: Program<JuryProgram>,
  winner: PublicKey,
  disputePDA: PublicKey
): Promise<string> {
  const sig = await (program.methods as any)
    .claimStakes()
    .accounts({
      winner,
      dispute: disputePDA,
    })
    .rpc();
  return sig as string;
}

export async function submitEvidenceTx(
  program: Program<JuryProgram>,
  party: PublicKey,
  disputePDA: PublicKey,
  uri: string,
  currentEvidenceCount: number
): Promise<string> {
  const [evidencePDA] = PublicKey.findProgramAddressSync(
    [EVIDENCE_SEED, disputePDA.toBytes(), new Uint8Array([currentEvidenceCount])],
    PROGRAM_ID
  );

  const sig = await (program.methods as any)
    .submitEvidence(uri)
    .accounts({
      party,
      dispute: disputePDA,
      evidenceEntry: evidencePDA,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
  return sig as string;
}

export async function expireDisputeTx(
  program: Program<JuryProgram>,
  disputePDA: PublicKey,
  plaintiffPubkey: PublicKey,
  defendantPubkey: PublicKey
): Promise<string> {
  const sig = await (program.methods as any)
    .expireDispute()
    .accounts({
      dispute: disputePDA,
      plaintiff: plaintiffPubkey,
      defendant: defendantPubkey,
    })
    .rpc();
  return sig as string;
}

export async function fetchJurorPool(
  program: Program<JuryProgram>
): Promise<{ admin: PublicKey; count: number; jurors: PublicKey[] } | null> {
  const [jurorPoolPDA] = getJurorPoolPDA();
  try {
    const pool = await (program.account as any).jurorPool.fetch(jurorPoolPDA);
    return {
      admin: pool.admin,
      count: pool.count,
      jurors: pool.jurors.slice(0, pool.count),
    };
  } catch {
    return null;
  }
}
