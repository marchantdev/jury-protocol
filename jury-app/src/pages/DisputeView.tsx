import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Scale, ArrowLeft, RefreshCw, ExternalLink, UserPlus, Shuffle, CheckCircle, Trophy, FileText, Clock, Users } from "lucide-react";
import { STATUS_LABELS, STATUS_COLORS, statusToIndex } from "../lib/program";
import {
  useProgram, fetchDispute, DisputeAccount, EvidenceEntryAccount,
  joinDisputeTx, requestJuryTx, revealJuryTx, castVoteTx, claimStakesTx,
  submitEvidenceTx, expireDisputeTx, registerJurorTx, fetchEvidenceEntries,
  fetchJurorPool,
} from "../lib/useProgram";

export default function DisputeView() {
  const { id } = useParams<{ id: string }>();
  const { connected, publicKey } = useWallet();
  const { program, readOnlyProgram } = useProgram();
  const activeProgram = program || readOnlyProgram;
  const [dispute, setDispute] = useState<DisputeAccount | null>(null);
  const [evidence, setEvidence] = useState<EvidenceEntryAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [evidenceInput, setEvidenceInput] = useState("");
  const [isRegisteredJuror, setIsRegisteredJuror] = useState(false);
  const [jurorPoolSize, setJurorPoolSize] = useState(0);

  useEffect(() => {
    if (!activeProgram || !id) return;
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

    fetchDispute(activeProgram, disputePDA)
      .then(async (d) => {
        if (!d) { setError("Dispute not found on-chain"); return; }
        setDispute(d);
        if (d.evidenceCount > 0) {
          const entries = await fetchEvidenceEntries(activeProgram, disputePDA, d.evidenceCount);
          setEvidence(entries);
        }
      })
      .catch(() => setError("Failed to fetch dispute"))
      .finally(() => setLoading(false));
  }, [activeProgram, id]);

  // Check juror pool status
  useEffect(() => {
    if (!activeProgram || !publicKey) return;
    fetchJurorPool(activeProgram).then((pool) => {
      if (pool) {
        setJurorPoolSize(pool.count);
        setIsRegisteredJuror(pool.jurors.some((j) => j.toBase58() === publicKey.toBase58()));
      }
    });
  }, [activeProgram, publicKey]);

  const reload = useCallback(() => {
    if (!activeProgram || !id) return;
    setLoading(true);
    fetchDispute(activeProgram, new PublicKey(id))
      .then(async (d) => {
        if (d) {
          setDispute(d);
          if (d.evidenceCount > 0) {
            const entries = await fetchEvidenceEntries(activeProgram, new PublicKey(id), d.evidenceCount);
            setEvidence(entries);
          }
        }
      })
      .finally(() => setLoading(false));
  }, [activeProgram, id]);

  // Auto-poll every 5s for active disputes
  useEffect(() => {
    if (!activeProgram || !id || !dispute) return;
    const si = statusToIndex(dispute.status);
    if (si >= 5) return;
    const interval = setInterval(() => {
      fetchDispute(activeProgram, new PublicKey(id))
        .then((d) => { if (d) setDispute(d); })
        .catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [activeProgram, id, dispute?.status]);

  const runAction = useCallback(async (label: string, fn: () => Promise<string>) => {
    setActionLoading(true);
    setActionMsg(null);
    try {
      const sig = await fn();
      setActionMsg(`${label} confirmed: ${sig.slice(0, 12)}...`);
      setTimeout(reload, 1500);
    } catch (e: any) {
      setActionMsg(`${label} failed: ${e?.message?.slice(0, 80) || "Unknown error"}`);
    } finally {
      setActionLoading(false);
    }
  }, [reload]);

  const zeroPk = "11111111111111111111111111111111";

  const si = dispute ? statusToIndex(dispute.status) : -1;
  const myKey = publicKey?.toBase58() ?? "";
  const isPlaintiff = dispute?.plaintiff.toBase58() === myKey;
  const isDefendant = dispute?.defendant.toBase58() === myKey;
  const isParty = isPlaintiff || isDefendant;
  const isJuror = dispute?.jury.some((j) => j.toBase58() === myKey) ?? false;
  const myJurorIdx = dispute?.jury.findIndex((j) => j.toBase58() === myKey) ?? -1;
  const hasVoted = myJurorIdx >= 0 && (dispute?.votes[myJurorIdx] ?? 0) > 0;
  const isWinner = dispute && dispute.winner > 0 &&
    ((dispute.winner === 1 && isPlaintiff) || (dispute.winner === 2 && isDefendant));
  const isExpired = dispute?.deadline && Date.now() / 1000 > dispute.deadline.toNumber();

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
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-jury-muted block text-xs mb-1">Stake</span>
                  <span className="text-jury-text font-mono">
                    {(dispute.stakeLamports.toNumber() / LAMPORTS_PER_SOL).toFixed(4)} SOL
                  </span>
                </div>
                <div>
                  <span className="text-jury-muted block text-xs mb-1">Created</span>
                  <span className="text-jury-text font-mono text-xs">
                    {new Date(dispute.createdAt.toNumber() * 1000).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-jury-muted block text-xs mb-1">
                    <Clock size={10} className="inline mr-1" />Deadline
                  </span>
                  <span className={`font-mono text-xs ${isExpired ? "text-red-400" : "text-jury-text"}`}>
                    {dispute.deadline
                      ? new Date(dispute.deadline.toNumber() * 1000).toLocaleDateString()
                      : "—"}
                    {isExpired ? " (expired)" : ""}
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

            {/* Evidence Log */}
            {(evidence.length > 0 || (isParty && si >= 0 && si <= 3)) && (
              <div className="card">
                <h3 className="text-sm font-semibold text-jury-muted mb-3 flex items-center gap-1">
                  <FileText size={14} /> Evidence Log ({dispute.evidenceCount} entries)
                </h3>
                {evidence.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {evidence.map((e, i) => (
                      <div key={i} className="bg-jury-surface-alt rounded px-3 py-2 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-jury-muted">
                            {e.party.toBase58() === dispute.plaintiff.toBase58() ? "Plaintiff" : "Defendant"}
                            {" · "}#{e.index}
                          </span>
                          <span className="text-jury-muted font-mono">
                            {new Date(e.submittedAt.toNumber() * 1000).toLocaleString()}
                          </span>
                        </div>
                        <a
                          href={e.uri}
                          target="_blank"
                          rel="noopener"
                          className="text-jury-green hover:underline break-all"
                        >
                          {e.uri}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
                {connected && program && isParty && si >= 0 && si <= 3 && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Evidence URI (e.g. https://...)"
                      className="flex-1 bg-jury-surface-alt border border-jury-border rounded px-3 py-1.5 text-jury-text text-xs focus:outline-none focus:border-jury-green"
                      value={evidenceInput}
                      onChange={(e) => setEvidenceInput(e.target.value)}
                      maxLength={256}
                    />
                    <button
                      disabled={actionLoading || !evidenceInput}
                      onClick={() => {
                        const uri = evidenceInput;
                        setEvidenceInput("");
                        runAction("Submit Evidence", () =>
                          submitEvidenceTx(program, publicKey!, dispute!.publicKey, uri, dispute!.evidenceCount)
                        );
                      }}
                      className="btn-action text-xs"
                    >
                      <FileText size={12} /> Submit
                    </button>
                  </div>
                )}
              </div>
            )}

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

            {/* Actions */}
            {connected && program && (
              <div className="card border-jury-green/20">
                <h3 className="text-sm font-semibold text-jury-muted mb-3">Actions</h3>

                {actionMsg && (
                  <p className={`text-xs mb-3 font-mono ${actionMsg.includes("failed") ? "text-red-400" : "text-jury-green"}`}>
                    {actionMsg}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {/* Register as juror */}
                  {!isRegisteredJuror && (
                    <button
                      disabled={actionLoading}
                      onClick={() => runAction("Register as Juror", () =>
                        registerJurorTx(program, publicKey!)
                      )}
                      className="btn-action"
                    >
                      <Users size={14} /> Register as Juror ({jurorPoolSize} registered)
                    </button>
                  )}

                  {isRegisteredJuror && (
                    <span className="text-jury-green text-xs flex items-center gap-1 px-2">
                      <CheckCircle size={12} /> Registered juror
                    </span>
                  )}

                  {/* Join — open dispute, not the plaintiff */}
                  {si === 0 && !isPlaintiff && (
                    <button
                      disabled={actionLoading}
                      onClick={() => runAction("Join Dispute", () =>
                        joinDisputeTx(program, publicKey!, dispute!.publicKey)
                      )}
                      className="btn-action"
                    >
                      <UserPlus size={14} /> Join as Defendant
                    </button>
                  )}

                  {/* Request jury — awaiting jury (si=1) */}
                  {si === 1 && (
                    <button
                      disabled={actionLoading}
                      onClick={() => runAction("Request Jury", () =>
                        requestJuryTx(program, publicKey!, dispute!.publicKey)
                      )}
                      className="btn-action"
                    >
                      <Shuffle size={14} /> Request VRF Jury
                    </button>
                  )}

                  {/* Reveal jury — jury requested (si=2) */}
                  {si === 2 && (
                    <button
                      disabled={actionLoading}
                      onClick={() => runAction("Reveal Jury", () =>
                        revealJuryTx(program, dispute!)
                      )}
                      className="btn-action"
                    >
                      <Shuffle size={14} /> Reveal Jury
                    </button>
                  )}

                  {/* Vote — deliberating (si=3), user is juror, hasn't voted */}
                  {si === 3 && isJuror && !hasVoted && (
                    <>
                      <button
                        disabled={actionLoading}
                        onClick={() => runAction("Vote Plaintiff", () =>
                          castVoteTx(program, publicKey!, dispute!.publicKey, 1)
                        )}
                        className="btn-action"
                      >
                        <CheckCircle size={14} /> Vote Plaintiff
                      </button>
                      <button
                        disabled={actionLoading}
                        onClick={() => runAction("Vote Defendant", () =>
                          castVoteTx(program, publicKey!, dispute!.publicKey, 2)
                        )}
                        className="btn-action btn-action-alt"
                      >
                        <CheckCircle size={14} /> Vote Defendant
                      </button>
                    </>
                  )}

                  {/* Claim — decided (si=4), user is the winner */}
                  {si === 4 && isWinner && (
                    <button
                      disabled={actionLoading}
                      onClick={() => runAction("Claim Stakes", () =>
                        claimStakesTx(program, publicKey!, dispute!.publicKey)
                      )}
                      className="btn-action"
                    >
                      <Trophy size={14} /> Claim Stakes
                    </button>
                  )}

                  {/* Expire — past deadline, not yet decided/claimed/expired */}
                  {isExpired && si >= 0 && si <= 3 && (
                    <button
                      disabled={actionLoading}
                      onClick={() => runAction("Expire Dispute", () =>
                        expireDisputeTx(
                          program,
                          dispute!.publicKey,
                          dispute!.plaintiff,
                          dispute!.defendant.toBase58() !== zeroPk
                            ? dispute!.defendant
                            : dispute!.plaintiff
                        )
                      )}
                      className="btn-action border-red-400/30 text-red-400"
                    >
                      <Clock size={14} /> Expire & Refund
                    </button>
                  )}

                  {/* Refresh */}
                  <button
                    disabled={actionLoading}
                    onClick={reload}
                    className="px-3 py-1.5 rounded text-xs text-jury-muted border border-jury-border hover:border-jury-green/40 transition-colors flex items-center gap-1"
                  >
                    <RefreshCw size={12} className={actionLoading ? "animate-spin" : ""} /> Refresh
                  </button>
                </div>

                {actionLoading && (
                  <p className="text-jury-muted text-xs mt-2 flex items-center gap-1">
                    <RefreshCw size={12} className="animate-spin" /> Waiting for confirmation...
                  </p>
                )}
              </div>
            )}

            {!connected && (
              <div className="card text-center py-4">
                <p className="text-jury-muted text-sm mb-2">Connect your wallet to interact with this dispute</p>
                <WalletMultiButton />
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
