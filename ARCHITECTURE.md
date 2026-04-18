# Jury — Architecture

## Overview
On-chain dispute resolution with VRF-based jury selection on Solana. Plaintiff files a dispute and stakes SOL; defendant joins and matches the stake. Three jurors are selected from a pool of nine via Orao VRF. Majority verdict wins; winner claims both stakes.

## Components

### Anchor Program (`jury-program/programs/jury-program/src/lib.rs`)
- **Program ID:** `4hFoUmi8NQnMS8icdTZWnP1wzYrDTpph4qTUjGCsjv15`
- **Dispute PDA:** Seeds = `[b"dispute", plaintiff.key(), dispute_id]`
- **State machine:** `Open → AwaitingJury → JuryRequested → Deliberating → Decided → Claimed`
- **Orao VRF CPI:** `request_v2` with 32-byte seed; `reveal_jury` reads fulfilled randomness

### Instructions
1. `create_dispute(dispute_id, description, stake_lamports)` — Plaintiff creates dispute, stakes SOL
2. `join_dispute()` — Defendant joins and matches the stake
3. `request_jury(vrf_seed)` — CPI to Orao VRF, requests randomness
4. `reveal_jury(juror_pool)` — Reads VRF result, selects 3 of 9 jurors deterministically
5. `cast_vote(vote)` — Juror votes (1=plaintiff, 2=defendant); auto-decides after 3 votes
6. `claim_stakes()` — Winner withdraws combined stakes

### Frontend (`jury-app/`)
- React 19 + Vite 6 + Tailwind CSS 3
- Solana Wallet Adapter (Phantom/Backpack)
- Routes: `/` (Landing), `/app` (DisputeApp), `/dispute/:id` (DisputeView)
- On-chain reads via `getProgramAccounts` with Anchor IDL deserialization
- Deployed: https://jury-app-eight.vercel.app

### Data Flow
```
Plaintiff creates dispute → SOL staked in PDA → Defendant joins + stakes
→ VRF requested (Orao CPI) → ~2.5s fulfillment → reveal_jury selects 3/9
→ Jurors cast votes → Majority reached → Winner claims 2x stake
```

## Key Design Decisions
- **Pool of 9, select 3:** Prevents collusion while keeping deliberation fast
- **Deterministic selection from VRF:** `randomness[i] % 9` with dedup loop, up to 64 bytes
- **Auto-verdict on 3rd vote:** No separate finalize step; `cast_vote` transitions to Decided
- **PDA as escrow:** Stakes locked in dispute account, no separate vault

## Feature Budget

| Feature | Size | % of EXECUTION budget | Status |
|---------|------|----------------------|--------|
| Anchor dispute program (6 instructions + state machine) | Large | 50% | Complete |
| React frontend (landing + dispute dashboard + wallet) | Medium | 30% | Complete |
| VRF integration (Orao CPI + jury reveal) | Small | 20% | Complete |

## Devnet Deployment
- Program ID: `4hFoUmi8NQnMS8icdTZWnP1wzYrDTpph4qTUjGCsjv15`
- Orao VRF: `VRFzZoJdhFWL8rkvu87LpKM3RbcVezpMEc6X5GVDr7y`
- Network: Solana Devnet
- Explorer: https://explorer.solana.com/address/4hFoUmi8NQnMS8icdTZWnP1wzYrDTpph4qTUjGCsjv15?cluster=devnet
