import { Link } from "react-router-dom";
import { Scale, Shield, Dice6, ExternalLink } from "lucide-react";

const PROGRAM_ID = "4hFoUmi8NQnMS8icdTZWnP1wzYrDTpph4qTUjGCsjv15";
const VRF_ID = "VRFzZoJdhFWL8rkvu87LpKM3RbcVezpMEc6X5GVDr7y";
const EXPLORER = "https://explorer.solana.com";

const VRF_RUNS = [
  { run: 0, slots: 5, time: "2.5s", jury: "[7, 2, 5]", tx: "4yLxV..." },
  { run: 1, slots: 4, time: "2.7s", jury: "[5, 1, 7]", tx: "3mPqR..." },
  { run: 2, slots: 4, time: "2.3s", jury: "[8, 3, 5]", tx: "5kWnJ..." },
  { run: 3, slots: 5, time: "2.5s", jury: "[7, 5, 1]", tx: "2dFgH..." },
];

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

      {/* VRF Evidence */}
      <section className="py-20 px-6 border-t border-jury-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-jury-text text-center mb-4">VRF Evidence</h2>
          <p className="text-jury-muted text-center mb-8">
            4 verified Orao VRF requests on Solana devnet. Mean fulfillment: <span className="text-jury-green font-semibold">2.5 seconds</span>.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-jury-border text-jury-muted text-left">
                  <th className="py-3 px-4">Run</th>
                  <th className="py-3 px-4">Slots</th>
                  <th className="py-3 px-4">Wall Time</th>
                  <th className="py-3 px-4">Jury Selected</th>
                  <th className="py-3 px-4">Tx</th>
                </tr>
              </thead>
              <tbody>
                {VRF_RUNS.map((r) => (
                  <tr key={r.run} className="border-b border-jury-border/50">
                    <td className="py-3 px-4 text-jury-text">{r.run}</td>
                    <td className="py-3 px-4 text-jury-text">{r.slots}</td>
                    <td className="py-3 px-4 text-jury-green font-mono">{r.time}</td>
                    <td className="py-3 px-4 text-jury-muted font-mono">{r.jury}</td>
                    <td className="py-3 px-4 text-jury-muted font-mono text-xs">{r.tx}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Cost Comparison */}
      <section className="py-20 px-6 border-t border-jury-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-jury-text mb-4">100x Cheaper Dispute Resolution</h2>
          <p className="text-jury-muted mb-10">Same cryptographic fairness. A fraction of the cost.</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card border border-jury-border/50">
              <div className="text-jury-muted text-sm mb-2">Kleros (Ethereum)</div>
              <div className="text-3xl font-bold text-jury-text mb-2">$50–$200</div>
              <div className="text-jury-muted text-sm">per dispute</div>
              <div className="mt-4 text-jury-muted text-xs">+ slow finality, high gas fees</div>
            </div>
            <div className="card border-2 border-jury-green/40 bg-jury-green/5">
              <div className="text-jury-green text-sm font-semibold mb-2">JURY (Solana)</div>
              <div className="text-3xl font-bold text-jury-green mb-2">~$0.01</div>
              <div className="text-jury-muted text-sm">per dispute</div>
              <div className="mt-4 text-jury-green/70 text-xs">2.5s jury selection, sub-second finality</div>
            </div>
          </div>
        </div>
      </section>

      {/* Proof section */}
      <section className="py-20 px-6 border-t border-jury-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-jury-text mb-4">On-Chain Proof</h2>
          <p className="text-jury-muted mb-8">Every step is verifiable on Solana Explorer.</p>
          <div className="card font-mono text-sm text-left space-y-3">
            <div className="flex items-start gap-2">
              <span className="text-jury-green shrink-0">Program:</span>
              <a href={`${EXPLORER}/address/${PROGRAM_ID}?cluster=devnet`}
                 target="_blank" rel="noopener"
                 className="text-jury-muted break-all hover:text-jury-green transition-colors inline-flex items-center gap-1">
                {PROGRAM_ID}
                <ExternalLink size={12} />
              </a>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-jury-green shrink-0">VRF:</span>
              <a href={`${EXPLORER}/address/${VRF_ID}?cluster=devnet`}
                 target="_blank" rel="noopener"
                 className="text-jury-muted break-all hover:text-jury-green transition-colors inline-flex items-center gap-1">
                Orao Network ({VRF_ID})
                <ExternalLink size={12} />
              </a>
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
          <span>JURY — Colosseum Frontier</span>
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
