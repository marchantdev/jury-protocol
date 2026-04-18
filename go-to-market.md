# JURY — Go-to-Market Plan

**Project:** JURY (on-chain dispute resolution, VRF-selected juries)
**Hackathon:** Colosseum Frontier (Solana, deadline 2026-05-11)
**Program:** `4hFoUmi8NQnMS8icdTZWnP1wzYrDTpph4qTUjGCsjv15` (devnet)
**Live app:** https://jury-app-eight.vercel.app

---

## 1. First Customer Persona: DAO Treasury Operator

**Who they are:** A core contributor at a mid-size Solana DAO — roughly 200-2,000 token holders, $500K–$10M in treasury — who runs grant rounds or service provider payments. Real examples: Mango DAO, Drift DAO, Bonk DAO, Realms governance communities.

**Their exact pain:** They disburse SOL to service providers (developers, marketers, auditors) against deliverable milestones. When a deliverable is disputed — "you didn't ship what we agreed to" — there is no mechanism. Options are: (a) the multisig signers vote informally, opening the DAO to insider bias and governance theater, or (b) they eat the loss and pay anyway to avoid drama. Neither is acceptable at scale.

**What they need:** A lightweight, credibly neutral arbitration layer they can reference in grant agreements. Not a full legal system. Not Kleros (too expensive, wrong chain, requires PNK token). Something that costs $0.01, resolves in under a minute, and produces an on-chain verdict they can point to.

**Why JURY fits:** A DAO can embed a JURY dispute address directly in a governance proposal or grant agreement: "If deliverables are disputed, resolution proceeds via program `4hFo…`." The jury is drawn from the existing staker pool or a pre-designated panel. The verdict is an immutable on-chain state transition. No one controls it. No one can be accused of bias that isn't traceable to a signed transaction.

---

## 2. Distribution Channel: Realms + Direct Contributor Outreach

**Primary channel: Realms governance ecosystem**

Realms (realms.today) is the dominant Solana DAO tooling platform with 2,000+ DAOs and 4,000+ governance programs deployed. It is the entry point for any DAO operator running grants or service payments on Solana.

