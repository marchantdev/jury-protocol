# JURY — Quality Review Checklist

**Date:** 2026-04-18
**Reviewer:** Claude Code (local agent)
**Project:** JURY — On-Chain Dispute Resolution with VRF Jury Selection
**Hackathon:** Colosseum Frontier R14
**Submitted to:** https://jury-app-eight.vercel.app
**Program:** `4hFoUmi8NQnMS8icdTZWnP1wzYrDTpph4qTUjGCsjv15` (devnet)
**Source:** https://github.com/marchantdev/jury-protocol

---

## Summary Scorecard

| Category | Score | Notes |
|----------|-------|-------|
| Code Quality (Anchor) | 8/10 | Clean, idiomatic, well-structured |
| Frontend Quality | 6/10 | Works, but thin — no VRF-flow UI past create |
| Documentation | 7/10 | README strong; ARCHITECTURE.md stale |
| Deployment | 8/10 | Program live on devnet; Vercel frontend confirmed |
| Demo Readiness | 6/10 | Create-dispute flow works end-to-end; VRF/voting requires CLI |
| Known Issues | — | See section 6 |
| **Overall** | **7/10** | Solid technical core. Demo gap: VRF jury flow is not clickable from the browser. |

---

## 1. Code Quality — Anchor Program

**Score: 8/10**

### Evidence
- File: `jury-program/programs/jury-program/src/lib.rs` (479 lines)
- 6 instructions, 6-state state machine, 11 error codes, 7 events

### Strengths

**State machine is correct and enforced.**
Every instruction opens with `require!(dispute.status == DisputeStatus::X, JuryError::InvalidStatus)`. Transitions are one-way and exhaustive: `Open → AwaitingJury → JuryRequested → Deliberating → Decided → Claimed`. No backdoors.

**Input validation is present and tested.**
`create_dispute` checks `description.len() <= 256` and `stake_lamports > 0`. `cast_vote` checks `vote == 1 || vote == 2`. `request_jury` rejects a zero VRF seed. All three have corresponding negative tests.

**PDA seeds are canonical and stable.**
Seeds: `[b"dispute", plaintiff.key(), dispute_id]`. The `dispute_id` is a caller-supplied `[u8; 32]`, allowing collision-resistance without a nonce counter.

**VRF integration is correct.**
`request_jury` does a proper CPI to `orao_solana_vrf::cpi::request_v2`. `reveal_jury` reads back the fulfilled randomness account, deserializes it with `RandomnessAccountData::try_deserialize`, and calls `fulfilled_randomness()`. The selection algorithm (`rand[i] % JURY_POOL_SIZE` with duplicate rejection, up to 64 attempts) is deterministic and loop-bounded.

**Events cover every state transition.**
`DisputeCreated`, `DefendantJoined`, `JuryRequested`, `JuryRevealed`, `VoteCast`, `VerdictReached`, `StakesClaimed` — indexers can reconstruct full history from logs alone.

**Stake escrow is handled safely.**
Both `create_dispute` and `join_dispute` use `anchor_lang::system_program::transfer` CPI to move lamports into the dispute PDA. `claim_stakes` uses direct lamport arithmetic (`try_borrow_mut_lamports`) which is correct for a PDA-owned account, though less readable than a CPI transfer.

### Weaknesses

**No timeout / dispute abandonment path.**
If the defendant never joins, the plaintiff's stake is locked forever. If a juror disappears before voting, the dispute is stuck in `Deliberating` indefinitely. There is no `expire_dispute` or `timeout_vote` instruction. This is a real UX and safety gap for any production usage.

**`reveal_jury` juror pool is caller-supplied.**
`juror_pool: [Pubkey; 9]` is passed in by whoever calls `reveal_jury`. The VRF output deterministically picks 3 indices from this pool, but the pool composition itself is unverified on-chain. An attacker who controls `reveal_jury` could supply a rigged pool. For a hackathon demo this is acceptable, but it is a critical trust assumption that must be documented.

**`claim_stakes` does not close the account.**
After `claim_stakes`, the dispute account remains allocated (rent-paying). The PDA lamports are drained by 2x the stake, but rent lamports remain locked. A `close = winner` constraint on the `ClaimStakes` context would reclaim this.

