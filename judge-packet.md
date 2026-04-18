# JURY — Judge Packet

**One sentence:** JURY is the first CPI-composable dispute resolution protocol on Solana — any Anchor program can embed verifiable jury selection with a single cross-program invocation, unlocking micro-disputes under $500 that are economically impossible on any other chain.

---

## The Problem
Solana processes $8B+ DeFi TVL and $200M+ monthly NFT volume but has zero native dispute resolution. Kleros proved the market on Ethereum ($50M+ resolved since 2019), but at $50-200 gas, disputes under $500 are economically irrational. The entire micro-dispute market doesn't exist.

## Why Now
1. Orao VRF provides verifiable on-chain randomness (4-authority BFT quorum) — no block hash manipulation
2. Solana's $0.01 transaction cost makes $5-$50 disputes viable for the first time
3. Growing P2P commerce on Solana (Tensor, Superteam Earn, DAO governance) creates real dispute demand with no resolution infrastructure

## The Product
On-chain dispute resolution: two parties stake SOL, Orao VRF selects 3 jurors from a 9-member on-chain pool, jurors vote, winner claims both stakes. Full 6-state machine, all on-chain, all verifiable.

**All 6 instructions interactive in the browser** — create dispute, join, request VRF jury, reveal jury, cast vote, claim stakes. Context-aware action buttons based on wallet role and dispute status.

## The Aha Moment
A jury is selected via Orao VRF on devnet in 2.5 seconds. The randomness is on-chain, the juror pool is in a PDA, and no one — not the plaintiff, not the defendant, not the protocol admin — could have predicted or manipulated which 3 jurors were chosen. This is provable fairness.

## Proof
- **Program deployed:** `4hFoUmi8NQnMS8icdTZWnP1wzYrDTpph4qTUjGCsjv15` (Solana devnet)
- **JurorPool PDA:** `EpWwzK9eZvMLvznumJiS6yjxvNSKeEu729d2ZSGiLjBu` (9 jurors, on-chain)
- **4 VRF devnet transactions:** Mean 4.5 slots / 2.5s fulfillment
- **527 LOC Anchor program:** 7 instructions, 6-state FSM, 11 error codes
- **6/6 tests passing** (localnet, `anchor test --validator legacy`)
- **Frontend live:** [jury-app-eight.vercel.app](https://jury-app-eight.vercel.app)
- **Videos:** Pitch (3:38) + Tech demo (2:35), both 1080p

## Target User
- Marketplace operators (Tensor, Magic Eden) needing neutral dispute resolution
- DAO governance (Realms, Drift DAO) needing transparent vote arbitration
- Freelance platforms (Superteam Earn) needing "did you deliver?" resolution
- Any Solana program needing embedded dispute resolution via CPI

## The Company
JURY is building trust infrastructure for the Solana economy — not a hackathon demo.

- **Revenue:** 3% protocol fee on resolved disputes. Scales with partner transaction volume (Stripe model).
- **Moat:** Juror reputation is non-portable, integrator switching costs grow with each CPI embed, juror pool has network effects.
- **Roadmap:** Mainnet (M1) → TypeScript SDK + Tensor (M2) → Juror reputation + Superteam Earn (M3) → 3+ integrations, $30K+ MRR (M6)

## Why We Win
1. **Category creation:** Zero dispute resolution infrastructure exists on Solana. First mover in a proven market.
2. **CPI-composable:** Not a standalone platform — infrastructure other programs call. Kleros/Aragon are destinations; JURY is embedded.
3. **Micro-dispute economics:** 200x lower cost floor than Ethereum. New market category that structurally cannot exist on other chains.
4. **Everything verifiable:** VRF randomness, juror pool, votes, stakes — all on-chain, all auditable.
5. **Grand Prize pattern match:** TapeDrive (new infra → consumer product), Reflect (stablecoin primitive → category), JURY (dispute primitive → trust infrastructure).

## Demo Flow
1. **Problem** (15s) — $200M+ NFT trades monthly, zero dispute resolution on Solana
2. **Kleros comparison** (20s) — $50-200/dispute on ETH vs $0.01 on Solana
3. **Solution** (30s) — How JURY works: stake → VRF jury → vote → claim
4. **CPI innovation** (30s) — Any Anchor program embeds disputes via single CPI call
5. **Live product** (30s) — All 6 instructions working in browser, VRF evidence
6. **Market + business** (30s) — $8B TVL, protocol fees, Stripe model
7. **Close** (15s) — Live URL, GitHub, vision

## Scoring Against Colosseum Criteria
| Criterion | Score | Evidence |
|-----------|-------|---------|
| Impact | 9/10 | Category creation — first dispute infra on Solana. Kleros proves $50M+ demand at higher prices. |
| Technical Execution | 8/10 | 527 LOC Anchor program, Orao VRF CPI, 6/6 tests, deployed on devnet, full frontend |
| Business Viability | 8/10 | 3% protocol fee, Stripe model, concrete partner pipeline (Tensor, Superteam, Realms) |
| Differentiation | 9/10 | CPI-composable (no other system), micro-dispute economics (new market), VRF security |
| Completion | 8/10 | Working end-to-end product: program + frontend + videos + documentation |
| **Composite** | **8.4/10** | |
