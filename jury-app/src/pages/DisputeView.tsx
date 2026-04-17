import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Scale, ArrowLeft, RefreshCw, ExternalLink } from "lucide-react";
import { STATUS_LABELS, STATUS_COLORS, statusToIndex } from "../lib/program";
import { useProgram, fetchDispute, DisputeAccount } from "../lib/useProgram";

export default function DisputeView() {
  const { id } = useParams<{ id: string }>();
  const { connected } = useWallet();
  const { program } = useProgram();
  const [dispute, setDispute] = useState<DisputeAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!program || !id) return;
    setLoading(true);
    setError(null);

    let disputePDA: PublicKey;
    try {
      disputePDA = new PublicKey(id);
    } catch {
      setError("Invalid dispute address");
      setLoading(false);
      return;
    }

    fetchDispute(program, disputePDA)
      .then((d) => {
        if (!d) setError("Dispute not found on-chain");
        else setDispute(d);
      })
      .catch(() => setError("Failed to fetch dispute"))
      .finally(() => setLoading(false));
  }, [program, id]);

  const zeroPk = "11111111111111111111111111111111";

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
        <Link to="/app" className="flex items-center gap-1 text-jury-muted text-sm mb-6 hover:text-jury-text transition-colors">
          <ArrowLeft size={16} /> Back to disputes
        </Link>

        {loading ? (
          <div className="card text-center py-12">
            <RefreshCw className="animate-spin mx-auto mb-3 text-jury-muted" size={24} />
            <p className="text-jury-muted">Loading dispute from devnet...</p>
          </div>
        ) : error ? (
          <div className="card text-center py-12">
            <p className="text-red-400 mb-3">{error}</p>
            <Link to="/app" className="text-jury-green text-sm hover:underline">
              Back to disputes
            </Link>
          </div>
        ) : dispute ? (
          <div className="space-y-4">
            {/* Status & Description */}
            <div className="card">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-lg font-bold text-jury-text flex-1 mr-4">{dispute.description}</h2>
                {(() => {
                  const si = statusToIndex(dispute.status);
                  return (
                    <span
                      className="px-3 py-1 rounded text-sm font-mono whitespace-nowrap"
                      style={{
                        color: STATUS_COLORS[si],
                        backgroundColor: STATUS_COLORS[si] + "15",
                        border: `1px solid ${STATUS_COLORS[si]}30`,
                      }}
                    >
                      {STATUS_LABELS[si]}
                    </span>
                  );
                })()}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-jury-muted block text-xs mb-1">Stake</span>
                  <span className="text-jury-text font-mono">
                    {(dispute.stakeLamports.toNumber() / LAMPORTS_PER_SOL).toFixed(4)} SOL
                  </span>
                </div>
                <div>
                  <span className="text-jury-muted block text-xs mb-1">Created</span>
                  <span className="text-jury-text font-mono">
                    {new Date(dispute.createdAt.toNumber() * 1000).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Parties */}
            <div className="card">
              <h3 className="text-sm font-semibold text-jury-muted mb-3">Parties</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-jury-muted">Plaintiff</span>
                  <a
                    href={`https://explorer.solana.com/address/${dispute.plaintiff.toBase58()}?cluster=devnet`}
                    target="_blank"
                    rel="noopener"
                    className="text-jury-green text-xs font-mono flex items-center gap-1 hover:underline"
                  >
                    {dispute.plaintiff.toBase58().slice(0, 8)}...{dispute.plaintiff.toBase58().slice(-8)}
                    <ExternalLink size={10} />
                  </a>
                </div>
                {dispute.defendant.toBase58() !== zeroPk && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-jury-muted">Defendant</span>
                    <a
                      href={`https://explorer.solana.com/address/${dispute.defendant.toBase58()}?cluster=devnet`}
                      target="_blank"
                      rel="noopener"
                      className="text-jury-green text-xs font-mono flex items-center gap-1 hover:underline"
                    >
                      {dispute.defendant.toBase58().slice(0, 8)}...{dispute.defendant.toBase58().slice(-8)}
                      <ExternalLink size={10} />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Jury */}
            {dispute.jury.some((j) => j.toBase58() !== zeroPk) && (
              <div className="card">
                <h3 className="text-sm font-semibold text-jury-muted mb-3">Jury Panel</h3>
                <div className="space-y-2">
                  {dispute.jury
                    .filter((j) => j.toBase58() !== zeroPk)
                    .map((j, i) => {
                      const vote = dispute.votes[i];
                      const voteLabel = vote === 0 ? "Pending" : vote === 1 ? "Plaintiff" : "Defendant";
                      const voteColor = vote === 0 ? "#6b7280" : vote === 1 ? "#3b82f6" : "#f59e0b";
                      return (
                        <div key={i} className="flex items-center justify-between">
                          <a
                            href={`https://explorer.solana.com/address/${j.toBase58()}?cluster=devnet`}
                            target="_blank"
                            rel="noopener"
                            className="text-jury-text text-xs font-mono flex items-center gap-1 hover:text-jury-green"
                          >
                            Juror {i + 1}: {j.toBase58().slice(0, 6)}...{j.toBase58().slice(-6)}
                            <ExternalLink size={10} />
                          </a>
                          <span className="text-xs font-mono" style={{ color: voteColor }}>
                            {voteLabel}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Verdict */}
            {dispute.winner > 0 && (
              <div className="card border-jury-green/30">
                <h3 className="text-sm font-semibold text-jury-green mb-2">Verdict</h3>
                <p className="text-jury-text text-sm">
                  Winner: <span className="font-mono">{dispute.winner === 1 ? "Plaintiff" : "Defendant"}</span>
                </p>
                <p className="text-jury-muted text-xs mt-1">
                  Combined stake: {((dispute.stakeLamports.toNumber() * 2) / LAMPORTS_PER_SOL).toFixed(4)} SOL
                </p>
              </div>
            )}

            {/* On-chain link */}
            <div className="text-center">
              <a
                href={`https://explorer.solana.com/address/${id}?cluster=devnet`}
                target="_blank"
                rel="noopener"
                className="text-jury-green text-xs font-mono flex items-center gap-1 justify-center hover:underline"
              >
                View account on Solana Explorer <ExternalLink size={10} />
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
