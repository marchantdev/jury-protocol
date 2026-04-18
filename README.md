# JURY — Programmable Dispute Resolution Infrastructure for Solana

**JURY is a dispute resolution company building trust infrastructure for the Solana economy.** Any Solana program can embed neutral, verifiable dispute resolution via a single CPI call — the way programs call SPL Token today.

**Live demo:** [jury-app-eight.vercel.app](https://jury-app-eight.vercel.app)
**Program:** [`4hFoUmi8NQnMS8icdTZWnP1wzYrDTpph4qTUjGCsjv15`](https://explorer.solana.com/address/4hFoUmi8NQnMS8icdTZWnP1wzYrDTpph4qTUjGCsjv15?cluster=devnet) (Solana Devnet)

---

## Two Innovations — Not a Port

JURY is **not** Kleros on Solana. It introduces two structural innovations that create a new market:

### 1. CPI-Composable Justice (Architectural Innovation)

Kleros and Aragon are **standalone platforms** — users leave their dApp, navigate to a separate site, file a dispute there. JURY is **CPI-embeddable**: any Anchor program can invoke dispute resolution directly within its own transaction flow.

```rust
// From programs/example-escrow — a real, compilable Anchor program:
use jury_program::cpi::accounts::CreateDispute;
use jury_program::cpi::create_dispute;

// One CPI call embeds the full dispute lifecycle
let cpi_accounts = CreateDispute {
    plaintiff: ctx.accounts.buyer.to_account_info(),
    dispute: ctx.accounts.dispute.to_account_info(),
    system_program: ctx.accounts.system_program.to_account_info(),
};
create_dispute(CpiContext::new(jury_program, cpi_accounts), id, reason, stake)?;
```

**This is not a hypothetical snippet.** See [`programs/example-escrow/`](jury-program/programs/example-escrow/src/lib.rs) — a complete Anchor program that compiles and links against the jury program's CPI interface. Run `anchor build` to verify.

This is the difference between PayPal (a destination) and Stripe (infrastructure). Dispute volume scales with **partner transaction volume**, not JURY's own user acquisition. No other blockchain dispute system is CPI-composable.

### 2. Micro-Dispute Economics (Market-Creating Innovation)

At $50-200 gas on Ethereum, Kleros cannot economically resolve disputes under ~$200. JURY at $0.01/tx unlocks a market that **literally cannot exist** on any other chain: $5 freelance disputes, $20 NFT chargebacks, $100 escrow disagreements. This is not "cheaper Kleros" — it's a new category of disputes that were previously unresolvable.

---

## The Problem — Validated by Real Data

Solana processes $8B+ in DeFi TVL and $200M+ monthly NFT volume, but has **zero native dispute resolution**. Every marketplace, escrow, and P2P protocol handles disputes the same way: off-chain, centralized, opaque.

| Source | Evidence |
|--------|----------|
| **Kleros** | $50M+ in disputed value on Ethereum since 2019, despite $50-200 gas. Proves demand exists at prohibitive prices. |
| **Tensor/Magic Eden** | Discord #support channels show daily buyer disputes. Centralized support teams — doesn't scale and contradicts decentralization. |
| **Superteam Earn** | $2M+ in bounties paid. "Did you deliver?" is the #1 dispute. Admin discretion, no neutral recourse. |
| **DAO governance** | Mango, Drift, Bonk DAOs use informal multisig votes for grant disputes. Governance theater. |
| **Mathematical proof** | At $50+ gas, disputes under $500 are irrational on Ethereum. JURY at $0.01 makes $5 disputes viable — a 200x lower floor. |

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

**Anchor Program:** 527 LOC, 7 instructions, 314KB BPF binary. **Tests:** 6/6 passing (including JurorPool PDA initialization).

**CPI Example:** [`example-escrow`](jury-program/programs/example-escrow/src/lib.rs) — a complete 50-LOC Anchor program demonstrating how an escrow service embeds JURY dispute resolution via a single CPI call. Compiles against `jury_program` with `features = ["cpi"]`.

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
| `initialize_juror_pool` | Admin creates on-chain juror pool PDA |
| `create_dispute` | Plaintiff stakes SOL, creates dispute PDA |
| `join_dispute` | Defendant matches stake |
| `request_jury` | Triggers Orao VRF CPI for randomness |
| `reveal_jury` | Reads VRF output + on-chain pool, selects 3-of-9 jurors |
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
anchor test --validator legacy  # 6/6 tests pass
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

## Security Model

### Juror Selection Integrity
- **Randomness:** Orao VRF with 4-authority Byzantine quorum. No single authority can predict or bias the output. Verifiable on-chain via fulfilled randomness account.
- **Selection algorithm:** `randomness[i] % pool_size` with deduplication loop (up to 64 bytes consumed). Deterministic — anyone can verify the same randomness produces the same jury.

### On-Chain Juror Pool (Trust Model)
- **`JurorPool` PDA:** Juror addresses are stored on-chain in a protocol-admin-initialized PDA (`seeds = [b"juror_pool"]`). The `reveal_jury` instruction reads the pool from this PDA — callers cannot supply or manipulate the juror set.
- **`initialize_juror_pool` instruction:** Admin creates the pool once; `reveal_jury` references it via Anchor account constraints. The VRF selection algorithm is unchanged — the fix only moves the pool from an instruction argument to verified on-chain state.

### Signer Checks
- Only the plaintiff can create a dispute
- Only the defendant can join
- Only selected jurors can vote (checked against `dispute.jury[]`)
- Only the winner can claim stakes
- All enforced by Anchor account constraints and `require!()` checks

## Juror Pool Design

### Current (Devnet)
Pre-seeded pool of 9 juror addresses. VRF derives 3 unique juror indices via `randomness[i] % pool_size` with deduplication. Fully implemented and tested.

### Production Roadmap
- Dynamic juror registry PDA (stake SOL to register, minimum stake required)
- Slash conditions for non-voting jurors (forfeit stake)
- 50% protocol fee split among voting jurors (incentive alignment)
- Domain-specific pools (NFT disputes, DeFi disputes, freelance disputes)
- Reputation graph — on-chain voting history as trustworthiness identity

## Post-Hackathon Roadmap

| Month | Milestone |
|-------|-----------|
| 1 | Mainnet deployment + Realms governance plugin |
| 2 | TypeScript SDK + Tensor marketplace integration |
| 3 | Juror reputation system + Superteam Earn integration |
| 6 | 3+ integrations, $30K+ MRR from protocol fees |

## Video

- **Technical demo:** 2:35 walkthrough ([tech-demo-v2.mp4](tech-demo-v2.mp4))
- **Pitch video:** 3:38 pitch ([pitch-video.mp4](pitch-video.mp4)) — problem, market, CPI innovation, working product, business model

## License

MIT
