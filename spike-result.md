# Spike Result — Orao VRF Integration (Restored from archive-prior-rounds/)

## Component Tested
Orao VRF CPI from Solana Anchor program — request randomness, fulfill via oracle, read result on-chain.

## Why Riskiest
If VRF fulfillment latency is too high or CPI fails silently, the entire jury selection mechanism fails. Everything else (PDAs, verdict state, frontend) depends on this working.

## Evidence (devnet)
4 Orao VRF devnet transaction signatures captured.
- Mean fulfillment: 4.5 slots / ~2.5 seconds
- All 4 requests fulfilled successfully
- No CPI errors

Full tx signatures in: archive-prior-rounds/spike-result.md

## Works?
YES — VRF requests fulfill within 2-3 seconds on devnet. Acceptable for jury selection UX.

## Confidence to Continue
HIGH. Core risk validated. Anchor program build can proceed.

## Next: Build Anchor Program
- Dispute PDA (creator, defendant, description, stakes, status)
- Juror PDAs (selected jurors, VRF seed, vote)
- Verdict state machine (OPEN → SELECTING → DELIBERATING → DECIDED)
- Orao VRF CPI integration (request + fulfill + read)
