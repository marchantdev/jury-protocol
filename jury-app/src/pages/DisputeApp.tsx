import { useState } from "react";
import { Link } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Scale, Plus, ArrowLeft } from "lucide-react";
import { STATUS_LABELS, STATUS_COLORS } from "../lib/program";

export default function DisputeApp() {
  const { connected } = useWallet();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="min-h-screen bg-jury-bg">
      {/* Header */}
      <header className="border-b border-jury-border bg-jury-bg/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between h-14 px-6">
          <Link to="/" className="flex items-center gap-2">
            <Scale className="text-jury-green" size={20} />
            <span className="font-semibold text-jury-text">JURY</span>
          </Link>
          <WalletMultiButton />
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {!connected ? (
          <div className="card text-center py-12">
            <Scale className="text-jury-green mx-auto mb-4" size={40} />
            <h2 className="text-xl font-bold text-jury-text mb-2">Connect your wallet</h2>
            <p className="text-jury-muted mb-6">Connect a Solana wallet to create or join disputes.</p>
            <WalletMultiButton />
          </div>
        ) : showCreate ? (
          <CreateDispute onBack={() => setShowCreate(false)} />
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-jury-text">Disputes</h1>
              <button className="btn-primary flex items-center gap-2" onClick={() => setShowCreate(true)}>
                <Plus size={16} /> New Dispute
              </button>
            </div>
            <DisputeList />
          </>
        )}
      </div>
    </div>
  );
}

function CreateDispute({ onBack }: { onBack: () => void }) {
  const { publicKey, sendTransaction } = useWallet();
  const [description, setDescription] = useState("");
  const [stakeSOL, setStakeSOL] = useState("0.1");
  const [submitting, setSubmitting] = useState(false);
  const [txSig, setTxSig] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!publicKey) return;
    setSubmitting(true);
    try {
      // For demo: we'll show the intent but note program isn't deployed yet
      // In production this would call the Anchor program
      setTxSig("DEMO_MODE_PROGRAM_NOT_YET_DEPLOYED");
    } catch (e: any) {
      console.error(e);
      alert("Failed: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-jury-muted text-sm mb-6 hover:text-jury-text transition-colors">
        <ArrowLeft size={16} /> Back to disputes
      </button>

      <div className="card">
        <h2 className="text-xl font-bold text-jury-text mb-6">Create a Dispute</h2>

        {txSig ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-jury-green/20 flex items-center justify-center mx-auto mb-4">
              <Scale className="text-jury-green" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-jury-text mb-2">Dispute Created</h3>
            <p className="text-jury-muted text-sm mb-4">
              {txSig === "DEMO_MODE_PROGRAM_NOT_YET_DEPLOYED"
                ? "Program deployment pending — dispute will be created once live on devnet."
                : "Transaction confirmed on Solana Devnet."}
            </p>
            {txSig !== "DEMO_MODE_PROGRAM_NOT_YET_DEPLOYED" && (
              <a
                href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`}
                target="_blank"
                rel="noopener"
                className="text-jury-green text-sm font-mono hover:underline"
              >
                View on Explorer
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-jury-muted mb-1">Description</label>
              <textarea
                className="w-full bg-jury-surface-alt border border-jury-border rounded-md px-3 py-2 text-jury-text text-sm resize-none focus:outline-none focus:border-jury-green"
                rows={3}
                maxLength={256}
                placeholder="Describe the dispute..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <span className="text-xs text-jury-muted">{description.length}/256</span>
            </div>

            <div>
              <label className="block text-sm text-jury-muted mb-1">Stake (SOL)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="w-full bg-jury-surface-alt border border-jury-border rounded-md px-3 py-2 text-jury-text text-sm focus:outline-none focus:border-jury-green"
                value={stakeSOL}
                onChange={(e) => setStakeSOL(e.target.value)}
              />
              <span className="text-xs text-jury-muted">Each party stakes this amount. Winner takes all.</span>
            </div>

            <button
              className="btn-primary w-full py-3 mt-2"
              disabled={!description || submitting || !stakeSOL}
              onClick={handleCreate}
            >
              {submitting ? "Creating..." : `Create Dispute (Stake ${stakeSOL} SOL)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function DisputeList() {
  // Demo disputes to show the UI flow
  const demoDisputes = [
    {
      id: "abc123",
      description: "Payment for freelance work not delivered",
      plaintiff: "7xKXt...9dPa",
      defendant: "3mBQf...7zKe",
      stake: 0.5,
      status: 3,
      jury: ["9aRt...", "4bZk...", "8cLm..."],
      votes: [1, 2, 0],
    },
    {
      id: "def456",
      description: "NFT metadata disputed after sale",
      plaintiff: "5yNWp...2hFg",
      defendant: null,
      stake: 0.25,
      status: 0,
      jury: [],
      votes: [],
    },
  ];

  return (
    <div className="space-y-3">
      {demoDisputes.map((d) => {
        const statusIdx = d.status;
        return (
          <div key={d.id} className="card hover:border-jury-green/30 transition-colors cursor-pointer">
            <div className="flex items-start justify-between mb-2">
              <p className="text-jury-text text-sm font-medium flex-1 mr-4">{d.description}</p>
              <span
                className="px-2 py-0.5 rounded text-xs font-mono whitespace-nowrap"
                style={{
                  color: STATUS_COLORS[statusIdx],
                  backgroundColor: STATUS_COLORS[statusIdx] + "15",
                  border: `1px solid ${STATUS_COLORS[statusIdx]}30`,
                }}
              >
                {STATUS_LABELS[statusIdx]}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-jury-muted">
              <span>Stake: {d.stake} SOL</span>
              <span>Plaintiff: {d.plaintiff}</span>
              {d.defendant && <span>Defendant: {d.defendant}</span>}
            </div>
            {d.jury.length > 0 && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="text-jury-green">Jury:</span>
                {d.jury.map((j, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-jury-surface-alt text-jury-muted font-mono">
                    {j} {d.votes[i] ? (d.votes[i] === 1 ? "P" : "D") : "?"}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
      <p className="text-center text-jury-muted text-xs mt-6">
        Demo data — connect to devnet to see live disputes
      </p>
    </div>
  );
}