**`Dispute::SIZE` calculation is manual and not unit-tested.**
`32 + 32 + 32 + (4 + 256) + 8 + 1 + (32 * 3) + 3 + 32 + 1 + 8 + 1 = 468 bytes`. This is correct, but if the struct changes, the constant will silently diverge. Anchor's `#[derive(InitSpace)]` macro would eliminate this risk.

**No `#[access_control]` or constraint-level checks on `reveal_jury`.**
Anyone can call `reveal_jury` once the VRF is fulfilled — not just the plaintiff/defendant/payer. This is by-design for permissionless settlement but deserves a comment.

**Tie-breaking defaults to defendant wins.**
With 3 jurors, a 2-1 split always decides. But if somehow votes are equal (which the current logic allows if `plaintiff_votes == defendant_votes`, both being 1.5 in a 3-juror system — impossible with integers, but the implicit else-branch defaults to `winner = 2` without a tie-check comment). This should be explicitly documented or guarded.

### Test Coverage

- 5 tests in `jury-program.ts`
- Covers: create_dispute (happy path), join_dispute (happy path + duplicate rejection), zero-stake rejection, description-too-long rejection
- **Missing:** VRF request/reveal path (requires network), cast_vote (happy + double-vote rejection), claim_stakes (happy + wrong winner rejection)
- Test coverage is approximately 40% of instructions. The 4 tested cases are all unit-level; the 2 untested instructions (`request_jury`, `reveal_jury`, `cast_vote`, `claim_stakes`) are the program's core value.

---

## 2. Frontend Quality

**Score: 6/10**

### Evidence
- Files: `jury-app/src/` (7 source files, ~700 lines total TypeScript/TSX)
- Stack: React 18, Vite, Tailwind, `@solana/wallet-adapter-react`, `@coral-xyz/anchor`
- Routes: `/` (Landing), `/app` (DisputeApp), `/dispute/:id` (DisputeView)

### Strengths

**Wallet integration is correct.**
`ConnectionProvider` → `WalletProvider` → `WalletModalProvider` wrapping order is right. `autoConnect` is enabled. `useAnchorWallet` is used (not `useWallet`) for the `AnchorProvider`, which is the correct hook for building Anchor clients. The `PhantomWalletAdapter` is explicitly listed.

**On-chain data is real.**
`fetchAllDisputes` calls `program.account.dispute.all()` — a genuine `getProgramAccounts` fetch. `fetchDispute` fetches a single PDA by address. Both map raw Anchor account data to the `DisputeAccount` interface. The dispute list sorts by `created_at` descending using on-chain timestamps.

**Error states are handled throughout.**
`DisputeApp`, `DisputeList`, and `DisputeView` all implement `loading`, `error`, and empty-state branches. Error messages display inline. Retry buttons exist.

**Status rendering is accurate.**
`statusToIndex` handles both enum-object format (Anchor 0.30+: `{ open: {} }`) and integer format. `STATUS_LABELS` and `STATUS_COLORS` cover all 6 states with distinct colors.

**Explorer links are wired correctly.**
Plaintiff/defendant/juror addresses link to `explorer.solana.com/address/...?cluster=devnet`. Transaction receipts link to `explorer.solana.com/tx/...?cluster=devnet`. All links open in new tab with `rel="noopener"`.

**Custom design system is consistent.**
`jury-*` Tailwind tokens (green `#00ffa3`, near-black `#050505`, surface `#111111`) are used throughout. No placeholder or default colors. Space Grotesk + JetBrains Mono font pair is appropriate.

### Weaknesses

**VRF jury flow is not accessible from the browser.**
The frontend only exposes `createDisputeTx` in `useProgram.ts`. There is no UI for `joinDispute`, `requestJury`, `revealJury`, `castVote`, or `claimStakes`. A user who creates a dispute via the app hits a dead end — the dispute view shows its state and jury panel, but there are no action buttons to advance the flow. The full lifecycle requires CLI or direct RPC calls.

**`useProgram.ts` uses `type JuryProgram = any`.**
The Anchor IDL type is bypassed (`IDL as any`, `program.methods as any`, `program.account as any`). This eliminates TypeScript's safety guarantees for all on-chain interactions. Runtime type errors will surface as cryptic RPC failures rather than compile-time warnings.

