# JURY — Technical Spike Result

**Date:** 2026-04-16  **Executed:** 10:55–11:05 UTC
**Method:** Real Solana devnet calls via @orao-network/solana-vrf v0.8.0
**RPC:** https://api.devnet.solana.com
**Signer:** GpXHXs5KfzfXbNKcMLNbAMsJsgPsBE7y5GtwVoiuxYvH

## Executive Verdict
**VRF claim PROVEN on devnet** — via Orao Network VRF, not Switchboard.
Switchboard's legacy VRF replaced by TEE commit/reveal. Orao Classic VRF is live, Byzantine-quorum (4 auths), sub-3s fulfillment, permissionless.

All four spike-target.md success criteria PASS:

| Criterion | Result | Status |
|-----------|--------|--------|
| VRF request on devnet produces verifiable tx hash | 4/4 runs confirmed | PASS |
| Fulfillment latency ≤ 5 slots | Mean 4.5 slots (min 4, max 5) | PASS |
| VRF output deterministically maps 3 of 9 jury | rand[i]%9 de-dup in ≤32 tries | PASS |
| No manual oracle step | Orao auto-fulfills | PASS |

## Raw Devnet Evidence (4 runs)

| # | Request Tx | Req Slot | Fulfill Slot | Δ slots | Wall ms | Jury |
|---|------------|----------|--------------|---------|---------|------|
| 0 | vQUeeQaJieekjJcgL7gQGVKhrp89v98fUoohMSkwdxFF5aQ6xGnNLySn5QfXxss6RCF9eYre1Ud9WYNFtW63dRE | 455910829 | 455910834 | 5 | 2532 | [7,2,5] |
| 1 | 2im1F5gtarJTXN9PopGDLJfKybNrALFLPS7XhRLHX2k3LAzc7ECnxEBakPeWHNVgNr4FTT4zk4dPtVUbAgVhqDGx | 455910876 | 455910880 | 4 | 2727 | [5,1,7] |
| 2 | NT2F1br99zq46YiYidRabJFyT2h4V3Dit4NoQ3jXZLPXDpq4BEK194BQpn7TKVGka32ZwwGMkxzWbgKkmt8eDMv | 455910891 | 455910895 | 4 | 2293 | [8,3,5] |
| 3 | 4e3Zy9PvxuzwVCfBEovEptnmvhXrELH2MSfh6BMTnSKDxHbTRqjTMn2wKDNsBWoCn7wwvemyW1JHh3mE8H4Lr5wA | 455910906 | 455910911 | 5 | 2515 | [7,5,1] |

Mean slot Δ = 4.5, mean wall = 2517 ms. All sigs on Solana Explorer devnet cluster.

Full randomness output (run 0):
randomness = 464a05aa4db49b7c7e16ea41774cd5625d17c65c330c7cc71197719379b054f6178d2c49a47924138d5e067a7dd18dc8c228cff5dd7e1c3dc2b7caaf60769309
64 bytes, Byzantine-signed by all four Orao fulfillment authorities.

## Finding 1 — Switchboard VRF is effectively gone
Switchboard docs now describe only On-Demand randomness (TEE commit/reveal). Trust root shifts from signature verification to TEE attestation. Single-slot not available by design. Jury's architecture maps to Orao, not Switchboard.

## Finding 2 — Orao Classic VRF is live + fits UX
- Program ID: VRFzZoJdhFWL8rkvu87LpKM3RbcVezpMEc6X5GVDr7y (devnet = mainnet)
- Treasury/authority: 9ZTHWWZDpB36UFe1vszf2KEpt83vwi27jDqtHQ7NSXyR
- Fee: 300000 lamports/request (~0.0003 SOL)
- 4 fulfillment authorities (Byzantine quorum)
- Callback variant: VRFCBePmGTpZ234BhbzNNzmyg39Rgdd6VgdfhHwKypU for Anchor CPI

~2.5 s wall clock fits comfortably in a 90-second demo.

## Finding 3 — Manipulation-resistance (precise framing)
4-of-4 Byzantine quorum; client 32-byte seed bound to one-shot PDA. No retry-on-same-seed; observer cannot predict pre-aggregation.
**Caveat:** authorities are a known-set committee. Pitch must say "VRF-backed Byzantine quorum with a public authority set", NOT "trustless randomness".

## Finding 4 — Jury index derivation
while(jurySet.size<3 && i<32) jurySet.add(rand[i]%9); Produced 3 distinct indices in ≤32 tries across all 4 runs.

## Not proven yet
- Anchor CPI integration (client-side SDK used; on-chain request_v2 CPI = Week 2)
- Mainnet fulfillment (same 4 authorities; mainnet smoke-test recommended)
- Verdict economics (selection unbiased; verdict slashing design separate)

## Recommendation
Proceed with Jury. Core claim reproducibly true via Orao VRF.
Next: thesis rewrite naming Orao (not Switchboard), citing this spike. Week 1 Anchor scaffold with Dispute/Juror/Verdict PDAs + devnet CPI into Orao request_v2. Mainnet smoke-test pre-submission.
