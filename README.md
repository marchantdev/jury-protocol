# JURY — On-Chain Dispute Resolution

Jury settles disputes with verifiably random juries on Solana. No centralized arbitrator. No manipulation. Cryptographic fairness.

**Live demo:** [jury-app-eight.vercel.app](https://jury-app-eight.vercel.app)
**Program:** [`4hFoUmi8NQnMS8icdTZWnP1wzYrDTpph4qTUjGCsjv15`](https://explorer.solana.com/address/4hFoUmi8NQnMS8icdTZWnP1wzYrDTpph4qTUjGCsjv15?cluster=devnet) (Solana Devnet)

---

## The Problem

Digital disputes resolve through centralized arbitration. PayPal, Stripe, and marketplace platforms act as judge, jury, and executioner. Decisions are unverifiable, fees are opaque, and the platform always wins ties.

Web3 transactions need a dispute mechanism that matches their trust model: transparent, permissionless, and verifiable.

## How It Works

1. **File a Dispute** — Plaintiff creates a dispute and stakes SOL. Defendant joins and matches the stake. Funds are locked in the dispute PDA.

2. **VRF Jury Selection** — Orao VRF generates verifiable randomness on-chain. Three jurors are selected from a pool of nine. No one can predict or manipulate who gets chosen.

3. **Deliberation** — Selected jurors review the dispute and cast their votes on-chain. Majority wins.

4. **Resolution** — The verdict is final and on-chain. The winner claims both stakes. Every step is verifiable on Solana Explorer.

## Architecture

```
Frontend (React/Vite)  ──►  JURY Program (Anchor 0.32.1)  ──►  Orao VRF
   Wallet adapter              6 instructions                    4-auth BFT
   3 routes                    Dispute PDA escrow                ~2.5s fulfill
```

### Anchor Program — 6 Instructions

| Instruction | Description |
|-------------|-------------|
| `create_dispute` | Plaintiff stakes SOL, creates dispute PDA |
| `join_dispute` | Defendant matches stake |
| `request_jury` | Triggers Orao VRF CPI for randomness |
| `reveal_jury` | Reads VRF output, selects 3-of-9 jurors |
| `cast_vote` | Juror votes (plaintiff or defendant) |
| `claim_stakes` | Winner withdraws both stakes |

**State machine:** `Open → AwaitingJury → JuryRequested → Deliberating → Decided → Claimed`

### VRF Evidence

4 real Orao VRF requests on Solana devnet, all verified:

| Run | Slots | Wall Time | Jury Selected |
|-----|-------|-----------|---------------|
| 0 | 5 | 2.5s | [7, 2, 5] |
| 1 | 4 | 2.7s | [5, 1, 7] |
| 2 | 4 | 2.3s | [8, 3, 5] |
| 3 | 5 | 2.5s | [7, 5, 1] |

Mean fulfillment: 4.5 slots (~2.5 seconds). Transaction signatures in [`spike-result.md`](spike-result.md).

## Tech Stack

- **Anchor 0.32.1** — Solana program framework
- **Orao VRF** — Verifiable random function (4-authority Byzantine quorum)
- **React + Vite + Tailwind** — Frontend
- **Solana Wallet Adapter** — Phantom wallet integration
- **TypeScript** — End-to-end type safety

## Project Structure

```
jury-program/           # Anchor workspace
  programs/jury-program/
    src/lib.rs          # 479-line program (6 instructions, state machine)
  tests/
    jury-program.ts     # 5 integration tests (all pass)
  target/
    idl/jury_program.json
    deploy/jury_program.so  # 294KB BPF binary

jury-app/               # Frontend
  src/
    App.tsx             # Router + wallet providers
    pages/Landing.tsx   # Landing page
    pages/DisputeApp.tsx # Dispute list + creation
    pages/DisputeView.tsx # Individual dispute detail
    lib/useProgram.ts   # Anchor client hook
    lib/program.ts      # Program constants + helpers
    lib/idl.json        # Program IDL
```

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

## Competitive Landscape

| Feature | Kleros (ETH) | Aragon Court (ETH) | JURY (Solana) |
|---------|-------------|-------------------|---------------|
| Randomness | Block hash | Commit-reveal | Orao VRF (BFT quorum) |
| Cost/dispute | $50-200 gas | $30-100 gas | ~$0.01 |
| Jury speed | Minutes | Minutes | ~2.5 seconds |
| Staking | PNK token | ANT token | SOL (native) |

## License

MIT
