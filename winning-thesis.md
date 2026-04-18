# JURY — Winning Thesis

**Project:** JURY
**Round:** R14 (execution phase)
**Hackathon:** Colosseum Frontier (Solana, deadline 2026-05-11)
**One-sentence pitch:** *JURY settles on-chain disputes with verifiably random juries — no centralized arbitrator, no manipulation, just cryptographic fairness on Solana.*

---

## 1. The Problem

Digital disputes resolve through centralized arbitration. PayPal, Stripe, and marketplace platforms act as judge, jury, and executioner. The platform always wins ties, fees are opaque, and decisions are unverifiable. Web3 transactions need a dispute mechanism that matches their trust model: transparent, permissionless, and verifiable.

---

## 2. What JURY Does

JURY is a Solana program that lets any two parties open a dispute, stake SOL, and have a jury of three selected from a pool of nine through Orao VRF — a verifiable random function backed by a four-authority Byzantine quorum. The jury votes, majority wins, and the winner claims both stakes. Every step is on-chain and verifiable.

---

## 3. Why It Works (Demonstrated, Not Claimed)

### VRF-Backed Jury Selection — Proven on Devnet

4 Orao VRF requests executed on Solana devnet (2026-04-16, 10:55–11:05 UTC). All verifiable on Solana Explorer.

| Run | Transaction Signature | Slots | Wall Time | Jury |
|-----|----------------------|-------|-----------|------|
| 0 | `vQUeeQaJieekjJcgL7gQGVKhrp89v98fUoohMSkwdxFF5aQ6xGnNLySn5QfXxss6RCF9eYre1Ud9WYNFtW63dRE` | 5 | 2532ms | [7,2,5] |
| 1 | `2im1F5gtarJTXN9PopGDLJfKybNrALFLPS7XhRLHX2k3LAzc7ECnxEBakPeWHNVgNr4FTT4zk4dPtVUbAgVhqDGx` | 4 | 2727ms | [5,1,7] |
| 2 | `NT2F1br99zq46YiYidRabJFyT2h4V3Dit4NoQ3jXZLPXDpq4BEK194BQpn7TKVGka32ZwwGMkxzWbgKkmt8eDMv` | 4 | 2293ms | [8,3,5] |
| 3 | `4e3Zy9PvxuzwVCfBEovEptnmvhXrELH2MSfh6BMTnSKDxHbTRqjTMn2wKDNsBWoCn7wwvemyW1JHh3mE8H4Lr5wA` | 5 | 2515ms | [7,5,1] |

**Mean fulfillment: 4.5 slots (~2.5 seconds).** This speed matters because it enables **embedded dispute resolution** — jury selection can happen as a synchronous step in a marketplace checkout or escrow release flow, rather than being a separate multi-minute process that users navigate to. The speed transforms dispute resolution from "formal arbitration system" into "inline UX feature."

### Anchor Program — Compiled (294KB BPF binary)

6-instruction state machine built with Anchor 0.32.1 and `orao-solana-vrf` CPI:

1. **create_dispute** — Plaintiff stakes SOL, creates dispute PDA
2. **join_dispute** — Defendant matches stake
3. **request_jury** — Triggers Orao VRF CPI (`RequestV2`)
4. **reveal_jury** — Reads fulfilled randomness, selects 3 of 9 jurors
5. **cast_vote** — Selected jurors vote (1=plaintiff, 2=defendant)
6. **claim_stakes** — Winner withdraws both stakes from PDA escrow

State machine: `Open → AwaitingJury → JuryRequested → Deliberating → Decided → Claimed`

Each transition is gated by status checks and signer verification.

### Frontend — Built (React + Vite + Tailwind + Solana Wallet Adapter)

- Landing page explaining the dispute resolution flow
- Dispute creation form (description + SOL stake)
- Dispute list with status badges and jury composition
- Wallet connection via Phantom adapter
- On-chain proof section with program ID and VRF details

---

## Juror Pool Design

The "pool of nine" is not a set of random wallets. Jurors are **staked participants** with skin in the game:

