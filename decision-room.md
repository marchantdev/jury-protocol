# Decision Room — Colosseum Frontier R14

## Selected Concept: JURY (20/24)

**One-sentence pitch:** On-chain dispute resolution with VRF-provable jury selection — verifiably random, manipulation-resistant, permissionless.

**Why now:** Orao VRF is live on Solana devnet/mainnet. No working on-chain jury protocol exists. DAOs and marketplaces have no trustless arbitration layer.

**Risk:** VRF CPI integration complexity. Mitigation: devnet spike already completed (4 tx sigs, ~2.5s fulfillment confirmed).

**Fundability:** $250K seed prize. Dispute resolution is a clear vertical ($1B+ TAM in DAOs, gig economy, DeFi). Protocol → SDK → category leader path.

---

## Rejected: Veil (17/24)

**Why:** Private trading via ZK proofs. Novelty claim relies on proving ZK uniqueness on Solana — no working ZK VM on mainnet yet. Risk too high for hackathon timeline.

**Risk:** Infrastructure doesn't exist. Would demo a mock, not real ZK.

**Fundability:** Strong market but blocked by infra gap. Not fundable without mainnet ZK.

---

## Rejected: Forge (17/24)

**Why:** Reputation staking protocol. Sybil resistance requires social graph data — not available on-chain without oracle. Core mechanic is unproven.

**Risk:** Chicken-and-egg: reputation requires users, users require reputation.

**Fundability:** Medium. Reputation is real problem but no concrete defensibility wedge.

