import pkg from "@solana/web3.js"; const { Connection, Keypair, PublicKey } = pkg;
import anchorPkg from "@coral-xyz/anchor"; const { AnchorProvider, Wallet } = anchorPkg;
import oraoPkg from "@orao-network/solana-vrf"; const { Orao, networkStateAccountAddress } = oraoPkg;
import { readFileSync } from "fs";
import { randomBytes } from "crypto";

const RPC = "https://api.devnet.solana.com";
const KEYPAIR_PATH = "/home/ai/.config/solana/id.json";

async function main() {
  const secret = Uint8Array.from(JSON.parse(readFileSync(KEYPAIR_PATH, "utf8")));
  const kp = Keypair.fromSecretKey(secret);
  console.log("Keypair:", kp.publicKey.toBase58());

  const connection = new Connection(RPC, "confirmed");
  const balance = await connection.getBalance(kp.publicKey);
  console.log("Devnet balance:", balance / 1e9, "SOL");
  if (balance < 0.01 * 1e9) {
    console.log("Low balance — requesting airdrop...");
    try {
      const sig = await connection.requestAirdrop(kp.publicKey, 1e9);
      await connection.confirmTransaction(sig, "confirmed");
      console.log("Airdrop:", sig);
    } catch (e) {
      console.log("Airdrop failed:", e.message);
    }
  }

  const provider = new AnchorProvider(connection, new Wallet(kp), { commitment: "confirmed" });
  const vrf = new Orao(provider);

  const net = await vrf.getNetworkState();
  console.log("Orao network state:");
  console.log("  config.authority:", net.config.authority.toBase58());
  console.log("  config.fee:", net.config.requestFee.toString(), "lamports");
  console.log("  config.treasury:", net.config.treasury.toBase58());
  console.log("  numAuthorities:", net.config.fulfillmentAuthorities.length);

  const seed = randomBytes(32);
  console.log("Seed:", Buffer.from(seed).toString("hex"));

  const preReqSlot = await connection.getSlot("confirmed");
  const t0 = Date.now();
  const [retSeed, txSig] = await (await vrf.request(seed)).rpc();
  const postReqSlot = await connection.getSlot("confirmed");
  console.log(`Request tx: ${txSig}`);
  console.log(`  pre slot: ${preReqSlot}  post slot: ${postReqSlot}`);

  console.log("Waiting for fulfillment...");
  const fulfilled = await vrf.waitFulfilled(seed, "confirmed");
  const postFulfillSlot = await connection.getSlot("confirmed");
  const t1 = Date.now();
  const elapsedMs = t1 - t0;
  const slotDelta = postFulfillSlot - postReqSlot;

  console.log("FULFILLED:");
  console.log(`  randomness: ${Buffer.from(fulfilled.randomness).toString("hex")}`);
  console.log(`  wall clock: ${elapsedMs}ms`);
  console.log(`  slot delta (post-request -> post-fulfill): ${slotDelta} slots`);

  // Deterministic jury selection: pick 3 of 9 from randomness
  const rand = fulfilled.randomness;
  const jury = new Set();
  let i = 0;
  while (jury.size < 3 && i < 32) {
    jury.add(rand[i] % 9);
    i++;
  }
  console.log("Jury selection (3 of 9):", [...jury]);
  console.log("\nSPIKE_RESULT:", JSON.stringify({
    tx_signature: txSig,
    seed_hex: Buffer.from(seed).toString("hex"),
    randomness_hex: Buffer.from(fulfilled.randomness).toString("hex"),
    request_slot: postReqSlot,
    fulfillment_slot: postFulfillSlot,
    slot_delta: slotDelta,
    wall_ms: elapsedMs,
    jury_indices: [...jury]
  }));
}

main().catch(e => { console.error("ERROR:", e); process.exit(1); });
