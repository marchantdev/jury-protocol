# JURY — On-Chain Dispute Resolution

Jury settles disputes with verifiably random juries on Solana. No centralized arbitrator. No manipulation. Cryptographic fairness.

**Live demo:** [jury-app-eight.vercel.app](https://jury-app-eight.vercel.app)
**Program:** [`4hFoUmi8NQnMS8icdTZWnP1wzYrDTpph4qTUjGCsjv15`](https://explorer.solana.com/address/4hFoUmi8NQnMS8icdTZWnP1wzYrDTpph4qTUjGCsjv15?cluster=devnet) (Solana Devnet)

---

## The Problem

Solana has $8B+ in DeFi TVL but zero native dispute resolution. When an NFT trade goes wrong, a freelancer doesn't deliver, or an escrow counterparty disagrees — there's no on-chain recourse. Users either eat the loss or escalate to centralized platforms that undermine the trust model they came to crypto for.

Ethereum has Kleros ($50-200/dispute, minutes to resolve), but Solana has nothing. That's not a feature gap — it's missing infrastructure.

## Why Now

Three things converged in 2025-2026:
1. **Orao VRF** matured on Solana — 4-authority BFT randomness with ~2.5s fulfillment, enabling instant jury selection
2. **Solana commerce is growing** — SOL Pay, Tensor marketplace, Drip Haus, Solana Mobile. More transactions = more disputes
3. **Kleros/Aragon are Ethereum-only** and cost $50-200/dispute in gas. Solana's ~$0.01 tx cost makes micro-disputes viable for the first time

## How It Works

1. **File a Dispute** — Plaintiff creates a dispute and stakes SOL. Defendant joins and matches the stake. Funds are locked in the dispute PDA.

2. **VRF Jury Selection** — Orao VRF generates verifiable randomness on-chain. Three jurors are selected from a pool of nine. No one can predict or manipulate who gets chosen.

3. **Deliberation** — Selected jurors review the dispute and cast their votes on-chain. Majority wins.

4. **Resolution** — The verdict is final and on-chain. The winner claims both stakes. Every step is verifiable on Solana Explorer.

## Architecture

```
Frontend (React/Vite)  ──►  JURY Program (Anchor 0.32.1)  ──►  Orao VRF
   Wallet adapter              6 instructions                    4-auth BFT
   3 routes                    Dispute PDA escrow                ~2.5s fulfill
```

### Anchor Program — 6 Instructions

| Instruction | Description |
|-------------|-------------|
| `create_dispute` | Plaintiff stakes SOL, creates dispute PDA |
| `join_dispute` | Defendant matches stake |
| `request_jury` | Triggers Orao VRF CPI for randomness |
| `reveal_jury` | Reads VRF output, selects 3-of-9 jurors |
| `cast_vote` | Juror votes (plaintiff or defendant) |
| `claim_stakes` | Winner withdraws both stakes |

**State machine:** `Open → AwaitingJury → JuryRequested → Deliberating → Decided → Claimed`

### VRF Evidence

4 real Orao VRF requests on Solana devnet, all verified:

| Run | Slots | Wall Time | Jury Selected |
|-----|-------|-----------|---------------|
| 0 | 5 | 2.5s | [7, 2, 5] |
| 1 | 4 | 2.7s | [5, 1, 7] |
| 2 | 4 | 2.3s | [8, 3, 5] |
| 3 | 5 | 2.5s | [7, 5, 1] |

Mean fulfillment: 4.5 slots (~2.5 seconds). Transaction signatures in [`spike-result.md`](spike-result.md).

## Tech Stack

- **Anchor 0.32.1** — Solana program framework
- **Orao VRF** — Verifiable random function (4-authority Byzantine quorum)
- **React + Vite + Tailwind** — Frontend
- **Solana Wallet Adapter** — Phantom wallet integration
- **TypeScript** — End-to-end type safety

## Project Structure

```
jury-program/           # Anchor workspace
  programs/jury-program/
    src/lib.rs          # 479-line program (6 instructions, state machine)
  tests/
    jury-program.ts     # 5 integration tests (all pass)
  target/
    idl/jury_program.json
    deploy/jury_program.so  # 294KB BPF binary

jury-app/               # Frontend
  src/
    App.tsx             # Router + wallet providers
    pages/Landing.tsx   # Landing page
    pages/DisputeApp.tsx # Dispute list + creation
    pages/DisputeView.tsx # Individual dispute detail
    lib/useProgram.ts   # Anchor client hook
    lib/program.ts      # Program constants + helpers
    lib/idl.json        # Program IDL
```

## Running Locally

### Program (requires Solana CLI + Anchor)

```bash
cd jury-program
anchor build
anchor test  # 5/5 tests pass
anchor deploy --provider.cluster devnet
```

### Frontend

```bash
cd jury-app
npm install
npm run dev   # http://localhost:5173
```

## On-Chain IDs

| Resource | Address |
|----------|---------|
| JURY Program | `4hFoUmi8NQnMS8icdTZWnP1wzYrDTpph4qTUjGCsjv15` |
| Orao VRF | `VRFzZoJdhFWL8rkvu87LpKM3RbcVezpMEc6X5GVDr7y` |
| Deploy Tx | [`33swTRy...sDFm`](https://explorer.solana.com/tx/33swTRyk9qucDa9xpAaGsn88cqWMbpXJwQ9AQ4UXbw1S9Ma4kkceLH7bVyXkgvytDwQRepi3nxKEH5PsntXtsDFm?cluster=devnet) |

## Juror Pool Design

### Current Implementation (Devnet)

The devnet demo uses a pre-seeded pool of 9 juror addresses. When a dispute reaches the jury selection phase:

1. **VRF Request:** `request_jury` triggers an Orao VRF CPI, requesting 64 bytes of verifiable randomness.
2. **Jury Selection:** `reveal_jury` reads the fulfilled VRF output and derives 3 unique juror indices via `randomness[i*8..i*8+8] mod pool_size` with deduplication.
3. **Voting:** Selected jurors call `cast_vote` (1=plaintiff, 2=defendant). After all 3 votes, majority wins automatically.
4. **Payout:** Winner calls `claim_stakes` to withdraw both stakes from the dispute PDA.

This is fully implemented and tested — 5/5 integration tests pass, and 4 real VRF jury selections have been completed on Solana devnet.

### Production Roadmap (Post-Hackathon)

- **Dynamic juror registry PDA:** Wallets stake SOL to register as jurors. Minimum stake ensures commitment.
- **Slash conditions:** Jurors who fail to vote within the deliberation window forfeit their stake.
- **Juror fees:** 50% of protocol fee split among voting jurors.
- **Domain-specific pools:** Curated juror lists for specific dispute types (NFT, DeFi, freelance).

**Why SOL-native staking matters:** Kleros requires purchasing PNK tokens (~5K holders) to participate as a juror. JURY uses SOL — the native asset every Solana user already holds. This expands the potential juror pool from thousands to millions.

## What Makes JURY Different

JURY is **not** "Kleros on Solana." The innovation is **unlocking a market that doesn't exist yet:**

1. **Micro-disputes are a new category** — At $50-200/dispute, Kleros can only serve disputes above ~$500 (gas must be < 30% of stake value for economic rationality). JURY's ~$0.01 cost makes $5-50 disputes viable. This is not the same market served cheaper — it's a market that currently has zero solutions. Every NFT marketplace scam under $500, every freelance non-delivery under $200, every P2P trade disagreement under $100 — all of these currently result in "eat the loss."
2. **VRF jury selection** — Orao VRF provides cryptographically verifiable randomness backed by a 4-authority Byzantine quorum. No commit-reveal (Kleros), no block hash manipulation (naive approaches).
3. **SOL-native staking** — No governance token. Jurors stake SOL directly. No "buy PNK/ANT to participate" barrier.
4. **2.5-second jury formation** — VRF fulfills in ~4.5 slots. This makes dispute resolution embeddable as a real-time UX feature, not a separate arbitration process.

| Feature | Kleros (ETH) | Aragon Court (ETH) | JURY (Solana) |
|---------|-------------|-------------------|---------------|
| Randomness | Block hash | Commit-reveal | Orao VRF (BFT quorum) |
| Cost/dispute | $50-200 gas | $30-100 gas | ~$0.01 |
| Jury speed | Minutes | Minutes | ~2.5 seconds |
| Staking | PNK token | ANT token | SOL (native) |
| Micro-disputes | Not viable (gas) | Not viable (gas) | Yes ($5+ stakes) |

## Market Opportunity & Validation

### Evidence of Demand (Not Theoretical)

1. **Tensor NFT disputes:** Tensor processed $200M+ in NFT volume in 2025. Their Discord #support channel shows 50-100 dispute-related messages per week (counterfeit collections, metadata misrepresentation, failed deliveries). Current resolution: manual admin intervention with 3-5 day response time. ([Tensor Discord](https://discord.gg/tensor))

2. **Superteam Earn bounty disputes:** Superteam Earn has paid $2M+ in Solana bounties. Submitters regularly dispute "not selected" decisions in Telegram/Discord with no formal recourse. Current resolution: informal appeal to Superteam admins. ([earn.superteam.fun](https://earn.superteam.fun))

3. **Mango DAO grant disputes:** Mango DAO's contributor grants program ($500K+ disbursed) has documented cases of deliverable disputes in governance proposals. Current resolution: DAO vote, which is slow and politically biased. ([Realms governance](https://realms.today))

4. **Kleros validation:** Kleros has processed $50M+ in dispute value on Ethereum since 2019, proving demand for on-chain arbitration exists. The gap: Kleros' $50-200 gas floor excludes 90%+ of potential disputes by value.

### Market Sizing

- **Solana DeFi TVL:** $8B+ with zero native dispute resolution
- **Solana NFT monthly volume:** $100M+ (Tensor + Magic Eden)
- **Conservative TAM:** If 0.1% of Solana transaction value generates disputes, that's $8M/year in disputed value at current TVL
- **Revenue at scale:** 1-2% protocol fee on resolved stakes. 1,000 disputes/month at $50 avg = $6K-12K/year. 10,000 disputes/month = $60K-120K/year

## Roadmap

### Shipped (this hackathon)
- Anchor program with 6-instruction dispute state machine
- Orao VRF jury selection (4 verified devnet transactions)
- React frontend with wallet connection and dispute management
- Devnet deployment + Vercel-hosted demo
- 5/5 integration tests passing

### Next (post-hackathon)
1. **Juror staking & reputation** — On-chain voting track record weighted by accuracy. Good jurors earn more cases.
2. **Evidence submission** — Arweave-linked evidence NFTs attached to disputes. Both parties present their case with verifiable documents.
3. **Multi-round appeals** — Escalation to larger juries (5-of-15, then 7-of-21) with increasing stake requirements.
4. **Timeout mechanisms** — Auto-resolution if parties or jurors fail to act within configurable windows.
5. **SDK & integrations** — Drop-in dispute resolution for any Solana dApp. Tensor, Magic Eden, freelance escrow protocols.
6. **Mainnet deployment** — Same Orao VRF program ID, production-grade security audit.

### Vision
JURY is the first dispute resolution primitive on Solana — infrastructure that every marketplace, escrow, and P2P protocol needs but nobody has built. At ~$0.01/dispute, we unlock micro-arbitration ($5-50 stakes) that's economically impossible on Ethereum. The goal is to become the default resolution layer that Solana commerce plugs into.

## Video Deliverables

- **Technical demo:** 2:35 walkthrough of architecture, VRF evidence, and live frontend ([tech-demo-v2.mp4](tech-demo-v2.mp4))
- **Pitch video:** Planned — 3-minute pitch covering problem, solution, live demo, market opportunity (deadline: May 11)

## GitHub

Source code: [github.com/marchantdev/jury-protocol](https://github.com/marchantdev/jury-protocol)

## License

MIT
