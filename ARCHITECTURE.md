# Jury — Architecture

## Overview
On-chain dispute resolution with VRF-based jury selection on Solana. Plaintiff files a dispute and stakes SOL; defendant joins and matches the stake. Three jurors are selected from a pool of nine via Orao VRF. Majority verdict wins; winner claims both stakes.

## Components

### Anchor Program (`jury-program/programs/jury-program/src/lib.rs`)
- **Program ID:** `4hFoUmi8NQnMS8icdTZWnP1wzYrDTpph4qTUjGCsjv15`
- **Dispute PDA:** Seeds = `[b"dispute", plaintiff.key(), dispute_id]`
- **JurorPool PDA:** Seeds = `[b"juror_pool"]` — admin-initialized, read by `reveal_jury`
- **State machine:** `Open → AwaitingJury → JuryRequested → Deliberating → Decided → Claimed`
- **Orao VRF CPI:** `request_v2` with 32-byte seed; `reveal_jury` reads fulfilled randomness

### Instructions
1. `initialize_juror_pool(jurors)` — Admin creates on-chain juror pool PDA (9 addresses)
2. `create_dispute(dispute_id, description, stake_lamports)` — Plaintiff creates dispute, stakes SOL
3. `join_dispute()` — Defendant joins and matches the stake
4. `request_jury(vrf_seed)` — CPI to Orao VRF, requests randomness
5. `reveal_jury()` — Reads VRF result + on-chain pool PDA, selects 3 of 9 jurors
6. `cast_vote(vote)` — Juror votes (1=plaintiff, 2=defendant); auto-decides after 3 votes
7. `claim_stakes()` — Winner withdraws combined stakes

### Frontend (`jury-app/`)
- React 19 + Vite 6 + Tailwind CSS 3
- Solana Wallet Adapter (Phantom/Backpack)
- Routes: `/` (Landing), `/app` and `/disputes` (DisputeApp), `/dispute/:id` (DisputeView)
- Read-only mode: visitors without wallet see dispute list; wallet connection unlocks actions
- On-chain reads via `getProgramAccounts` with Anchor IDL deserialization
- Deployed: https://jury-app-eight.vercel.app

### Data Flow
```
Plaintiff creates dispute → SOL staked in PDA → Defendant joins + stakes
→ VRF requested (Orao CPI) → ~2.5s fulfillment → reveal_jury selects 3/9
→ Jurors cast votes → Majority reached → Winner claims 2x stake
```

### CPI Example (`jury-program/programs/example-escrow/`)
- 50-LOC Anchor program demonstrating CPI composability
- Imports `jury_program::cpi::create_dispute` and calls it from an escrow context
- Compiles with `anchor build` — validates the CPI interface works end-to-end

## Key Design Decisions
- **Pool of 9, select 3:** Prevents collusion while keeping deliberation fast
- **Deterministic selection from VRF:** `randomness[i] % 9` with dedup loop, up to 64 bytes
- **Auto-verdict on 3rd vote:** No separate finalize step; `cast_vote` transitions to Decided
- **PDA as escrow:** Stakes locked in dispute account, no separate vault

## Feature Budget

| Feature | Size | % of EXECUTION budget | Status |
|---------|------|----------------------|--------|
| Anchor dispute program (7 instructions + state machine) | Large | 50% | Complete |
| React frontend (landing + dispute dashboard + wallet) | Medium | 30% | Complete |
| VRF integration (Orao CPI + jury reveal) | Small | 20% | Complete |

## Devnet Deployment
- Program ID: `4hFoUmi8NQnMS8icdTZWnP1wzYrDTpph4qTUjGCsjv15`
- Orao VRF: `VRFzZoJdhFWL8rkvu87LpKM3RbcVezpMEc6X5GVDr7y`
- Network: Solana Devnet
- Explorer: https://explorer.solana.com/address/4hFoUmi8NQnMS8icdTZWnP1wzYrDTpph4qTUjGCsjv15?cluster=devnet
