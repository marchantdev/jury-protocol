# JURY — On-Chain Dispute Resolution with VRF Jury Selection

A Solana program (Anchor 0.32) that lets any two parties resolve disputes on-chain with verifiably random jury selection via [Orao VRF](https://docs.orao.network/).

## What Works

- **Open juror registration** — any wallet calls `register_juror` to join the global pool (up to 32 jurors)
- **Dispute lifecycle** — create_dispute → join_dispute → request_jury → reveal_jury → cast_vote → claim_stakes
- **Staking** — both parties stake equal SOL; winner takes all
- **VRF jury selection** — 3 jurors selected from the pool via Orao VRF randomness (requires devnet/mainnet)
- **Majority verdict** — 2-of-3 vote decides winner (plaintiff=1, defendant=2)
- **Append-only evidence log** — plaintiff/defendant submit evidence URIs as separate on-chain PDAs
- **Timeout/expiry** — disputes auto-expire after deadline; `expire_dispute` refunds both parties
- **CPI composability** — `example-escrow` program demonstrates embedding JURY via cross-program invocation
- **9 passing tests** covering all core instructions

## What Does NOT Work

- **VRF on localnet** — Orao VRF program is not available on localnet. Tests use `debug_set_jury` (admin-only test helper) to bypass VRF and test voting/claiming. On devnet, the full `request_jury` → `reveal_jury` flow works.
- **No juror incentives** — jurors are not rewarded for voting. No staking or reputation system for jurors.
- **No appeals** — verdict is final once 3 votes are cast.
- **No dynamic jury size** — fixed at 3 jurors.
- **No frontend deployment** — the React frontend (`jury-app/`) connects to devnet but has not been deployed to a public URL.

## Quick Start

### Prerequisites

- [Rust](https://rustup.rs/) (stable)
- [Solana CLI](https://docs.solanalabs.com/cli/install) (v1.18+)
- [Anchor CLI](https://www.anchor-lang.com/docs/installation) (v0.32+)
- Node.js 18+

### Build & Test

```bash
cd jury-program
npm install
anchor build
npm test
```

`npm test` runs `anchor test --validator legacy` which spins up a local validator, deploys the program, and runs all 9 tests.

### Deploy to Devnet

```bash
solana config set --url devnet
anchor deploy --provider.cluster devnet
```

After deploying, note the program ID and update `jury-app/src/lib/program.ts` if it differs from the checked-in value.

## Architecture

```
jury-program/
├── programs/
│   ├── jury-program/src/lib.rs    # Core program (11 instructions)
│   └── example-escrow/src/lib.rs  # CPI example
├── tests/
│   └── jury-program.ts            # 9 integration tests
└── Anchor.toml
```

### Instructions

| Instruction | Description |
|-------------|-------------|
| `initialize_juror_pool` | Admin creates empty juror pool PDA |
| `register_juror` | Any wallet registers as a juror (open, up to 32) |
| `create_dispute` | Plaintiff opens dispute, stakes SOL, sets deadline |
| `join_dispute` | Defendant joins, stakes matching SOL |
| `submit_evidence` | Plaintiff/defendant appends evidence URI (on-chain PDA) |
| `request_jury` | Triggers Orao VRF randomness request |
| `reveal_jury` | Reads VRF result, selects 3 jurors from pool |
| `cast_vote` | Selected juror votes (1=plaintiff, 2=defendant) |
| `claim_stakes` | Winner withdraws combined stakes |
| `expire_dispute` | Anyone expires a dispute past its deadline; refunds parties |
| `debug_set_jury` | Test helper: admin sets jury directly (localnet only) |

### Accounts

- **Dispute** — PDA seeded by `["dispute", plaintiff, dispute_id]`. Holds all dispute state.
- **JurorPool** — singleton PDA seeded by `["juror_pool"]`. Stores up to 32 registered juror pubkeys.
- **EvidenceEntry** — PDA seeded by `["evidence", dispute, index]`. One per evidence submission, append-only.

## License

ISC
