# JURY — On-Chain Dispute Resolution for Solana

**The first dispute resolution company on Solana.** Micro-disputes under $500 — economically impossible on any other chain — resolved in 30 seconds for $0.01.

**Live demo:** [jury-app-eight.vercel.app](https://jury-app-eight.vercel.app)
**Program:** [`4hFoUmi8NQnMS8icdTZWnP1wzYrDTpph4qTUjGCsjv15`](https://explorer.solana.com/address/4hFoUmi8NQnMS8icdTZWnP1wzYrDTpph4qTUjGCsjv15?cluster=devnet) (Solana Devnet)

---

## Why JURY Exists

Solana processes $8B+ in DeFi TVL and $200M+ monthly NFT volume, but has **zero native dispute resolution**. When trades go wrong, users eat the loss. Ethereum has Kleros ($50M+ in disputed value since 2019), but at $50-200/dispute in gas — making any dispute under $500 economically irrational.

**JURY unlocks micro-disputes: $1-$500 disagreements that cannot exist on Ethereum.**

This is not cheaper Kleros. This is a new market category — like Stripe didn't make PayPal cheaper, it made programmatic payments possible.

### Demand Evidence (Not Hypothetical)

| Source | Evidence |
|--------|----------|
| **Kleros** | $50M+ in disputed value on Ethereum since 2019, despite $50-200 gas. Proves demand at prohibitive prices. |
| **Tensor/Magic Eden** | Discord #support channels show daily buyer disputes. Resolved by centralized teams — doesn't scale. |
| **Superteam Earn** | $2M+ in bounties paid. "Did you deliver?" is the #1 dispute. Resolved by admin discretion. |
| **DAO governance** | Mango, Drift, Bonk DAOs use informal multisig votes for grant disputes. Governance theater. |
| **Mathematical proof** | At $50+ gas, disputes under $500 are irrational on Ethereum. JURY at $0.01 makes $5 disputes viable. |

## How It Works

1. **File a Dispute** — Plaintiff creates a dispute and stakes SOL. Defendant joins and matches the stake. Funds locked in PDA escrow.
2. **VRF Jury Selection** — Orao VRF generates verifiable randomness on-chain (4-authority Byzantine quorum). Three jurors selected from a pool of nine in ~2.5 seconds. No one can predict or manipulate who gets chosen.
3. **Deliberation** — Selected jurors review and cast votes on-chain. Majority wins.
4. **Resolution** — Verdict is final. Winner claims both stakes. Every step verifiable on Solana Explorer.

**All 6 steps are interactive in the browser** — no CLI required. Context-aware action buttons appear based on dispute status and connected wallet role.

State machine: `Open → AwaitingJury → JuryRequested → Deliberating → Decided → Claimed`

## JURY vs Kleros vs Aragon

| Feature | Kleros (ETH) | Aragon Court (ETH) | JURY (Solana) |
|---------|-------------|-------------------|---------------|
| Randomness | Block hash (manipulable) | Commit-reveal (gameable) | **Orao VRF** (4-auth BFT quorum) |
| Cost/dispute | $50-200 gas | $30-100 gas | **~$0.01** |
| Min viable dispute | ~$200 | ~$100 | **~$1** (200x lower floor) |
| Jury speed | Minutes | Minutes | **~2.5 seconds** |
| Staking | PNK token (~5K holders) | ANT token | **SOL** (native, millions) |
| Integration | Standalone platform | Standalone platform | **CPI-embeddable** (any Anchor program) |
| State machine | Partial (off-chain) | Partial (off-chain) | **Full 6-state FSM, all on-chain** |

## Technical Evidence

**VRF Jury Selection — 4 verified devnet transactions (2026-04-16):**

| Run | Slots | Wall Time | Jury Selected |
|-----|-------|-----------|---------------|
| 0 | 5 | 2.5s | [7, 2, 5] |
| 1 | 4 | 2.7s | [5, 1, 7] |
| 2 | 4 | 2.3s | [8, 3, 5] |
| 3 | 5 | 2.5s | [7, 5, 1] |

Mean fulfillment: 4.5 slots (~2.5 seconds). Transaction signatures in [`spike-result.md`](spike-result.md).

**Anchor Program:** 479 LOC, 6 instructions, 294KB BPF binary. **Tests:** 5/5 passing.

## Architecture

```
Frontend (React 19/Vite 6)  ──►  JURY Program (Anchor 0.32.1)  ──►  Orao VRF
   Wallet adapter                  6 instructions                    4-auth BFT
   3 routes, full lifecycle        Dispute PDA escrow                ~2.5s fulfill
   Context-aware UI                State machine + signer checks     On-chain proof
```

### Anchor Program Instructions

| Instruction | Description |
|-------------|-------------|
| `create_dispute` | Plaintiff stakes SOL, creates dispute PDA |
| `join_dispute` | Defendant matches stake |
| `request_jury` | Triggers Orao VRF CPI for randomness |
| `reveal_jury` | Reads VRF output, selects 3-of-9 jurors |
| `cast_vote` | Juror votes (plaintiff or defendant) |
| `claim_stakes` | Winner withdraws both stakes |

## Revenue Model

Protocol fee (3%) on resolved disputes. Revenue scales with partner transaction volume (Stripe model).

| Milestone | Disputes/mo | Avg stake | Annual revenue |
|-----------|------------|-----------|---------------|
| Pre-integration | 200 | $50 | $3,600 |
| 1 marketplace | 2,000 | $150 | $108,000 |
| 3 integrations | 10,000 | $200 | $720,000 |
| Standard infra | 50,000 | $250 | $4,500,000 |

## Running Locally

### Program (requires Solana CLI + Anchor)

```bash
cd jury-program
anchor build
anchor test  # 5/5 tests pass
anchor deploy --provider.cluster devnet
```

### Frontend

```bash
cd jury-app
npm install
npm run dev   # http://localhost:5173
```

## On-Chain IDs

| Resource | Address |
|----------|---------|
| JURY Program | `4hFoUmi8NQnMS8icdTZWnP1wzYrDTpph4qTUjGCsjv15` |
| Orao VRF | `VRFzZoJdhFWL8rkvu87LpKM3RbcVezpMEc6X5GVDr7y` |
| Deploy Tx | [`33swTRy...sDFm`](https://explorer.solana.com/tx/33swTRyk9qucDa9xpAaGsn88cqWMbpXJwQ9AQ4UXbw1S9Ma4kkceLH7bVyXkgvytDwQRepi3nxKEH5PsntXtsDFm?cluster=devnet) |

## Juror Pool Design

### Current (Devnet)
Pre-seeded pool of 9 juror addresses. VRF derives 3 unique juror indices via `randomness[i*8..i*8+8] mod pool_size` with deduplication. Fully implemented and tested.

### Production Roadmap
- Dynamic juror registry PDA (stake SOL to register)
- Slash conditions for non-voting jurors
- 50% protocol fee split among voting jurors
- Domain-specific pools (NFT, DeFi, freelance)
- Reputation graph — on-chain voting history as identity

## Post-Hackathon Roadmap

| Month | Milestone |
|-------|-----------|
| 1 | Mainnet deployment + Realms governance plugin |
| 2 | TypeScript SDK + Tensor marketplace integration |
| 3 | Juror reputation system + Superteam Earn integration |
| 6 | 3+ integrations, $30K+ MRR from protocol fees |

## Video

- **Technical demo:** 2:35 walkthrough ([tech-demo-v2.mp4](tech-demo-v2.mp4))
- **Pitch video:** 3-minute pitch (problem, solution, live demo, market)

## License

MIT
