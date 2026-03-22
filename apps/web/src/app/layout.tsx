"use client";

import { WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from '../components/Navbar';
import { useMemo } from 'react';

const queryClient = new QueryClient();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const endpoint = "https://api.mainnet-beta.solana.com"; // Або ваш RPC

  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={[]} autoConnect>
              <WalletModalProvider>
                <Navbar />
                {children}
              </WalletModalProvider>
            </WalletProvider>
          </ConnectionProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
