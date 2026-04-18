# JURY — Technical Spike Target

**Date:** 2026-04-16
**Round:** R14
**Concept:** JURY — on-chain dispute resolution with VRF-based jury selection

---

## What Are We Proving?

JURY's core differentiation claim: **jury selection is verifiably random and manipulation-resistant on-chain**.

This is the SINGLE HARDEST CLAIM in the concept. If Switchboard VRF cannot provide:
1. On-chain verifiable randomness in a single slot
2. Deterministic jury selection from the VRF output
3. A user-facing confirmation of jury composition before dispute proceeds

...then JURY's core value proposition fails and we must pivot.

---

## The Riskiest Component

**Switchboard VRF fulfillment latency + UX.**

- VRF request → oracle fulfillment takes 1-3 slots (~400ms-1.2s)
- During that window, dispute state is "pending jury"
- If the oracle network is slow or the UX is janky, the demo falls apart

All other components (dispute creation, verdict submission, fund release) are standard Anchor program state machines. VRF is the ONLY component with external oracle dependency.

---

## What Depends on This Spike

- Demo viability: the <90s demo REQUIRES VRF fulfillment to be near-instant
- Architecture: if VRF has >3s latency, need an alternative (commit-reveal, which is weaker)
- Slide 2 of pitch video: "watch jury selected by Switchboard VRF in one slot" — only true if this works

---

## Spike Success Criteria

1. **VRF request on devnet produces a verifiable tx hash** (non-negotiable)
2. **Fulfillment latency ≤ 5 slots** (~2 seconds) — fast enough for demo UX
3. **VRF output deterministically maps to 3 of 9 jury candidates** — jury selection formula works
4. **No manual oracle step needed** — Switchboard's permissionless queue handles fulfillment autonomously

---

## Time Budget

10% of EXECUTION phase = ~2.5 days of a 26-day build.
Spike must complete within this session.

---

## If Spike Fails

- VRF latency > 10 slots: pivot to commit-reveal scheme (weaker but functional)
- VRF API unusable in Anchor CPI: use Switchboard's on-chain randomness via their v2 or Orao alternative
- Switchboard devnet down: test with Orao Network (alternative VRF, also Solana-native, devnet live)

