# Why JURY Wins — Colosseum Frontier 2026

## Competitor Table

| Feature | Kleros (Ethereum) | Aragon Court (Ethereum) | JURY (Solana) |
|---|---|---|---|
| **Randomness source** | Block hash (manipulable by miners) | Commit-reveal (gameable by timing) | Orao VRF — 4-authority Byzantine quorum |
| **Randomness verifiable on-chain** | No | No | Yes — VRF proof stored in PDA |
| **Cost per dispute** | $50–200 in gas | $30–100 in gas | ~$0.01 in fees |
| **Jury selection speed** | Minutes (Ethereum block time) | Minutes | ~2.5 seconds (4.5 slots, measured) |
| **Staking token** | PNK (separate governance token) | ANT (separate governance token) | SOL (native — no friction) |
| **Smart contract language** | Solidity | Solidity | Rust + Anchor (Solana-native) |
| **On-chain state machine** | Partial (off-chain coordination) | Partial (off-chain coordination) | Full — 6-state FSM, all transitions on-chain |
| **Solana-native** | No | No | Yes |
| **Live deployment** | Ethereum mainnet | Ethereum mainnet | Solana devnet (4hFoUmi8NQnMS8icdTZWnP1wzYrDTpph4qTUjGCsjv15) |
| **Working frontend** | Yes | Deprecated | Yes (https://jury-app-eight.vercel.app) |

There is no Solana-native dispute resolution protocol. Kleros and Aragon Court are Ethereum-only. JURY is not competing with them — it is filling a gap that does not exist on Solana.

---

## Why JURY Wins on Each Judging Criterion

### Impact (estimated 30% weight)

Every Solana marketplace, escrow, freelance platform, and DAO governance system handles disputes the same way today: off-chain, centralized, and opaque. PayPal chargebacks. Superteam Earn admin decisions. DAO multisig discretion. None of these are verifiable, none are neutral, and none can be audited after the fact.

JURY installs a dispute layer at the protocol level. Any Solana dApp can CPI into JURY the same way they CPI into SPL Token. The impact is not one product — it is a primitive that upgrades the entire ecosystem's trust model.

The Colosseum scoring guide defines Grand Champion as "the most impactful product submission." Infrastructure primitives that fill systemic gaps have won Grand Prize in every Colosseum hackathon to date (TAPEDRIVE: storage primitive; Reflect Money: yield primitive; Unruggable: signing primitive). JURY is the dispute primitive.

### Technical Execution (estimated 25% weight)

This is not a mockup. The evidence is on-chain and verifiable:

- **Program deployed:** `4hFoUmi8NQnMS8icdTZWnP1wzYrDTpph4qTUjGCsjv15` on Solana devnet
- **VRF requests confirmed:** 4 transactions with measured fulfillment times (2293ms, 2515ms, 2532ms, 2727ms — mean 2.5 seconds)
- **Anchor program:** 479 lines of Rust, 6 instructions, compiles to 294KB BPF binary
- **State machine:** 6 states (Open → AwaitingJury → JuryRequested → Deliberating → Decided → Claimed), all transitions gated by signer checks and status validation
- **VRF integration:** Orao CPI (`RequestV2`) with one-shot PDA seed — the seed is bound to the dispute ID, so the randomness cannot be retried or reused for a different outcome
- **Frontend:** React + Vite + Tailwind + Solana Wallet Adapter, live on Vercel

The Orao VRF integration is the technical differentiator judges cannot dismiss. Block hash randomness (Kleros) is gameable by block producers. Commit-reveal (Aragon) is gameable by timing. Orao VRF requires a Byzantine consensus across 4 independent authorities before the randomness is accepted — an attacker must corrupt all 4 simultaneously within a 2.5-second window. That is not a theoretical improvement; it is a fundamentally different security model.

### Business Viability (estimated 20% weight)

The addressable markets are stacked:

1. **Freelance and gig economy:** $1.5 trillion globally, moving on-chain. Superteam Earn, Contra, Braintrust — every platform has a dispute problem with no neutral solution.
2. **DeFi escrow:** Every multi-party DeFi agreement (OTC desks, options settlement, perpetuals liquidation disputes) needs a credible neutral arbitrator.
3. **DAO governance disputes:** Treasury decisions, contributor payments, grant allocations — DAOs spend hundreds of hours on Discord arguing about disputes that could be resolved in 2.5 seconds with a verifiable jury.
4. **NFT marketplace chargebacks:** OpenSea, Magic Eden — platform-adjudicated disputes erode user trust. A neutral on-chain layer would be a competitive advantage for any marketplace.

Monetization is straightforward: JURY charges a protocol fee (e.g., 1–2% of dispute stake) on each resolved dispute. With 1,000 disputes per month at $100 average stake, that is $1,000–2,000/month in protocol revenue without any token, governance, or off-chain dependency. As dispute size grows (enterprise escrows, DAO treasuries), the fee scales with it.

The defensible moat compounds over time: VRF integration is not trivial to replicate (Orao is the only production VRF on Solana), juror reputation accumulates on-chain and is non-portable, and integrating dApps create switching costs once their dispute flow is wired to JURY's program ID.

### Differentiation (estimated 15% weight)

Searched across Colosseum project database (5,400+ projects), Superteam submissions, and Solana ecosystem: zero VRF-based dispute resolution protocols exist on Solana. This is not "better than Kleros" — Kleros does not exist on Solana. JURY is defining a new category.

Every Grand Prize winner in Colosseum history has been the first in their category. Category competition produces track winners. Category creation produces Grand Champions.

The demo moment is uniquely visceral and explainable in 10 seconds: two parties disagree, they lock SOL on-chain, a verifiable random function fires on-chain and selects three jurors from a pool of nine, the jury votes, the winner walks away with both stakes — no human moderator, no appeal to a platform, no central authority. Judges who review 70 projects in a day will remember this.

### Completion (estimated 10% weight)

JURY is not a demo with hardcoded state. The full end-to-end flow is live:

1. Connect wallet → create dispute with SOL stake (on-chain transfer)
2. Second wallet joins as defendant (matching stake)
3. Request jury → Orao VRF fires, 4 authorities respond, randomness fulfilled in ~2.5 seconds
4. Jury revealed from VRF output → 3 of 9 juror pubkeys selected deterministically
5. Jurors cast votes
6. Winner claims both stakes from PDA escrow

The program is deployed, the frontend is deployed, the VRF is proven. There is nothing claimed that cannot be verified with a Solana Explorer transaction signature.

---

## The $10M+ Case

Kleros has processed over $50 million in disputed value since 2018 on Ethereum. Every dollar of that was locked out of Solana's ecosystem because Kleros requires Ethereum. With Solana's fee structure, JURY can unlock dispute resolution for transaction sizes that are economically impossible on Ethereum — $10 freelance disputes, $50 NFT chargebacks, $200 escrow settlements. These micro-disputes represent a market that Kleros and Aragon structurally cannot serve.

The trajectory to $10M+ looks like this:

**Year 1:** Protocol integration. 5–10 Solana marketplaces integrate JURY as their default dispute mechanism. Target: Superteam Earn, Magic Eden, Sphere. Disputes: 500/month. Revenue: $5K–15K/month.

**Year 2:** Enterprise escrow. OTC desks, DAO grant disputes, multi-party DeFi settlements. Disputes: 2,000/month at larger average stake. Revenue: $50K–100K/month.

**Year 3:** Reputation graph monetization. Jurors with verified on-chain voting records become attestable credentials. B2B: dApps pay to query reputation data. Protocol revenue: $200K–500K/month.

**The defensibility compound:** The reputation graph is the moat. Once jurors have 50+ verified decisions on-chain, those credentials are non-portable. JURY becomes the identity layer for trustworthiness on Solana — the same way ENS became identity for Ethereum, except grounded in proven behavior rather than a purchased name.

This is the $10M+ case: JURY starts as a dispute protocol and compounds into the on-chain trust layer for the Solana economy.

---

## What Makes This Different from Every Other Hackathon Submission

Most hackathon submissions answer the question "what can I build?" JURY answers the question "what is missing from Solana that every other application needs?"

The pattern that distinguishes Grand Prize winners from track winners across every Colosseum hackathon: Grand Prize winners build infrastructure that other builders immediately want to use. TAPEDRIVE won because every dApp on Solana has a storage problem. Reflect Money won because every DeFi user wanted yield. Unruggable won because every Solana user wanted a hardware wallet that understood their ecosystem.

JURY wins for the same structural reason: every marketplace, escrow, DAO, and multi-party protocol on Solana has a dispute problem. JURY is the first time that problem has a credible on-chain answer.

The other differentiator is what JURY does NOT do. It does not introduce a new token. It does not require governance. It does not need off-chain coordination. Jury selection, voting, and stake distribution are entirely on-chain, entirely deterministic, and entirely verifiable by anyone with a Solana Explorer link. In an ecosystem where "decentralized" often means "admin multisig with a delay," JURY is actually decentralized in the mechanism that matters most — determining who wins.

---

## One-Paragraph Investor Pitch

JURY is an on-chain dispute resolution protocol for Solana that replaces centralized arbitration with cryptographically verifiable jury selection. Using Orao VRF's four-authority Byzantine quorum, JURY selects a jury of three from any available pool in under three seconds — provably random, publicly auditable, and immune to the manipulability that plagues block-hash and commit-reveal approaches. Two parties stake SOL, a jury decides, the winner claims both stakes: no token, no governance, no central authority. Deployed on Solana devnet at 4hFoUmi8NQnMS8icdTZWnP1wzYrDTpph4qTUjGCsjv15 with a live frontend at jury-app-eight.vercel.app, JURY is the first dispute primitive on Solana and the only credible answer to the question every marketplace, escrow protocol, and DAO on the network faces every day: when two parties disagree and trust no one, who decides?
