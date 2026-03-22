"use client";

import { WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo } from 'react';

const queryClient = new QueryClient();

export function SolanaProvider({ children }: { children: React.ReactNode }) {
  const endpoint = "https://api.mainnet-beta.solana.com";
  const wallets = useMemo(() => [], []); // Тут можна додати PhantomWalletAdapter тощо

  return (
    <QueryClientProvider client={queryClient}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            {children}
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </QueryClientProvider>
  );
}
