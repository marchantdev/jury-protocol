# JURY — Demo Flow

## Video Target: 60-90 seconds

### Scene 1: The Problem (0:00–0:10)

**Display text:** "Disputes in crypto resolve through centralized arbitration. The platform decides. You can't verify. You can't appeal."

**Phonetic voiceover:** "Disputes in crypto resolve through centralized arbitration. The platform decides. You can't verify. You can't appeal."

**Visual:** Dark background with text appearing, then a slash through "centralized arbitration"

---

### Scene 2: The Solution (0:10–0:20)

**Display text:** "JURY — On-chain dispute resolution with verifiably random juries on Solana"

**Phonetic voiceover:** "Jury. On-chain dispute resolution with verifiably random juries on Saul-ah-nah."

**Visual:** JURY logo appears, landing page loads showing the "How It Works" section

---

### Scene 3: Live Demo — Create Dispute (0:20–0:35)

**Display text:** "Create a Dispute" / wallet connection / form fill / transaction confirm

**Phonetic voiceover:** "Connect your Phantom wallet. Describe the dispute. Stake saul. The program creates a dispute P-D-A and locks your stake on-chain."

**Visual:**
1. Click "Launch App" on landing page
2. Click "Select Wallet" → Phantom connects
3. Click "New Dispute"
4. Type description, set stake to 0.1 SOL
5. Click "Create Dispute" → transaction confirms
6. Dispute appears in the list with status "Open"

---

### Scene 4: Live Demo — Defendant Joins + VRF Jury Selection (0:35–0:55)

**Display text:** "Defendant joins" / "VRF selects 3 jurors in 2.5 seconds"

**Phonetic voiceover:** "The defendant joins and matches the stake. Now Oh-rao V-R-F fires — four Byzantine authorities sign verifiable randomness. In two point five seconds, three jurors are selected from a pool of nine. No one can predict or manipulate who gets chosen."

**Visual:**
1. Defendant wallet joins the dispute → status changes to "Awaiting Jury"
2. VRF request fires → status "Jury Requested"
3. ~2.5s later → jury revealed, 3 juror addresses shown
4. Status transitions to "Deliberating"

---

### Scene 5: Live Demo — Voting + Resolution (0:55–1:10)

**Display text:** "Jurors vote" / "Majority verdict" / "Winner claims stakes"

**Phonetic voiceover:** "Selected jurors cast their votes on-chain. Majority wins. The winner claims both stakes — all verifiable on Saul-ah-nah Explorer. The entire lifecycle: file, select jury, vote, resolve — takes under thirty seconds."

**Visual:**
1. Three jurors vote (2 for plaintiff, 1 for defendant)
2. Status transitions to "Decided" — verdict shown
3. Winner clicks "Claim Stakes" → transaction confirms
4. Status "Claimed" — Explorer link shows funds transfer

---

### Scene 6: On-Chain Proof (1:10–1:25)

**Display text:** Program ID / VRF evidence / Explorer links

**Phonetic voiceover:** "Every step lives on Solana devnet. Program four-H-F-O. Four real V-R-F transactions verified. Mean jury selection: two point five seconds."

**Visual:**
1. Scroll to "On-Chain Proof" section on landing page
2. Show program ID linking to Explorer
3. Show VRF transaction signatures
4. Show latency table: 4 runs, mean 2.5 seconds

---

### Scene 7: Impact + Close (1:25–1:40)

**Display text:** Kleros $50-200 vs JURY $0.01 / "Cryptographic fairness for on-chain disputes"

**Phonetic voiceover:** "Kleros charges fifty to two hundred dollars per dispute on Ethereum. Jury costs one cent on Saul-ah-nah. Same fairness. One hundred times cheaper. Jury — cryptographic fairness for on-chain disputes."

**Visual:** Cost comparison table, then JURY logo + GitHub + Live URL

---

## Key Moments

1. **Full dispute lifecycle** — create → join → VRF jury → vote → claim (complete flow, not just creation)
2. **VRF evidence table** — 4 verified tx signatures with latency data
3. **Cost comparison** — $0.01 vs $50-200, visceral price delta
4. **Resolution speed** — entire dispute lifecycle in <30 seconds on devnet
