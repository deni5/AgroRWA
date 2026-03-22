"use client";

import { WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo } from 'react';
import { clusterApiUrl } from '@solana/web3.js';

// ВАЖЛИВО: Імпорт стилів, без яких кнопка не покаже вікно гаманця
import '@solana/wallet-adapter-react-ui/styles.css';

const queryClient = new QueryClient();

export function SolanaProvider({ children }: { children: React.ReactNode }) {
  // Використовуємо змінну з Vercel або дефолтний devnet
  const endpoint = useMemo(() => 
    process.env.NEXT_PUBLIC_SOLANA_RPC || clusterApiUrl('devnet'), 
  []);

  const wallets = useMemo(() => [], []); 

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
