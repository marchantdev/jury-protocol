# Decision Room — Colosseum Frontier R14

## Evaluation Summary

Three concepts were scored on 8 criteria (0-3 each, 24 max). Jury was selected.

---

## Concept 1: JURY (SELECTED — 20/24)

**One-line pitch:** On-chain dispute resolution where jury members are selected via verifiable random function — no human moderator, no bribable committee.

**Why this wins:**
- Solana has no native dispute layer. Every marketplace, escrow, and freelance protocol handles disputes ad-hoc or off-chain.
- Orao VRF provides cryptographically verifiable randomness on Solana devnet — enables jury selection that cannot be gamed.
- Zero direct competition: searched Colosseum, Superteam, and Solana ecosystem — no VRF-based dispute resolution protocol exists.
- Demo moment is visceral: user files dispute, VRF fires on-chain, jury PDAs are created from the random seed, verdict is recorded immutably.

**Risks:**
- Orao VRF latency: devnet fulfillment ~2.5s (4.5 slots) — measured in spike. Acceptable for demo.
- Juror incentive design: out of scope for MVP — verdict state machine is the proof point.
- Anchor complexity: Dispute PDA + Juror PDA state machine requires careful account validation.

**Fundability:**
- Addresses a $2B+ problem (escrow, freelance, DAO governance disputes all need this).
- Protocol-layer infrastructure — any Solana marketplace can integrate.
- Clear monetization: protocol fee on resolved disputes.
- Defensible: VRF integration + reputation graph creates moat.

---

## Concept 2: VEIL (17/24)

**One-line pitch:** Private token swaps on Solana using ZK proofs — amounts and counterparties hidden until settlement.

**Why it scored well:**
- Privacy is a genuine gap in Solana DeFi.
- ZK tooling (Light Protocol) now available on Solana.

**Why it lost:**
- Zcash, Aztec, Railgun all exist. "Private swaps" is not differentiated without a specific wedge.
- ZK proof generation on Solana is still rough — demo risk is high.
- No specific user persona: who needs this enough to pay?
- Fundability: privacy infra is hard to monetize without network effects.

**Risk:** Demo failure if ZK circuits don't compile cleanly. Technical risk too high for hackathon window.

---

## Concept 3: FORGE (17/24)

**One-line pitch:** On-chain contract marketplace where freelancers and clients lock SOL into milestone escrows with automatic release.

**Why it scored well:**
- Clear user need. Escrow freelance is a real pain point.
- Anchor escrow PDAs are well-understood.

**Why it lost:**
- Superteam Earn already does milestone escrow. Not differentiated.
- "Escrow + milestones" is the Solana hackathon most-built category.
- No novel technical wedge — this is an implementation, not an insight.
- Judges have seen 50 escrow protocols. This would not stand out.

**Risk:** Even if executed perfectly, judges will not be excited by another escrow protocol.

---

## Decision

**JURY selected.** 20/24 score. Highest in category (Consumer + Infrastructure). Zero direct competition confirmed. VRF integration proven on devnet (spike-result.md: 4 tx signatures, mean 4.5 slot / 2.5s fulfillment). Anchor program build begins next session.

Concepts not selected: Veil (demo risk + overcrowded category), Forge (not differentiated).
