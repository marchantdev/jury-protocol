import { useMemo } from "react";
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import IDL from "./idl.json";
import { PROGRAM_ID, DISPUTE_SEED } from "./program";

// Anchor 0.30+ IDL type
type JuryProgram = any;

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

  return { program, connection };
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
