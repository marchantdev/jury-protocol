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

**Beachhead market:** Solana P2P commerce disputes (NFT trades, freelance escrow, OTC). This is an underserved market — not a theoretical one.

- **Tensor** processes $200M+/month in NFT volume. Their Discord #support shows 50-100 dispute-related messages per week. Current resolution: manual admin intervention, 3-5 day response time.
- **Superteam Earn** has paid $2M+ in Solana bounties. Submitters regularly dispute "not selected" decisions with no formal recourse.
- **Kleros** (Ethereum) has resolved $50M+ in dispute value since 2019 — validating on-chain arbitration demand. But Kleros' $50-200 gas floor makes disputes under $500 irrational.

**Revenue model:** 2-5% protocol fee on dispute stakes.
- **Conservative (Year 1):** 500 disputes/month × $100 avg × 3% = $18K/year
- **Growth (Year 2-3):** 5K disputes/month × $200 avg × 3% = $360K/year
- **At scale:** If JURY captures even 0.1% of Solana's $8B DeFi TVL as disputed value, that's $8M/year in dispute volume → $240K-400K/year in protocol fees

**Go-to-market:** CPI integration with existing Solana marketplaces. Any Anchor program can embed dispute resolution with a single CPI call — no standalone platform needed. First target: Tensor partnership for NFT trade disputes.

## 5. Juror Model (Current Implementation)

**What is deployed (devnet):**
- Pool of 9 pre-registered juror addresses
- `reveal_jury` takes Orao VRF's 64-byte random output, derives 3 unique indices via modular arithmetic
- Selected jurors vote via `cast_vote` (one vote per juror, majority wins)
- Winner claims both plaintiff and defendant stakes

**Planned for production (post-hackathon):**
- Dynamic juror registry PDA (wallets stake SOL to register)
- Slash conditions: jurors who fail to vote forfeit stake
- Juror fee: 50% of protocol fee split among voting jurors
- Domain-specific pools (e.g., NFT disputes, DeFi disputes)

The devnet demo proves the mechanism works end-to-end. Production juror economics layer on top of the proven VRF selection + voting + payout flow.

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

## 7. Deliverables

| Artifact | Status | Evidence |
|----------|--------|----------|
| Anchor program (lib.rs, 479 LOC) | DEPLOYED to devnet | Program ID: `4hFoUmi8NQnMS8icdTZWnP1wzYrDTpph4qTUjGCsjv15` |
| Frontend (React + Vite + Tailwind) | DEPLOYED | https://jury-app-eight.vercel.app |
| Tech demo video (2:35) | DONE | ElevenLabs voiceover, 7 scenes |
| Integration tests (5/5) | PASSING | jury-program.ts |
| GitHub repo | DONE | github.com/marchantdev/jury-protocol |
| VRF spike evidence | PROVEN | 4 devnet tx sigs, mean 2.5s |

**On-Chain:** Program `4hFoUmi8NQnMS8icdTZWnP1wzYrDTpph4qTUjGCsjv15` | Orao VRF `VRFzZoJdhFWL8rkvu87LpKM3RbcVezpMEc6X5GVDr7y` | Solana Devnet
