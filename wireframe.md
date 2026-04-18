# Jury — Wireframe

## Screen 1: Home / Create Dispute
```
+--------------------------------------------------+
|  JURY                              [Connect Wallet]|
+--------------------------------------------------+
|                                                    |
|   Decentralized Dispute Resolution                 |
|   Powered by verifiable on-chain VRF jury          |
|                                                    |
|   [Open a Dispute]                                 |
|                                                    |
+--------------------------------------------------+
```
CTA: "Open a Dispute" → Screen 2

## Screen 2: Dispute Form
```
+--------------------------------------------------+
|  New Dispute                        [Back]         |
+--------------------------------------------------+
|  Title:         [________________________]         |
|  Description:   [________________________]         |
|  Evidence URL:  [________________________]         |
|  Respondent:    [wallet address__________]         |
|  Stake (SOL):   [0.1____]                          |
|                                                    |
|  [Submit Dispute]  ← calls Anchor program          |
+--------------------------------------------------+
```

## Screen 3: Dispute Dashboard
```
+--------------------------------------------------+
|  Dispute #1234          Status: JURY_SELECTION     |
+--------------------------------------------------+
|  Claim: "Payment not received for delivered work"  |
|  Respondent: 7xK...mNp                             |
|  Stake: 0.1 SOL                                    |
|                                                    |
|  Jury Selection (VRF pending)                      |
|  ┌─────────────────────────────────────────────┐  |
|  │  VRF Request: 4tF...3kL  [View on Explorer] │  |
|  │  Jurors: [waiting for VRF fulfillment...]   │  |
|  └─────────────────────────────────────────────┘  |
|                                                    |
|  [Vote: Claimant Wins]  [Vote: Respondent Wins]    |
+--------------------------------------------------+
```

## Screen 4: Verdict
```
+--------------------------------------------------+
|  Dispute #1234              Status: RESOLVED       |
+--------------------------------------------------+
|  Verdict: Claimant Wins (3/3 jurors)               |
|  VRF Proof: 8xQ...7nR  [Verified on-chain]         |
|  Tx: 9kM...2pL          [View on Explorer]         |
|                                                    |
|  Prize distributed: 0.1 SOL → Claimant             |
+--------------------------------------------------+
```

## Navigation
- Header: Logo + wallet connect (all screens)
- Home → Create Dispute → Dashboard → Verdict
- 4 screens, linear flow
- 3 features: create dispute, VRF jury selection, verdict + payout
