# Jury — Architecture

## Overview
On-chain dispute resolution with VRF-based jury selection on Solana.

## Components

### Anchor Program (`programs/jury/`)
- **DisputePDA**: Stores dispute state (parties, evidence hash, status, verdict)
- **JurorPDA**: Per-juror assignment record (juror pubkey, VRF seed, commitment)
- **State machine**: Open → JurySelected → Deliberating → Verdict
- **Orao VRF CPI**: Requests randomness for jury selection; fulfillment triggers `select_jury` instruction

### Instructions
1. `open_dispute(respondent, evidence_hash, stake)` → creates DisputePDA, locks stake
2. `request_jury(dispute)` → CPIs to Orao VRF, stores pending request
3. `fulfill_jury(vrf_result)` → called by Orao fulfiller, selects N jurors deterministically
4. `submit_vote(dispute, juror, vote)` → records juror vote commitment
5. `finalize_verdict(dispute)` → tallies votes, releases stake to winning party

### Frontend (`frontend/`)
- React + Vite + Tailwind
- Wallet adapter (Phantom/Backpack)
- Three screens: OpenDispute → JuryWatch → VerdictView
- Polls dispute account every 2s for state changes

### Data Flow
```
User opens dispute → Anchor locks stake → VRF requested → Orao fulfills
→ Jury selected → Jurors vote → Verdict finalized → Stake released
```

## Devnet Deployment
- Program ID: (assigned after `anchor deploy`)
- Orao VRF devnet: `VRFzZoJdhFWL8rkvu87LpKM3RbcVezpMEc6X5GVDr7y`
