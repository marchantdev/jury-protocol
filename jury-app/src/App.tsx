import { useMemo } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import "@solana/wallet-adapter-react-ui/styles.css";

import Landing from "./pages/Landing";
import DisputeApp from "./pages/DisputeApp";
import DisputeView from "./pages/DisputeView";

const DEVNET_RPC = "https://api.devnet.solana.com";

export default function App() {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={DEVNET_RPC}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/app" element={<DisputeApp />} />
              <Route path="/disputes" element={<DisputeApp />} />
              <Route path="/dispute/:id" element={<DisputeView />} />
            </Routes>
          </BrowserRouter>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
