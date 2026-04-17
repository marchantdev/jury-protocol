import { useParams, Link } from "react-router-dom";
import { Scale, ArrowLeft } from "lucide-react";

export default function DisputeView() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-jury-bg">
      <header className="border-b border-jury-border bg-jury-bg/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between h-14 px-6">
          <Link to="/" className="flex items-center gap-2">
            <Scale className="text-jury-green" size={20} />
            <span className="font-semibold text-jury-text">JURY</span>
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <Link to="/app" className="flex items-center gap-1 text-jury-muted text-sm mb-6 hover:text-jury-text transition-colors">
          <ArrowLeft size={16} /> Back to disputes
        </Link>
        <div className="card text-center py-12">
          <h2 className="text-xl font-bold text-jury-text mb-2">Dispute {id?.slice(0, 8)}...</h2>
          <p className="text-jury-muted">
            Dispute detail view will load from on-chain data once the program is deployed to devnet.
          </p>
        </div>
      </div>
    </div>
  );
}
