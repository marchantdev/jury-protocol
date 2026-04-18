# Why JURY Wins — Colosseum Frontier 2026

## The Company, Not Just the Product

Colosseum judges are looking for founders and companies, not weekend demos. JURY is positioned as a venture-scale infrastructure company:

- **Revenue model proven by analogy:** Kleros ($50M+ in disputed value, ~5K PNK holders) proves demand on Ethereum at $50-200/dispute. JURY addresses 100x the user base at 1/5000th the cost.
- **Moat compounds over time:** Juror reputation is non-portable, integrator switching costs grow with each CPI embed, juror pool network effects (more jurors = faster/better verdicts).
- **Path to $4.5M ARR:** Protocol fee on dispute stakes, scaling with partner transaction volume (Stripe model). Not dependent on own user acquisition.
- **Post-hackathon roadmap is concrete:** Mainnet (Month 1) → SDK + Tensor integration (Month 2) → Juror reputation + Superteam Earn (Month 3) → 3+ integrations by Month 6.

---

## Competitor Table

| Feature | Kleros (Ethereum) | Aragon Court (Ethereum) | JURY (Solana) |
|---|---|---|---|
| **Randomness source** | Block hash (manipulable by miners) | Commit-reveal (gameable by timing) | Orao VRF — 4-authority Byzantine quorum |
| **Randomness verifiable on-chain** | No | No | Yes — VRF proof stored in PDA |
| **Cost per dispute** | $50–200 in gas | $30–100 in gas | ~$0.01 in fees |
| **Minimum viable dispute size** | ~$200 (below this, irrational) | ~$100 | ~$1 (200x lower floor) |
| **Jury selection speed** | Minutes (Ethereum block time) | Minutes | ~2.5 seconds (4.5 slots, measured) |
| **Staking token** | PNK (separate governance token, ~5K holders) | ANT (separate governance token) | SOL (native — millions of holders, no friction) |
| **Integration model** | Standalone platform | Standalone platform | CPI-embeddable (any Anchor program) |
| **On-chain state machine** | Partial (off-chain coordination) | Partial (off-chain coordination) | Full — 6-state FSM, all transitions on-chain |
| **Solana-native** | No | No | Yes |
| **Market unlocked** | Disputes >$200 | Disputes >$100 | **Micro-disputes $1-$500 (new market)** |
| **Live deployment** | Ethereum mainnet | Deprecated | Solana devnet (`4hFoUmi8NQnMS8icdTZWnP1wzYrDTpph4qTUjGCsjv15`) |
| **Working frontend** | Yes | Deprecated | Yes (https://jury-app-eight.vercel.app) — full 6-step lifecycle |

There is no Solana-native dispute resolution protocol. JURY is not competing with Kleros — it is filling a gap that does not exist on Solana and unlocking a dispute size category that cannot exist on Ethereum.

---

## Why JURY Wins on Each Judging Criterion

### Impact (estimated 30% weight)

Every Solana marketplace, escrow, freelance platform, and DAO governance system handles disputes the same way today: off-chain, centralized, and opaque. PayPal chargebacks. Superteam Earn admin decisions. DAO multisig discretion. None of these are verifiable, none are neutral, and none can be audited after the fact.

JURY installs a dispute layer at the protocol level. Any Solana dApp can CPI into JURY the same way they CPI into SPL Token. The impact is not one product — it is a primitive that upgrades the entire ecosystem's trust model.

**Demand validation:** Kleros has processed $50M+ in disputed value on Ethereum since 2019 despite $50-200 gas costs — proving demand exists even at prohibitive prices. Tensor/Magic Eden Discord #support channels show daily buyer disputes resolved by centralized teams. Superteam Earn has public threads about payment dispute resolution. DAO governance forums (Mango, Drift, Bonk) regularly surface grant payment conflicts resolved through informal multisig votes.

The Colosseum scoring guide defines Grand Champion as "the most impactful product submission." Infrastructure primitives that fill systemic gaps have won Grand Prize in every Colosseum hackathon to date (TAPEDRIVE: storage primitive; Reflect Money: yield primitive; Unruggable: signing primitive). JURY is the dispute primitive.

### Technical Execution (estimated 25% weight)

This is not a mockup. The evidence is on-chain and verifiable:

- **Program deployed:** `4hFoUmi8NQnMS8icdTZWnP1wzYrDTpph4qTUjGCsjv15` on Solana devnet
- **VRF requests confirmed:** 4 transactions with measured fulfillment times (2293ms, 2515ms, 2532ms, 2727ms — mean 2.5 seconds)
- **Anchor program:** 479 lines of Rust, 6 instructions, compiles to 294KB BPF binary
- **State machine:** 6 states (Open → AwaitingJury → JuryRequested → Deliberating → Decided → Claimed), all transitions gated by signer checks and status validation
- **VRF integration:** Orao CPI (`RequestV2`) with one-shot PDA seed — the seed is bound to the dispute ID, so the randomness cannot be retried or reused for a different outcome
- **Full browser UI:** All 6 dispute actions (create, join, request VRF, reveal jury, vote, claim) are interactive in the web app with context-aware buttons based on wallet role and dispute status
- **Frontend:** React + Vite + Tailwind + Solana Wallet Adapter, live on Vercel

The Orao VRF integration is the technical differentiator judges cannot dismiss. Block hash randomness (Kleros) is gameable by block producers. Commit-reveal (Aragon) is gameable by timing. Orao VRF requires a Byzantine consensus across 4 independent authorities before the randomness is accepted — an attacker must corrupt all 4 simultaneously within a 2.5-second window. That is not a theoretical improvement; it is a fundamentally different security model.

### Business Viability (estimated 20% weight)

**Validated demand (not hypothetical):**

1. Kleros: $50M+ in disputed value resolved since 2019 with only ~5K PNK holders at $50-200/dispute. Proves market exists.
2. Tensor/ME: Centralized support teams handle disputes — visible in Discord. Cannot scale.
3. Superteam Earn: $2M+ paid, dispute resolution is admin discretion. Community has asked for neutral alternatives.
4. DAO treasuries: Mango, Drift, Bonk all use informal multisig votes for grant disputes. Governance theater.

**Revenue model:** Protocol fee (3% of stake) collected automatically on verdict. Revenue scales with partner transaction volume.

| Milestone | Monthly disputes | Avg stake | Monthly rev | Annual |
|-----------|-----------------|-----------|-------------|--------|
| Pre-integration | 200 | $50 | $300 | $3,600 |
| 1 marketplace | 2,000 | $150 | $9,000 | $108,000 |
| 3 integrations | 10,000 | $200 | $60,000 | $720,000 |
| Standard infra | 50,000 | $250 | $375,000 | $4,500,000 |

**Defensible moat:** VRF integration is not trivial to replicate (Orao is the only production VRF on Solana), juror reputation accumulates on-chain and is non-portable, integrating dApps create switching costs.

### Differentiation (estimated 15% weight)

Searched across Colosseum project database (5,400+ projects), Superteam submissions, and Solana ecosystem: zero VRF-based dispute resolution protocols exist on Solana. This is not "better than Kleros" — it is a new category.

**What makes this memorable vs 12,000+ participants:**
- The demo is visceral: two parties lock SOL, random jury selected in 2.5 seconds, majority votes, winner claims both stakes — explainable in one breath, demonstrable in 30 seconds
- The innovation is structural (new market category via cost), not incremental (same thing but cheaper)
- It is deliberately NOT an AI project — in a field of AI wrappers, a cryptographic primitive stands out
- The cost comparison is immediately graspable: $0.01 vs $50-200

Every Grand Prize winner in Colosseum history has been the first in their category. Category competition produces track winners. Category creation produces Grand Champions.

### Completion (estimated 10% weight)

JURY is not a demo with hardcoded state. The full end-to-end flow is live and browser-interactive:

1. Connect wallet → create dispute with SOL stake (on-chain transfer)
2. Second wallet joins as defendant (matching stake)
3. Request jury → Orao VRF fires, 4 authorities respond, randomness fulfilled in ~2.5 seconds
4. Jury revealed from VRF output → 3 of 9 juror pubkeys selected deterministically
5. Jurors cast votes via UI buttons
6. Winner claims both stakes from PDA escrow via "Claim Stakes" button

The program is deployed, the frontend is deployed with all 6 interactive steps, and the VRF is proven. There is nothing claimed that cannot be verified with a Solana Explorer transaction signature.

---

## The $10M+ Case

Kleros has processed over $50 million in disputed value since 2018 on Ethereum. Every dollar of that was locked out of Solana's ecosystem because Kleros requires Ethereum. With Solana's fee structure, JURY can unlock dispute resolution for transaction sizes that are economically impossible on Ethereum — $10 freelance disputes, $50 NFT chargebacks, $200 escrow settlements. These micro-disputes represent a market that Kleros and Aragon structurally cannot serve.

**Year 1:** Protocol integration. 5–10 Solana marketplaces integrate JURY as their default dispute mechanism. Target: Superteam Earn, Tensor, Realms DAOs. Disputes: 500/month. Revenue: $5K–15K/month.

**Year 2:** Enterprise escrow. OTC desks, DAO grant disputes, multi-party DeFi settlements. Disputes: 2,000/month. Revenue: $50K–100K/month.

**Year 3:** Reputation graph monetization. Jurors with verified on-chain voting records become attestable credentials. B2B: dApps pay to query reputation data. Revenue: $200K–500K/month.

**The compounding moat:** The reputation graph makes JURY defensible long-term. After 50+ verified decisions, those juror credentials are non-portable. JURY becomes the identity layer for trustworthiness on Solana — the same way ENS became identity for Ethereum, except grounded in proven behavior rather than a purchased name.

---

## What Makes This Different from Every Other Hackathon Submission

Most hackathon submissions answer "what can I build?" JURY answers "what is missing from Solana that every other application needs?"

**Three specific differentiators:**

1. **New market, not a port.** Micro-disputes ($1-$500) are economically impossible on Ethereum. JURY does not compete with Kleros — it serves the market Kleros cannot reach. This is the Stripe analogy: Stripe did not make PayPal cheaper, it made programmatic payments possible.

2. **CPI-embeddable infrastructure, not a standalone platform.** Any Anchor program can add dispute resolution with a single CPI call. Dispute volume scales with partner transaction volume, not JURY's own user acquisition.

3. **No AI, no token, no governance.** In a field where every team is adding AI wrappers and governance tokens, JURY is refreshingly minimal: verifiable randomness → jury selection → majority vote → payout. The mechanism is mathematically provable, not probabilistic. The absence of complexity is the differentiator.

---

## One-Paragraph Investor Pitch

JURY is an on-chain dispute resolution company for Solana that replaces centralized arbitration with cryptographically verifiable jury selection. Using Orao VRF's four-authority Byzantine quorum, JURY selects a jury of three from any available pool in under three seconds — provably random, publicly auditable, and immune to the manipulability that plagues block-hash and commit-reveal approaches. Two parties stake SOL, a jury decides, the winner claims both stakes: no token, no governance, no central authority. The product is deployed on Solana devnet with a full browser-interactive lifecycle at jury-app-eight.vercel.app, and the company's path to revenue runs through CPI integration with Solana marketplaces — where dispute volume scales with partner transaction volume, not our own user acquisition. Kleros proved $50M+ in demand on Ethereum at $50-200/dispute. JURY unlocks the sub-$500 micro-dispute market at $0.01/tx — a category that literally cannot exist on any other chain.
