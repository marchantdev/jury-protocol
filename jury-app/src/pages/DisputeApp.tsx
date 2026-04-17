import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Scale, Plus, ArrowLeft, RefreshCw } from "lucide-react";
import { STATUS_LABELS, STATUS_COLORS, statusToIndex } from "../lib/program";
import {
  useProgram,
  createDisputeTx,
  fetchAllDisputes,
  DisputeAccount,
} from "../lib/useProgram";

export default function DisputeApp() {
  const { connected } = useWallet();
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="min-h-screen bg-jury-bg">
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
  const { publicKey } = useWallet();
  const { program } = useProgram();
  const [description, setDescription] = useState("");
  const [stakeSOL, setStakeSOL] = useState("0.1");
  const [submitting, setSubmitting] = useState(false);
  const [txSig, setTxSig] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!publicKey || !program) return;
    setSubmitting(true);
    setError(null);
    try {
      const sig = await createDisputeTx(
        program,
        publicKey,
        description,
        parseFloat(stakeSOL)
      );
      setTxSig(sig);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Transaction failed");
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
            <p className="text-jury-muted text-sm mb-4">Transaction confirmed on Solana Devnet.</p>
            <a
              href={`https://explorer.solana.com/tx/${txSig}?cluster=devnet`}
              target="_blank"
              rel="noopener"
              className="text-jury-green text-sm font-mono hover:underline"
            >
              View on Explorer
            </a>
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

            {error && (
              <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <button
              className="btn-primary w-full py-3 mt-2"
              disabled={!description || submitting || !stakeSOL || !program}
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
  const { program } = useProgram();
  const [disputes, setDisputes] = useState<DisputeAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDisputes = useCallback(async () => {
    if (!program) return;
    setLoading(true);
    setError(null);
    try {
      const all = await fetchAllDisputes(program);
      // Sort by created_at descending
      all.sort((a, b) => b.createdAt.toNumber() - a.createdAt.toNumber());
      setDisputes(all);
    } catch (e: any) {
      console.error(e);
      setError("Failed to fetch disputes");
    } finally {
      setLoading(false);
    }
  }, [program]);

  useEffect(() => {
    loadDisputes();
  }, [loadDisputes]);

  if (loading) {
    return (
      <div className="text-center py-12 text-jury-muted">
        <RefreshCw className="animate-spin mx-auto mb-3" size={24} />
        Loading disputes from devnet...
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center py-8">
        <p className="text-red-400 mb-3">{error}</p>
        <button onClick={loadDisputes} className="text-jury-green text-sm hover:underline">
          Retry
        </button>
      </div>
    );
  }

  const zeroPk = "11111111111111111111111111111111";

  return (
    <div className="space-y-3">
      <div className="flex justify-end mb-2">
        <button
          onClick={loadDisputes}
          className="flex items-center gap-1 text-jury-muted text-xs hover:text-jury-green transition-colors"
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {disputes.length === 0 ? (
        <div className="card text-center py-12">
          <Scale className="text-jury-muted mx-auto mb-3" size={32} />
          <p className="text-jury-muted">No disputes yet. Create the first one.</p>
        </div>
      ) : (
        disputes.map((d) => {
          const statusIdx = statusToIndex(d.status);
          const stakeSOL = d.stakeLamports.toNumber() / LAMPORTS_PER_SOL;
          const plaintiff = d.plaintiff.toBase58();
          const defendant = d.defendant.toBase58();
          const hasDefendant = defendant !== zeroPk;
          const juryActive = d.jury.some((j) => j.toBase58() !== zeroPk);

          return (
            <Link
              key={d.publicKey.toBase58()}
              to={`/dispute/${d.publicKey.toBase58()}`}
              className="card block hover:border-jury-green/30 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-jury-text text-sm font-medium flex-1 mr-4">{d.description}</p>
                <span
                  className="px-2 py-0.5 rounded text-xs font-mono whitespace-nowrap"
                  style={{
                    color: STATUS_COLORS[statusIdx] || "#6b7280",
                    backgroundColor: (STATUS_COLORS[statusIdx] || "#6b7280") + "15",
                    border: `1px solid ${STATUS_COLORS[statusIdx] || "#6b7280"}30`,
                  }}
                >
                  {STATUS_LABELS[statusIdx] || "Unknown"}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-jury-muted">
                <span>Stake: {stakeSOL} SOL</span>
                <span>Plaintiff: {plaintiff.slice(0, 4)}...{plaintiff.slice(-4)}</span>
                {hasDefendant && (
                  <span>Defendant: {defendant.slice(0, 4)}...{defendant.slice(-4)}</span>
                )}
              </div>
              {juryActive && (
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className="text-jury-green">Jury:</span>
                  {d.jury
                    .filter((j) => j.toBase58() !== zeroPk)
                    .map((j, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-jury-surface-alt text-jury-muted font-mono">
                        {j.toBase58().slice(0, 4)}...{j.toBase58().slice(-4)}{" "}
                        {d.votes[i] ? (d.votes[i] === 1 ? "P" : "D") : "?"}
                      </span>
                    ))}
                </div>
              )}
            </Link>
          );
        })
      )}

      <p className="text-center text-jury-muted text-xs mt-6">
        Live data from Solana devnet &middot; Program{" "}
        <a
          href="https://explorer.solana.com/address/4hFoUmi8NQnMS8icdTZWnP1wzYrDTpph4qTUjGCsjv15?cluster=devnet"
          target="_blank"
          rel="noopener"
          className="text-jury-green hover:underline"
        >
          4hFo...jv15
        </a>
      </p>
    </div>
  );
}