The distribution play:
- JURY ships an open-source Realms plugin or CPI interface that lets any Realms-based DAO embed dispute resolution into a governance proposal in one transaction.
- Target the Realms developer relations team ([@solana_realms on X](https://x.com/solana_realms)) for a featured integration. Realms has a public integrations directory and actively promotes ecosystem tools.
- Post a technical write-up in the Realms Discord (#dev-tools channel) and the Superteam DAO Builders community on Week 1.

**Secondary channel: Squads multisig users**

Squads Protocol (squads.so) manages $1B+ in Solana multisig treasury assets. Teams using Squads to manage contractor payments are exactly the persona above. Squads has a public SDK and an ecosystem partners page. A JURY integration means: "attach a dispute clause to your Squads vault release transaction." Reach: post in Squads Discord + submit to squads.so/ecosystem.

**Why these channels and not Twitter/growth hacking:** DAO operators are a narrow, high-intent audience. They read Discord, vote on proposals, and pay attention to tools their peers use. A single engaged DAO with a live dispute creates more referrals than 10,000 Twitter impressions.

---

## 3. Week 1 Action (Immediately After Hackathon Submission)

**Day 1–2: Deploy to Mainnet and Document the Integration Path**

The devnet program is live. Mainnet deployment requires identical steps (same Orao VRF program ID works on mainnet). Cost: under 3 SOL for deployment. This is the single most important action — a tool for real financial disputes cannot credibly exist only on devnet.

Deliverables:
- `anchor deploy --provider.cluster mainnet-beta` with mainnet Orao VRF address
- Update README with mainnet program ID and verified Solana Explorer link
- Publish a 500-word integration guide: "How to add JURY dispute resolution to your Solana program in 15 minutes" — with code snippets for CPI call, PDA derivation, and callback handling

**Day 3–4: Reach Out to Three Specific DAOs**

Contact the grants committees of:
1. **Mango DAO** — active grant program, frequent contributor disputes, developer-friendly governance. Contact: post in #contributor-grants on Mango Discord.
2. **Drift DAO** — $50M+ protocol, active grants council, already deals with service provider disputes. Contact: Drift community Discord #governance.
3. **Bonk DAO** — community-driven, 400K+ holders, grants program active as of Q1 2026. Contact: Bonk Discord #bonk-dao.

Message template (non-generic, directly actionable):

> "We built JURY — on-chain dispute resolution for Solana DAOs using VRF-selected juries. Verdict in under a minute, costs ~$0.01. We're looking for one DAO to pilot it on a real grant round — you'd get direct input on the product and we'd document your use case. Here's the mainnet program ID and a live demo: [link]."

**Day 5–7: Publish Technical Post on Mirror**

Title: "Why Solana DAOs Need On-Chain Arbitration (And How We Built It in 4 Weeks)"

Content: the problem, the technical architecture (VRF CPI walkthrough, state machine diagram), the cost comparison vs Kleros, and a call to action for integrators. Mirror posts index well in Solana developer circles and are cited in governance discussions. Submit to Superteam Earn for a small amplification bounty if one is available.

---

## 4. Month 1–3 Growth Plan

### Month 1: First Live Dispute

**Goal:** One real dispute resolved on-chain (mainnet, real SOL stakes, real parties).

How: Partner with one of the three target DAOs above. Offer to facilitate: help them write the dispute clause into a grant agreement, walk the parties through the frontend, and be present (async) during the jury selection and voting window.

A real dispute with a real resolution is worth more than any marketing. Screenshot the on-chain verdict. Post it on X tagging the DAO: "First JURY verdict rendered on Solana mainnet — [tx sig]." This becomes the case study for every subsequent outreach.

**Secondary action:** Submit JURY to the Solana Foundation's developer grant program (grants.solana.com). The Foundation funds infra primitives and JURY qualifies as public goods tooling. Target: $10K–$25K grant for mainnet deployment costs and SDK development.

### Month 2: SDK Release + NFT Marketplace Vertical

**Goal:** Ship a TypeScript SDK that lets any Solana dApp embed dispute resolution in 10 lines of code.

```typescript
import { JuryClient } from "@jury-protocol/sdk";
const jury = new JuryClient({ connection, wallet });
const disputePda = await jury.openDispute({
  respondent: sellerPubkey,
  evidenceHash: sha256(evidenceJson),
  stakeAmount: 0.5 * LAMPORTS_PER_SOL,
});
```

**NFT marketplace targets:** Tensor and Magic Eden both handle secondary NFT sales where buyer disputes (counterfeit, not-as-described, scam listings) are currently resolved by platform support teams — a centralized bottleneck. Reach out to Tensor's developer relations (tensor.trade has a public partner program) and Magic Eden's ecosystem team with a proof-of-concept integration.

Value proposition to marketplaces: offload dispute resolution to a neutral on-chain protocol, reduce support load, and give users cryptographic proof that resolution was fair. Marketplaces pay zero fees; JURY earns protocol revenue from the stake spread.

### Month 3: Freelancer Platform Vertical + Juror Reputation System

**Goal:** 50+ disputes processed, $25K+ in staked SOL flowing through the protocol.

**Freelancer platform target:** Superteam Earn (earn.superteam.fun) — the largest Solana-native freelancer marketplace with $2M+ in bounties paid annually. Superteam Earn has a public API and an active developer community. Propose integrating JURY as the dispute layer for bounty submissions: if a submitter disputes a "not selected" decision, they can invoke JURY instead of messaging Superteam support.

**Juror reputation system:** After 50+ disputes, on-chain voting history exists. Build a JurorReputation PDA that tracks: total cases, win-rate accuracy vs final verdict, stake weight. High-reputation jurors get selected preferentially (VRF output biased by reputation weighting). This creates a flywheel: jurors build reputation by voting well, which makes JURY more accurate, which makes it more valuable to integrators.

---

## 5. Revenue Model

**Protocol fee on resolved disputes:** 3% of total stake on verdict, split between the protocol treasury (2%) and the juror pool (1%).

Worked example:
- Two parties stake 1 SOL each (2 SOL total dispute = $200 at $100 SOL)
- Protocol collects 0.06 SOL (~$6)
- 0.04 SOL to JURY treasury ($4), 0.02 SOL split among 3 jurors (~$0.67/juror)
- Net cost per party: $100 stake + $3 fee (1.5% per side)

**Revenue projections (conservative — based on Kleros benchmarks):**

| Milestone | Monthly disputes | Avg stake | Protocol rev/month | Annual |
|-----------|-----------------|-----------|-------------------|--------|
| Pre-integration (organic) | 200 | $50 | $300 | $3,600 |
| 1 marketplace partner | 2,000 | $150 | $9,000 | $108,000 |
| 3 integrations + SDK | 10,000 | $200 | $60,000 | $720,000 |
| Standard Solana infra | 50,000 | $250 | $375,000 | $4,500,000 |

Kleros resolved $50M+ in dispute value since 2019 with $50-200 gas costs on Ethereum (~5K holders). Solana has 100x the user base and 5,000x lower costs. The 2,000 disputes/month milestone requires capturing <0.01% of Tensor's monthly NFT volume as disputed transactions.

**Near-term revenue (months 1-6):**
- Solana Foundation infrastructure grant: $25K-$50K (JURY qualifies as public goods tooling)
- Superteam ecosystem grant: $5K-$10K
- Total pre-revenue funding: $30K-$60K — covers mainnet deployment, SDK development, and first integration partnerships

**Premium tier (Month 3+):**
- Expedited juries (9-of-9 instead of 3-of-9) for 5% fee
- Custom juror pools (domain experts selected by integrator) for enterprise pricing
- SLA guarantees: resolution within 24 hours or stake refund

**Why this model is defensible:** JURY earns fees only on resolved disputes — zero ongoing cost to integrators who embed the SDK but see low dispute rates. This makes it easy for marketplace operators to say yes to the integration. Revenue scales with transaction volume of partner platforms, not with JURY's own user acquisition. Once embedded, switching costs are high (contract migration, user trust, juror pool history).

---

## 6. Why Solana — The Competitive Moat

**Cost kills competitors.** Kleros on Ethereum costs $50–$200 per dispute in gas fees alone, before any protocol fees or PNK token requirements. At $0.01 per dispute on Solana, JURY can address a category of disputes that are simply not viable on Ethereum: $50 freelancer payment disputes, $200 DAO micro-grant disagreements, $500 NFT sale chargebacks. Ethereum's dispute resolution market is bounded by its own cost floor. Solana's is not.

**Orao VRF is the specific technical moat.** Orao's 4-authority Byzantine quorum VRF is live and battle-tested on Solana mainnet. Porting JURY to any other chain requires finding an equivalent verifiable randomness oracle, which does not exist with the same guarantees on most EVM chains. Chainlink VRF exists on EVM but costs $0.25–$2.00 per request. Orao on Solana costs fractions of a cent and fulfills in 2.5 seconds. This is not a philosophical preference for Solana — it is a hard technical cost advantage baked into the oracle layer.

**Sub-3-second jury selection changes what disputes are possible.** When jury selection takes 10 minutes (Ethereum commit-reveal schemes) or hours (Kleros appeal windows), dispute resolution feels like going to arbitration. When it takes 2.5 seconds, it can be embedded as a real-time feature in a marketplace checkout or DAO vote interface. This changes the UX category from "formal dispute system" to "instant neutral third party." That category does not exist elsewhere.

**Solana's ecosystem is the target market.** The integrations described above — Realms, Squads, Tensor, Magic Eden, Superteam Earn — are Solana-native. They have Solana wallets, Solana tokens, and Solana developer teams. Porting JURY to EVM and competing with Kleros on its home turf is not the play. The play is becoming the standard dispute layer for the Solana ecosystem before anyone else does, because no equivalent exists today.