**No polling or event subscription.**
`DisputeView` fetches state once on mount and does not poll. If VRF fulfillment or a vote lands while a user is watching, the display does not update. A 5-second `setInterval` or Solana WebSocket subscription would fix this.

**"View Source" link on Landing page points to `https://github.com`, not the actual repo.**
Line 37 of `Landing.tsx`: `href="https://github.com"`. This is a placeholder that was not replaced with the actual repository URL (`https://github.com/marchantdev/jury-protocol`).

**`DisputeApp` does not show connected wallet address.**
After connecting, there is no confirmation to the user of which address they are connected with. `WalletMultiButton` shows the wallet icon but not the truncated address in this layout.

**No input validation feedback before submission.**
The create-dispute form disables the submit button when description is empty, but does not warn when stake is below the rent-exempt minimum (~0.002 SOL). A 0.001 SOL stake would succeed on the program but leave the PDA under-funded.

---

## 3. Documentation

**Score: 7/10**

### Evidence
- `README.md` (130 lines) — primary project documentation
- `ARCHITECTURE.md` (36 lines) — system overview
- `DEMO_FLOW.md` (80 lines) — video script and scene descriptions
- `spike-result.md` (94 lines) — VRF technical evidence
- `jury-program/tests/jury-program.ts` — inline test descriptions

### Strengths

**README.md is submission-ready.**
Covers: problem statement, 4-step how-it-works, architecture diagram, instruction table with descriptions, VRF evidence table (4 runs, slot deltas, wall times, jury indices), tech stack, project structure, local run instructions, on-chain IDs table, competitive landscape comparison (Kleros/Aragon/JURY on cost, speed, randomness model). The competitive table is the strongest element — the $0.01 vs $50-200 cost delta is concrete and verifiable.

**VRF evidence is well-documented.**
`spike-result.md` contains all 4 transaction signatures, slot numbers, wall times, and the full 64-byte randomness output for run 0. The Orao program ID, treasury address, and fee (0.0003 SOL) are all documented. This is the kind of primary-source evidence judges can verify independently.

**DEMO_FLOW.md gives judges a script.**
6 scenes with timestamps, display text, voiceover, and visual instructions. Key moment 1 (dispute creation tx), 2 (VRF evidence table), and 3 (cost comparison) are explicitly called out. This is more planning discipline than most hackathon submissions show.

### Weaknesses

**ARCHITECTURE.md is stale and contradicts the actual program.**
The file describes instructions as `open_dispute`, `request_jury`, `fulfill_jury`, `submit_vote`, `finalize_verdict` — none of which exist. The actual instructions are `create_dispute`, `join_dispute`, `request_jury`, `reveal_jury`, `cast_vote`, `claim_stakes`. The state machine names are also wrong (`Open → JurySelected → Deliberating → Verdict` vs actual `Open → AwaitingJury → JuryRequested → Deliberating → Decided → Claimed`). ARCHITECTURE.md appears to be the planning-phase document that was never updated to match the shipped code.

**No security assumptions documented.**
The juror pool trust assumption (caller supplies the 9-address pool to `reveal_jury`) is not documented anywhere. A judge who reads the program carefully will ask "who controls the pool?" and find no answer.

**No known limitations section in README.**
The timeout gap, the lack of evidence submission, and the devnet-only deployment are not mentioned. Judges appreciate honesty over omission.

**Test file has no comments explaining what each test covers at the business logic level.**
The test names are descriptive ("rejects duplicate defendant join") but the file lacks a docblock explaining which instructions are covered and which are left out.

---

## 4. Deployment

**Score: 8/10**

### Evidence
- Program ID: `4hFoUmi8NQnMS8icdTZWnP1wzYrDTpph4qTUjGCsjv15`
- Deploy tx: `33swTRyk9qucDa9xpAaGsn88cqWMbpXJwQ9AQ4UXbw1S9Ma4kkceLH7bVyXkgvytDwQRepi3nxKEH5PsntXtsDFm`
- Frontend: `https://jury-app-eight.vercel.app`
- Anchor.toml cluster: `devnet`
- IDL embedded in frontend at `jury-app/src/lib/idl.json`

