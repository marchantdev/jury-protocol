# Drip

## The Problem
DeFi claims to be permissionless, but every Solana protocol has a hidden cover charge: account rent. Each token account costs ~0.0029 SOL ($0.46 at $160/SOL). At 7% APY, deposits under ~$7 lose money to infrastructure costs before earning a cent of yield. This invisible floor excludes small depositors — not by design, but by economics.

## Why Now
ZK Compression (Light Protocol) went production-ready on Solana devnet and mainnet in late 2025, reducing account state costs by ~170x. Despite this, zero DeFi protocols have been built on compressed state. The infrastructure exists, the SDK works, the primitives are live — but the first real DeFi product hasn't been built yet. That's Drip.

## The Product
A yield vault where your account costs ~170x less. Deposit USDC, earn ~6.3% APY from Marinade SOL staking, withdraw anytime. The twist: compressed accounts make it economically viable for any deposit size — $100, $10, or $1.

## The Aha Moment
The break-even bar chart: a $10 deposit on standard Solana DeFi vs Drip. On standard: $0.46 account rent towers over $0.053 monthly yield — rent costs 8.7x your first month's yield. On Drip: $0.003 cost is invisible next to the same $0.053 yield. Same deposit, same yield, ~170x cheaper infrastructure.

## Proof
- ZK Compression: production-ready (https://www.zkcompression.com/, devnet + mainnet)
- Marinade: ~$2B TVL, ~7% APY, most liquid SOL staking solution
- Account cost comparison: 0.0029 SOL standard vs 0.000017 SOL compressed (ZK Compression docs)
- Break-even math: $6.60 standard vs $0.04 compressed (7% APY, Year 1)
- Zero DeFi competitors on compressed state (verified via Copilot search, 5,400+ projects)

## Target User
Crypto-native users with idle small balances across Solana wallets. Secondary: new users entering via Phantom/Jupiter who want a simple yield product. Not targeting users who need fiat onramps — targeting people already in the Solana ecosystem with dust.

## The Company
A compressed DeFi protocol starting with yield, expanding to lending, insurance, and other financial primitives that only work when account costs approach zero. Revenue: 10% fee on yield. At $10M TVL: $70K/year. At $100M TVL: $700K/year. The first protocol on compressed state becomes the reference implementation for the entire compressed DeFi stack.

## Why We Win
1. **ZERO competitors** in compressed DeFi (5,400+ projects, none use compression for DeFi)
2. **Winning category** — Theme #7 (Onchain Yield) = Reflect's Grand Prize + $250K accelerator category
3. **Every number is math, not marketing** — break-even analysis, account cost comparison, yield flow, revenue model all derived from real data
4. **Production-ready primitive** — ZK Compression works today, not "coming soon"
5. **Pattern match to Grand Prize winners** — TapeDrive (first product on new infra), Reflect (yield protocol) = Drip (first yield product on new infra)

## Demo Flow (5 bullets)
1. **Open Drip dashboard** — Connect Phantom wallet. Clean UI shows: "Your balance: $0. Account cost: $0.003 (vs $0.46 standard)."
2. **Deposit $10 USDC** — Click deposit, confirm transaction. Balance updates: "$10.00. Earning 6.3% APY via Marinade staking."
3. **Watch yield accrue** — Time accelerator shows 30 days in 30 seconds. Balance ticks: $10.01... $10.02... $10.053. "30 days of yield, powered by Solana staking."
4. **See the break-even chart** — Side-by-side bar chart: Standard ($0.46 rent vs $0.053 yield) vs Drip ($0.003 cost vs $0.053 yield). "On standard DeFi, rent eats 8.7x your monthly yield. On Drip, it's invisible."
5. **Withdraw $10.053** — Click withdraw. Funds return to wallet. "You just earned yield on a deposit that would lose money on every other Solana protocol."

## One Sentence
**Drip is the first DeFi protocol on ZK Compression — making yield accessible at any deposit size by reducing account costs ~170x.**
