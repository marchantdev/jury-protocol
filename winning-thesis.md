# JURY — Winning Thesis

**Project:** JURY
**Hackathon:** Colosseum Frontier (Solana, deadline 2026-05-11)
**One-sentence pitch:** *JURY settles on-chain disputes with verifiably random juries — no centralized arbitrator, no manipulation, just cryptographic fairness on Solana.*

---

## 1. The Problem

Solana processes $200M+ in NFT volume monthly (Tensor), $8B+ DeFi TVL, and growing P2P commerce via SOL Pay — but has zero native dispute resolution. When an NFT trade goes wrong, a freelancer doesn't deliver, or an escrow counterparty disagrees, users eat the loss. There is no on-chain recourse.

Ethereum has Kleros ($50-200/dispute), but Kleros' gas costs make disputes under $500 economically irrational. The entire micro-dispute category — $5-$50 disagreements in P2P commerce — cannot exist on Ethereum.

## 2. What JURY Does

JURY is a Solana program that lets any two parties open a dispute, stake SOL, and have a jury of three selected from a pool through Orao VRF — a verifiable random function backed by a four-authority Byzantine quorum. The jury votes, majority wins, and the winner claims both stakes. Every step is on-chain and verifiable.

**The full dispute lifecycle is implemented and deployed on devnet:**
1. Plaintiff creates dispute, stakes SOL → `create_dispute`
2. Defendant joins, matches stake → `join_dispute`
3. VRF randomness requested → `request_jury` (Orao CPI)
4. VRF output read, 3 jurors selected → `reveal_jury`
5. Jurors vote (plaintiff or defendant) → `cast_vote`
6. Winner withdraws both stakes → `claim_stakes`

State machine: `Open → AwaitingJury → JuryRequested → Deliberating → Decided → Claimed`

## 3. Why This Is NOT "Just Kleros on Solana"

| Feature | Kleros (ETH) | JURY (Solana) | Why It Matters |
|---------|-------------|---------------|----------------|
| Randomness | Block hash (validator-predictable) | Orao VRF (4-auth BFT quorum) | Cryptographically verifiable, not gameable |
| Cost/dispute | $50-200 gas | ~$0.01 | Enables micro-disputes ($5-50) |
| Jury speed | Minutes to hours | ~2.5 seconds | Instant jury assignment |
| Staking | PNK token (~5K holders) | SOL (native, millions of holders) | No proprietary token purchase |
| Integration | Standalone platform | CPI-embeddable | Any Anchor program can add disputes |

**The structural innovation is micro-disputes.** Kleros cannot economically resolve a $20 dispute because gas alone costs $50+. JURY at $0.01/tx makes this viable. This is a new market, not a port of an existing one.

## 4. Market Opportunity

**JURY is trust infrastructure for Solana commerce — not a standalone dispute app.**

Every marketplace, escrow, and P2P protocol on Solana needs a neutral resolution layer. Today none exists. JURY fills this gap as embeddable infrastructure (CPI call), not a platform users visit.

**The addressable market is every transaction where two parties need recourse:**

- **NFT marketplaces:** Tensor + Magic Eden process $500M+/month combined. Buyer disputes (counterfeit, not-as-described, failed delivery) are currently handled by centralized support teams — a bottleneck that doesn't scale. JURY replaces this with protocol-level resolution.
- **Freelance & bounty platforms:** Superteam Earn ($2M+ paid), Solana bounties, and the growing P2P service economy. "Did you deliver what was agreed?" is the #1 dispute category, and currently resolved by platform admins or not at all.
- **DeFi escrow:** OTC desks, conditional payments, milestone-based vesting. Any smart contract that holds funds pending a condition can embed JURY as the arbiter when parties disagree.
- **Kleros validation:** Kleros has resolved $50M+ in dispute value on Ethereum since 2019 with $50-200 gas costs. This proves demand. JURY at $0.01/tx unlocks the entire sub-$500 dispute category that Kleros can't serve.

**Revenue model:** 2-5% protocol fee on dispute stakes, paid automatically on verdict.

| Scenario | Disputes/month | Avg stake | Fee | Annual revenue |
|----------|---------------|-----------|-----|---------------|
| Launch (6 months) | 200 | $50 | 3% | $3,600 |
| Year 1 (1 marketplace integration) | 2,000 | $150 | 3% | $108,000 |
| Year 2 (3 integrations + SDK) | 10,000 | $200 | 3% | $720,000 |
| At scale (standard Solana infra) | 50,000 | $250 | 3% | $4,500,000 |