### Strengths

**Program is deployed and confirmed on devnet.**
The deploy transaction is on-chain and verifiable. The program ID matches across `declare_id!()`, `Anchor.toml`, `jury-app/src/lib/program.ts`, and the landing page display. No inconsistency.

**Frontend deploys correctly to Vercel.**
`vercel.json` is present. The `jury-app/.vercel/project.json` confirms a linked project. The Vite build produces a valid `dist/index.html`. Vercel URL is live.

**IDL is embedded correctly.**
`src/lib/idl.json` is the actual compiled IDL from `anchor build`. `useProgram.ts` passes it directly to `new Program(IDL as any, provider)`. The program ID in the IDL matches the deployed address.

**Devnet RPC is hardcoded to the public endpoint.**
`const DEVNET_RPC = "https://api.devnet.solana.com"` in `App.tsx`. This is reliable for demos but will rate-limit under load. For a hackathon presentation this is acceptable.

### Weaknesses

**No mainnet deployment.**
Devnet-only. Judges who expect mainnet evidence will note this. Colosseum Frontier typically accepts devnet for hackathon projects, but it should be stated explicitly in the README.

**No Vercel environment variables or RPC key.**
The public devnet RPC is subject to rate limiting. If judges access the frontend simultaneously during judging, fetching all disputes may fail silently. A Helius or QuickNode devnet endpoint would be more robust.

**No CI/CD pipeline documented.**
There is no `.github/workflows/` directory. Deployment is manual. Not a disqualifier for a hackathon, but relevant for a "production-ready" claim.

