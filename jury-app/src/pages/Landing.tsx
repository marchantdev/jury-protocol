import { Link } from "react-router-dom";
import { Scale, Shield, Dice6 } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-jury-bg">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-jury-border bg-jury-bg/80">
        <div className="max-w-5xl mx-auto flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-2.5">
            <Scale className="text-jury-green" size={24} />
            <span className="font-semibold text-lg text-jury-text">JURY</span>
          </div>
          <Link to="/app" className="btn-primary">Launch App</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-jury-border bg-jury-surface text-jury-muted text-xs mb-6">
            <span className="w-2 h-2 rounded-full bg-jury-green animate-pulse-green" />
            Built on Solana Devnet
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-jury-text leading-tight mb-6">
            Disputes settled by <br />
            <span className="text-jury-green">verifiably random</span> juries
          </h1>
          <p className="text-jury-muted text-lg max-w-xl mx-auto mb-10">
            JURY uses Orao VRF to select impartial jurors on-chain.
            No centralized arbitrator. No manipulation. Just cryptographic fairness.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/app" className="btn-primary text-base px-6 py-3">
              Open a Dispute
            </Link>
            <a href="https://github.com/marchantdev/jury-protocol" target="_blank" rel="noopener" className="btn-secondary text-base px-6 py-3">
              View Source
            </a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 border-t border-jury-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-jury-text text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <StepCard
              step={1}
              icon={<Scale size={28} />}
              title="File a Dispute"
              desc="Plaintiff creates a dispute and stakes SOL. Defendant joins and matches the stake. Funds are locked in the dispute PDA."
            />
            <StepCard
              step={2}
              icon={<Dice6 size={28} />}
              title="VRF Jury Selection"
              desc="Orao VRF generates verifiable randomness on-chain. Three jurors are selected from a pool of nine — no one can predict or influence the selection."
            />
            <StepCard
              step={3}
              icon={<Shield size={28} />}
              title="Verdict & Payout"
              desc="Jurors cast their votes. Majority wins. The winner claims both stakes directly from the on-chain escrow. No middleman."
            />
          </div>
        </div>
      </section>

      {/* Proof section */}
      <section className="py-20 px-6 border-t border-jury-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-jury-text mb-4">On-Chain Proof</h2>
          <p className="text-jury-muted mb-8">Every step is verifiable on Solana Explorer.</p>
          <div className="card font-mono text-sm text-left space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-jury-green">Program:</span>
              <span className="text-jury-muted break-all">4hFoUmi8NQnMS8icdTZWnP1wzYrDTpph4qTUjGCsjv15</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-jury-green">VRF:</span>
              <span className="text-jury-muted">Orao Network (VRFzZoJdhFWL8rkvu87LpKM3RbcVezpMEc6X5GVDr7y)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-jury-green">Network:</span>
              <span className="text-jury-muted">Solana Devnet</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-jury-border">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-jury-muted text-sm">
          <span>JURY — Colosseum Frontier R14</span>
          <span>Powered by Orao VRF</span>
        </div>
      </footer>
    </div>
  );
}

function StepCard({ step, icon, title, desc }: { step: number; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="card animate-slide-up" style={{ animationDelay: `${step * 100}ms` }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-jury-surface-alt flex items-center justify-center text-jury-green">
          {icon}
        </div>
        <span className="text-jury-muted text-xs font-mono">STEP {step}</span>
      </div>
      <h3 className="text-jury-text font-semibold mb-2">{title}</h3>
      <p className="text-jury-muted text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