The inflection point is the first marketplace integration. When Tensor or Magic Eden embeds JURY, every NFT trade gets a "Dispute" button — dispute volume scales with transaction volume, not with JURY's own user acquisition. This is the Stripe model: invisible infrastructure that earns on usage.

**Near-term revenue (months 1-6):** Solana Foundation infrastructure grant ($25K-$50K) + Superteam ecosystem grant ($5K-$10K). JURY qualifies as public goods tooling. These grants fund mainnet deployment and SDK development without requiring organic dispute volume.

**Go-to-market:** CPI integration with existing Solana marketplaces. Any Anchor program can embed dispute resolution with a single CPI call — no standalone platform needed. First target: Tensor partnership for NFT trade disputes.

## 5. Juror Model

**Devnet Demo (deployed, working):**
- Pool of 9 pre-registered juror addresses (simulates a real juror registry)
- `reveal_jury` takes Orao VRF's 64-byte random output, derives 3 unique indices via modular arithmetic — **provably unbiased selection**
- Selected jurors vote via `cast_vote` (one vote per juror, majority wins)
- Winner claims both plaintiff and defendant stakes — the entire flow works end-to-end on-chain

**Production Juror Economics (designed, not yet deployed):**

The juror incentive structure follows established mechanism design (Schelling point coordination, proven by Kleros since 2019):

| Mechanism | How It Works | Why It Works |
|-----------|-------------|-------------|
| **Staking to register** | Jurors stake SOL to join the registry PDA | Skin-in-the-game prevents spam jurors |
| **Slash for no-vote** | Jurors who don't vote within 24h forfeit stake | Ensures timely resolution |
| **Juror fee** | 50% of protocol fee split among voting jurors | Aligns incentives — jurors earn by participating |
| **Domain pools** | Jurors self-select into categories (NFT, DeFi, services) | Better-informed verdicts |

**Why 9 pre-seeded jurors is the right scope for a hackathon:** The VRF-based random selection and on-chain voting are the hard technical problems. The juror registry is standard PDA accounting — adding it doesn't demonstrate new capability, it just adds boilerplate. We built the mechanism that matters and proved it works.

## 6. Technical Evidence (Demonstrated, Not Claimed)

**VRF Jury Selection — 4 real devnet transactions (2026-04-16):**

| Run | Slots | Wall Time | Jury Selected | Tx Signature |
|-----|-------|-----------|---------------|--------------|
| 0 | 5 | 2.5s | [7, 2, 5] | Verifiable on Explorer |
| 1 | 4 | 2.7s | [5, 1, 7] | Verifiable on Explorer |
| 2 | 4 | 2.3s | [8, 3, 5] | Verifiable on Explorer |
| 3 | 5 | 2.5s | [7, 5, 1] | Verifiable on Explorer |

Mean fulfillment: 4.5 slots (~2.5 seconds). All transaction signatures in spike-result.md.

**Anchor Program:** 6-instruction state machine, 479 LOC, 294KB BPF binary.
**Integration Tests:** 5/5 passing (create, join, request jury, vote, claim).
**Frontend:** Full interactive lifecycle — create dispute, join as defendant, request VRF jury, reveal jury, cast votes, claim stakes. Context-aware action buttons appear based on dispute status and connected wallet role (plaintiff, defendant, juror, winner).

## 7. Deliverables

| Artifact | Status | Evidence |
|----------|--------|----------|
| Anchor program (lib.rs, 479 LOC) | DEPLOYED to devnet | Program ID: `4hFoUmi8NQnMS8icdTZWnP1wzYrDTpph4qTUjGCsjv15` |
| Frontend (React + Vite + Tailwind) | DEPLOYED | https://jury-app-eight.vercel.app — full dispute lifecycle UI |
| Tech demo video (2:35) | DONE | ElevenLabs voiceover, 7 scenes |
| Integration tests (5/5) | PASSING | jury-program.ts |
| GitHub repo | DONE | github.com/marchantdev/jury-protocol |
| VRF spike evidence | PROVEN | 4 devnet tx sigs, mean 2.5s |

**On-Chain:** Program `4hFoUmi8NQnMS8icdTZWnP1wzYrDTpph4qTUjGCsjv15` | Orao VRF `VRFzZoJdhFWL8rkvu87LpKM3RbcVezpMEc6X5GVDr7y` | Solana Devnet