**BPF binary size is not confirmed in-repo.**
README states "294KB BPF binary" but the `.so` file is not committed (correct — it shouldn't be, but the number should be verifiable from `anchor build` output documented somewhere).

---

## 5. Demo Readiness

**Score: 6/10**

### What Works End-to-End (Browser + Phantom)

1. Landing page loads with correct copy, how-it-works cards, and on-chain proof section.
2. "Launch App" navigates to `/app`.
3. Wallet connection prompt appears for unauthenticated users.
4. Phantom connects via `WalletMultiButton`.
5. "New Dispute" opens the create form.
6. Description textarea and stake input accept values; character counter updates.
7. "Create Dispute" submits an on-chain transaction; success state shows "View on Explorer" link with real tx hash.
8. Dispute list fetches all program accounts and renders them with status badges, truncated addresses, and jury panel for deliberating disputes.
9. Clicking a dispute navigates to `/dispute/:pda` and shows status, parties, jury panel, and verdict section.
10. All Explorer links open correctly to devnet cluster.

### What Does Not Work from the Browser

1. **Join dispute** — no UI. Defendant cannot join a dispute from the app.
2. **Request jury (VRF)** — no UI. The payer must call `request_jury` via CLI with Orao's treasury account wired in.
3. **Reveal jury** — no UI. Requires CLI with the juror pool addresses and the VRF randomness PDA.
4. **Cast vote** — no UI. Jurors cannot vote from the browser.
5. **Claim stakes** — no UI. Winner cannot claim from the browser.

### Demo Workaround

The demo flow in `DEMO_FLOW.md` works around this by showing a pre-seeded dispute in a `Deliberating` or `Decided` state and demonstrating the read path (dispute list, dispute view, Explorer links, VRF evidence table). The create-dispute flow is the only live on-chain write demonstrated.

This means roughly 5 of 6 instructions are demo-only through static state or Explorer links, not through live browser interaction.

### Demo Blocking Issues

- The "View Source" link on the landing page goes to `https://github.com` (not the actual repo). If judges click it during evaluation, they reach the GitHub homepage.
- The devnet RPC rate limit could cause `fetchAllDisputes` to fail during a live demo if the network is congested.

---

## 6. Known Issues and Limitations

### Critical (would affect judging or usability)

**C1 — VRF flow not browser-accessible.**
The full dispute lifecycle requires CLI access. The hackathon submission demonstrates create + read but not the core VRF jury selection that differentiates the project. Mitigation: pre-seed a dispute in Deliberating state before the demo and use the read-path to show jury selection results.

**C2 — ARCHITECTURE.md describes a different program.**
Instruction names and state machine in ARCHITECTURE.md do not match lib.rs. If judges use ARCHITECTURE.md as a reference, they will find inconsistencies. Mitigation: delete or rewrite ARCHITECTURE.md to match the actual program.

**C3 — GitHub link on landing page is a placeholder.**
`href="https://github.com"` in Landing.tsx line 37. Fix: replace with `https://github.com/marchantdev/jury-protocol`.

### Moderate (quality/completeness issues)

**M1 — No timeout mechanism.**
Stuck disputes (defendant never joins, juror never votes) lock funds permanently. Not a demo issue, but relevant for any "real usage" claim.

**M2 — Juror pool is caller-supplied and unverified.**
`reveal_jury` accepts `juror_pool: [Pubkey; 9]` from the caller. The VRF output selects from this pool, but the pool itself is not on-chain-verified. The three selected jurors are cryptographically random given the pool, but the pool composition is trusted.

**M3 — `useProgram.ts` loses TypeScript type safety.**
`type JuryProgram = any` bypasses all Anchor-generated types. Runtime errors will be harder to debug.

**M4 — `claim_stakes` does not close the account.**
Rent (~0.003 SOL) remains locked in the dispute PDA after the dispute resolves. Minor but a production quality issue.

**M5 — No real-time updates in DisputeView.**
State displayed is a snapshot at page load. If VRF fulfillment happens while a user is on the dispute page, they will not see it without a manual refresh.

### Minor (low impact)

**N1 — Tie-breaking in `cast_vote` implicit.**
The `else` branch that sets `winner = 2` when `plaintiff_votes <= defendant_votes` should have a comment clarifying the tie-breaking rule.

**N2 — `Dispute::SIZE` is a manual constant.**
Should use `#[derive(InitSpace)]` to keep it in sync with struct changes automatically.

**N3 — Only PhantomWalletAdapter is listed.**
Backpack, Solflare, and other Solana wallets will not appear in the wallet modal. Minor, but Phantom is the expected hackathon wallet.

**N4 — Space Grotesk and JetBrains Mono are loaded via system fallback, not via a web font import.**
If the judge's machine does not have these fonts installed, the UI falls back to `system-ui`/`Consolas`. A Google Fonts or CDN import in `index.html` would guarantee the intended typography.

---

## 7. Checklist Summary

### Code Quality
- [x] State machine enforced at every instruction
- [x] Input validation present (description length, zero stake, zero VRF seed, vote range)
- [x] PDA seeds canonical and deterministic
- [x] VRF CPI correct (request_v2 + fulfilled_randomness)
- [x] Events emitted on every state transition
- [x] Error codes descriptive with messages
- [ ] Timeout/abandonment path exists
- [ ] Juror pool verification on-chain
- [ ] Account closure on claim_stakes
- [ ] Test coverage for VRF path, cast_vote, claim_stakes

### Frontend Quality
- [x] Wallet adapter wired correctly (ConnectionProvider → WalletProvider → WalletModalProvider)
- [x] Real on-chain data fetched (getProgramAccounts)
- [x] Error states and loading states handled
- [x] Explorer links correct and open to devnet
- [x] Status rendering correct for all 6 states
- [ ] Full dispute lifecycle accessible from browser (join, requestJury, revealJury, castVote, claimStakes)
- [ ] TypeScript types used (not `any`)
- [ ] Real-time polling or subscription
- [ ] "View Source" link points to actual repo

### Documentation
- [x] README covers problem, solution, architecture, instructions, VRF evidence, tech stack, project structure, local run, on-chain IDs, competitive landscape
- [x] VRF evidence with 4 verifiable transaction signatures
- [x] Demo flow script with timestamps and scenes
- [ ] ARCHITECTURE.md matches actual program
- [ ] Security assumptions documented (juror pool trust)
- [ ] Known limitations listed

### Deployment
- [x] Program deployed to devnet (tx confirmed)
- [x] Frontend live on Vercel
- [x] Program ID consistent across all files
- [x] IDL embedded in frontend
- [ ] GitHub link on landing page corrected
- [ ] Mainnet deployment (not applicable for hackathon, but note the gap)

---

*Generated 2026-04-18. All code references from local repository at `/opt/autonomous-ai/hackathons/frontier/`.*