- **Juror registration:** Wallets stake SOL to join the juror pool. Minimum stake ensures economic commitment.
- **Per-dispute pools:** Disputes can use the global pool (open disputes) or curated lists (e.g., wallets holding a specific DAO's governance token — enabling community-specific arbitration).
- **Selection mechanism:** `reveal_jury` takes Orao VRF's 64-byte random output and derives 3 unique indices via `randomness[i*8..i*8+8] mod pool_size`. Deterministic given the VRF output — anyone can verify.
- **Incentives:** Jurors earn 50% of the protocol fee on resolved disputes. Jurors who fail to vote within the deliberation window lose their stake (Schelling-point incentive).
- **Why SOL, not a governance token:** Kleros requires purchasing PNK ($3M+ market cap, concentrated ownership) to participate. JURY uses SOL — every Solana user already holds it. This expands the juror pool from ~5K PNK holders to millions of SOL wallets.

The devnet implementation uses 9 pre-seeded addresses for demo purposes. Production deployment would use a dynamic juror registry PDA with registration and staking instructions.

---

## 4. Manipulation Resistance (Honest Framing)

Orao VRF uses a 4-of-4 Byzantine quorum. The client provides a 32-byte seed bound to a one-shot PDA — no retry on the same seed. An observer cannot predict the randomness before aggregation.

**Honest caveat:** The authority set is a known committee, not a fully trustless oracle. JURY provides VRF-backed randomness with a public authority set — stronger than centralized arbitration, weaker than theoretical trustless randomness. This is a deliberate tradeoff: Orao's 4-authority quorum gives us sub-3-second jury formation with production-grade security, while a fully decentralized oracle would add minutes of latency and significantly more complexity. For the dispute sizes we're targeting ($5-$500), this security level is appropriate.

---

## 5. Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Frontend    │────▶│  JURY Program    │────▶│  Orao VRF    │
│  React/Vite  │     │  Anchor 0.32.1   │     │  4-auth BFT  │
│  Wallet UI   │     │  6 instructions  │     │  ~2.5s fill  │
└─────────────┘     └──────────────────┘     └──────────────┘
                           │
                    ┌──────┴──────┐
                    │ Dispute PDA │
                    │ Stakes, Jury│
                    │ Votes, FSM  │
                    └─────────────┘
```

---

## 6. Technical Artifacts

| Artifact | Status |
|----------|--------|
| VRF spike (4 devnet tx sigs) | DONE — verified on Solana Explorer |
| Anchor program (lib.rs, 479 lines) | DONE — compiles to 294KB .so |
| IDL + TypeScript types | DONE — auto-generated by Anchor |
| Frontend (React app) | DONE — builds successfully |
| Devnet deployment | DONE — `4hFoUmi8NQnMS8icdTZWnP1wzYrDTpph4qTUjGCsjv15` |
| Live demo URL | DONE — https://jury-app-eight.vercel.app |
| GitHub repo | DONE — https://github.com/marchantdev/jury-protocol |

### On-Chain IDs
- **Program:** `4hFoUmi8NQnMS8icdTZWnP1wzYrDTpph4qTUjGCsjv15`
- **Orao VRF:** `VRFzZoJdhFWL8rkvu87LpKM3RbcVezpMEc6X5GVDr7y`
- **Signer:** `GpXHXs5KfzfXbNKcMLNbAMsJsgPsBE7y5GtwVoiuxYvH`
- **Network:** Solana Devnet

---

## 7. Competitive Landscape

| Feature | Kleros (ETH) | Aragon Court (ETH) | JURY (Solana) |
|---------|-------------|-------------------|---------------|
| Randomness | Block hash | Commit-reveal | Orao VRF (BFT quorum) |
| Cost/dispute | $50-200 gas | $30-100 gas | ~$0.01 |
| Jury speed | Minutes | Minutes | ~2.5 seconds |
| Staking | PNK token | ANT token | SOL (native) |

---

## 8. Market Opportunity & Business Case

### Addressable Market
- **Solana DeFi TVL:** $8B+ with zero dispute infrastructure
- **Ethereum comp:** Kleros has resolved $50M+ in dispute value since 2019
- **P2P commerce growth:** Tensor ($200M+ NFT volume), SOL Pay merchants, freelance escrow
- **Why micro-disputes matter:** Kleros' $50-200 gas floor kills disputes under $500. JURY's ~$0.01 cost makes $5-50 micro-disputes viable — a market segment that doesn't exist yet.

### Revenue Model
- 2-5% protocol fee on resolved stake amounts
- At 1,000 disputes/month, $50 avg stake = $12K-30K/year
- At scale (10K disputes/month): $120K-300K/year
- No governance token — revenue accrues to protocol, not speculation

### Beachhead Users
1. **Solana NFT marketplaces** — dispute resolution as a service (Tensor, Magic Eden API integration)
2. **Freelance escrow dApps** — plug-in arbitration for SOL-denominated gig work
3. **P2P trading** — OTC desk disputes where both parties want neutral resolution

### What We'd Build Next
1. Juror reputation system — on-chain voting track record
2. Multi-round appeals — escalation with larger juries (5-of-15, 7-of-21)
3. Evidence submission — Arweave-linked dispute evidence
4. Mainnet deployment (same Orao VRF program ID)
5. SDK for integrating JURY into any Solana dApp
6. Juror incentive pool — SOL rewards for participating in dispute resolution
