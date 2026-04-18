import { useMemo } from "react";
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import IDL from "./idl.json";
import { PROGRAM_ID, DISPUTE_SEED, getJurorPoolPDA } from "./program";

// Anchor 0.30+ IDL type
type JuryProgram = any;

const ORAO_VRF_ID = new PublicKey("VRFzZoJdhFWL8rkvu87LpKM3RbcVezpMEc6X5GVDr7y");

// Pre-seeded juror pool for devnet demo (9 addresses)
export const DEVNET_JUROR_POOL: PublicKey[] = [
  new PublicKey("GpXHXs5KfzfXbNKcMLNbAMsJsgPsBE7y5GtwVoiuxYvH"),
  new PublicKey("3Kk7VEYXGRqKWZmFZMbECKhJqyaGQjsKYZLAPBRZ2Qfn"),
  new PublicKey("7x6VZPjwqNJ8Cg1JZfGmWGqS5k3CVD9cRYxQq5F2cYV"),
  new PublicKey("9dWLBCbvQEWjCX2qKs9YBtHFXYqJGdMrTgKNm8jMUeAQ"),
  new PublicKey("5fvPFGCEKzZ5S5JJNWzFNfMq9gCLRrUDwTf6Ly6RYp7X"),
  new PublicKey("BqJHrZ4r3RWxJBbGSCRv3xJgFiupGJP8J7T4g5QXaEQ2"),
  new PublicKey("FNVBz5rJUVfePjGndMQKoYTqxZx4wfNpT3N4fJKTPbAs"),
  new PublicKey("HGjd3fNVWJNkqJHfD7qYQnSr5y9oRBMepqfFSMAqK7cM"),
  new PublicKey("4TpUJx9YQV6DLhdWnMbpwYzk3sCqXLT5RnPYZnYqJ6bP"),
];

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

  // Read-only program available even without wallet (for fetching disputes)
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
  stakeSol: number
): Promise<string> {
  // Generate a random 32-byte dispute ID
  const disputeId = new Uint8Array(32);
  crypto.getRandomValues(disputeId);

  const stakeLamports = new BN(Math.floor(stakeSol * LAMPORTS_PER_SOL));

  const [disputePDA] = PublicKey.findProgramAddressSync(
    [DISPUTE_SEED, plaintiff.toBytes(), disputeId],
    PROGRAM_ID
  );

  const sig = await (program.methods as any)
    .createDispute(Array.from(disputeId), description, stakeLamports)
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

  // Fetch treasury from network state
  const nsAccount = await program.provider.connection.getAccountInfo(networkState);
  if (!nsAccount) throw new Error("Orao VRF network state not found");
  // Treasury pubkey is at offset 8 (discriminator) + 32 (authority) = 40
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
  admin: PublicKey,
  jurors: PublicKey[]
): Promise<string> {
  const [jurorPoolPDA] = getJurorPoolPDA();
  const sig = await (program.methods as any)
    .initializeJurorPool(jurors)
    .accounts({
      admin,
      jurorPool: jurorPoolPDA,
      systemProgram: SystemProgram.programId,
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
