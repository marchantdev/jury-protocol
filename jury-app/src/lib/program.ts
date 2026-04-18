import { PublicKey } from "@solana/web3.js";

export const PROGRAM_ID = new PublicKey(
  "4hFoUmi8NQnMS8icdTZWnP1wzYrDTpph4qTUjGCsjv15"
);

export const DISPUTE_SEED = Buffer.from("dispute");
export const JUROR_POOL_SEED = Buffer.from("juror_pool");

export function getJurorPoolPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [JUROR_POOL_SEED],
    PROGRAM_ID
  );
}

export function getDisputePDA(
  plaintiff: PublicKey,
  disputeId: Uint8Array
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [DISPUTE_SEED, plaintiff.toBytes(), disputeId],
    PROGRAM_ID
  );
}

export const STATUS_LABELS: Record<number, string> = {
  0: "Open",
  1: "Awaiting Jury",
  2: "Jury Requested",
  3: "Deliberating",
  4: "Decided",
  5: "Claimed",
};

export const STATUS_COLORS: Record<number, string> = {
  0: "#f59e0b",    // amber
  1: "#3b82f6",    // blue
  2: "#8b5cf6",    // purple
  3: "#00ffa3",    // green
  4: "#22c55e",    // emerald
  5: "#6b7280",    // gray
};

export function statusToIndex(status: any): number {
  if (typeof status === "number") return status;
  if (status?.open !== undefined) return 0;
  if (status?.awaitingJury !== undefined) return 1;
  if (status?.juryRequested !== undefined) return 2;
  if (status?.deliberating !== undefined) return 3;
  if (status?.decided !== undefined) return 4;
  if (status?.claimed !== undefined) return 5;
  return -1;
}
