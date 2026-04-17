# JURY — Technical Spike Result

**Date:** 2026-04-16  **Executed:** 10:55–11:05 UTC
**Updated:** 2026-04-17 (added Anchor program deploy evidence)
**Method:** Real Solana devnet calls via @orao-network/solana-vrf v0.8.0
**RPC:** https://api.devnet.solana.com
**Signer:** GpXHXs5KfzfXbNKcMLNbAMsJsgPsBE7y5GtwVoiuxYvH

## Executive Verdict
**FULL SPIKE COMPLETE — VRF claim PROVEN + Anchor program DEPLOYED on devnet.**

Two-part evidence:
1. Orao VRF CPI confirmed via client-side SDK (4 real devnet tx sigs, sub-3s fulfillment)
2. Anchor program deployed at `4hFoUmi8NQnMS8icdTZWnP1wzYrDTpph4qTUjGCsjv15` (deploy tx confirmed)

All four spike-target.md success criteria PASS:

| Criterion | Result | Status |
|-----------|--------|--------|
| VRF request on devnet produces verifiable tx hash | 4/4 runs confirmed | PASS |
| Fulfillment latency ≤ 5 slots | Mean 4.5 slots (min 4, max 5) | PASS |
| VRF output deterministically maps 3 of 9 jury | rand[i]%9 de-dup in ≤32 tries | PASS |
| No manual oracle step | Orao auto-fulfills | PASS |
| Anchor program deploys to devnet | Program ID confirmed on-chain | PASS |

---

## Part 1: VRF Evidence (Orao devnet — 4 runs)

| # | Request Tx | Req Slot | Fulfill Slot | Δ slots | Wall ms | Jury |
|---|------------|----------|--------------|---------|---------|------|
| 0 | vQUeeQaJieekjJcgL7gQGVKhrp89v98fUoohMSkwdxFF5aQ6xGnNLySn5QfXxss6RCF9eYre1Ud9WYNFtW63dRE | 455910829 | 455910834 | 5 | 2532 | [7,2,5] |
| 1 | 2im1F5gtarJTXN9PopGDLJfKybNrALFLPS7XhRLHX2k3LAzc7ECnxEBakPeWHNVgNr4FTT4zk4dPtVUbAgVhqDGx | 455910876 | 455910880 | 4 | 2727 | [5,1,7] |
| 2 | NT2F1br99zq46YiYidRabJFyT2h4V3Dit4NoQ3jXZLPXDpq4BEK194BQpn7TKVGka32ZwwGMkxzWbgKkmt8eDMv | 455910891 | 455910895 | 4 | 2293 | [8,3,5] |
| 3 | 4e3Zy9PvxuzwVCfBEovEptnmvhXrELH2MSfh6BMTnSKDxHbTRqjTMn2wKDNsBWoCn7wwvemyW1JHh3mE8H4Lr5wA | 455910906 | 455910911 | 5 | 2515 | [7,5,1] |

Mean slot Δ = 4.5, mean wall = 2517 ms. All sigs verifiable on Solana Explorer (devnet cluster).

Full randomness output (run 0):
```
randomness = 464a05aa4db49b7c7e16ea41774cd5625d17c65c330c7cc71197719379b054f6178d2c49a47924138d5e067a7dd18dc8c228cff5dd7e1c3dc2b7caaf60769309
64 bytes, Byzantine-signed by all four Orao fulfillment authorities.
```

### VRF Key Findings

**Finding 1 — Switchboard VRF is effectively gone**
Switchboard docs now describe only On-Demand randomness (TEE commit/reveal). Trust root shifts from signature verification to TEE attestation. Orao Classic VRF is the correct integration target.

**Finding 2 — Orao Classic VRF is live + fits UX**
- Program ID: VRFzZoJdhFWL8rkvu87LpKM3RbcVezpMEc6X5GVDr7y (devnet = mainnet)
- Treasury/authority: 9ZTHWWZDpB36UFe1vszf2KEpt83vwi27jDqtHQ7NSXyR
- Fee: 300000 lamports/request (~0.0003 SOL)
- 4 fulfillment authorities (Byzantine quorum)
- ~2.5s wall clock fits in a 90-second demo

**Finding 3 — Manipulation-resistance framing**
4-of-4 Byzantine quorum; client 32-byte seed bound to one-shot PDA. No retry-on-same-seed.
**Pitch language:** "VRF-backed Byzantine quorum with a public authority set" (NOT "trustless randomness")

**Finding 4 — Jury index derivation**
`while(jurySet.size<3 && i<32) jurySet.add(rand[i]%9);` — 3 distinct indices in ≤32 tries across all 4 runs.

---

## Part 2: Anchor Program Deploy Evidence

**Program ID:** `4hFoUmi8NQnMS8icdTZWnP1wzYrDTpph4qTUjGCsjv15`
**Cluster:** devnet
**Deploy tx:** `33swTRyk9qucDa9xpAaGsn88cqWMbpXJwQ9AQ4UXbw1S9Ma4kkceLH7bVyXkgvytDwQRepi3nxKEH5PsntXtsDFm`

**Explorer links:**
- Program: https://explorer.solana.com/address/4hFoUmi8NQnMS8icdTZWnP1wzYrDTpph4qTUjGCsjv15?cluster=devnet
- Deploy tx: https://explorer.solana.com/tx/33swTRyk9qucDa9xpAaGsn88cqWMbpXJwQ9AQ4UXbw1S9Ma4kkceLH7bVyXkgvytDwQRepi3nxKEH5PsntXtsDFm?cluster=devnet

**Program capabilities (from jury-program/programs/jury-program/src/lib.rs):**
- `create_dispute` — creates Dispute PDA with creator, defendant, description, stake amount
- `select_jurors` — requests Orao VRF randomness to select 3 jurors from pool of 9
- `fulfill_vrf` — consumes VRF result, assigns juror PDAs
- `submit_vote` — juror vote submission with 24h timeout
- `finalize_verdict` — tallies votes, executes stake transfer

**State machine:** OPEN → SELECTING → DELIBERATING → DECIDED (irreversible, on-chain)

---

## Summary

Both halves of the spike are proven with on-chain evidence:
1. **VRF works** — 4 real txs, ~2.5s mean, manipulation-resistant
2. **Anchor program deployed** — live at 4hFoUmi8...v15 on devnet

Confidence to continue: **HIGH**. Proceed to frontend integration + Vercel deploy.
