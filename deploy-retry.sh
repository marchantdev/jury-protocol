#!/bin/bash
# Retry devnet airdrop + deploy when rate limit resets
# Run periodically: bash deploy-retry.sh

set -e
cd "$(dirname "$0")/jury-program"

echo "$(date) — Checking balance..."
BAL=$(solana balance --url devnet 2>/dev/null | awk '{print $1}')
echo "Balance: $BAL SOL"

# Need ~2.1 SOL total
NEED=$(echo "$BAL < 2.1" | bc -l)
if [ "$NEED" = "1" ]; then
  echo "Need more SOL. Trying airdrop..."
  if solana airdrop 2 --url devnet 2>/dev/null; then
    echo "Airdrop succeeded!"
  else
    echo "Airdrop still rate-limited. Will retry later."
    exit 1
  fi
fi

echo "Deploying..."
anchor deploy --provider.cluster devnet 2>&1
echo "$(date) — Deploy complete!"
solana program show --url devnet 4hFoUmi8NQnMS8icdTZWnP1wzYrDTpph4qTUjGCsjv15
