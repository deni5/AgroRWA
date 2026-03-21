'use client'

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
// ВИПРАВЛЕНО: Видалено BackpackWalletAdapter з імпортів
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { SOLANA_RPC } from '@/lib/solana'
import { useMemo, type ReactNode } from 'react'
import '@solana/wallet-adapter-react-ui/styles.css'

export function WalletContextProvider({ children }: { children: ReactNode }) {
  // ВИПРАВЛЕНО: Видалено new BackpackWalletAdapter()
  // Більшість сучасних гаманців (включаючи Backpack) тепер 
  // автоматично підключаються через стандарт Wallet Standard
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ], [])

  return (
    <ConnectionProvider endpoint={SOLANA_RPC}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
