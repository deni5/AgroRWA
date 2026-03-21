'use client'

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { SOLANA_RPC } from '@/lib/solana'
import { useMemo, type ReactNode, useEffect, useState } from 'react'
import '@solana/wallet-adapter-react-ui/styles.css'

export function WalletContextProvider({ children }: { children: ReactNode }) {
  // 1. Додаємо стан для запобігання помилок гідратації та рендерингу на сервері
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 2. Валідація RPC (запобігає краху білду, якщо ENV не завантажився)
  const endpoint = useMemo(() => {
    if (!SOLANA_RPC || SOLANA_RPC === "") {
      // Повертаємо публічний вузол як запасний варіант для білду
      return "https://api.mainnet-beta.solana.com" 
    }
    return SOLANA_RPC
  }, [])

  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ], [])

  // Якщо ми на сервері (під час білду), рендеримо тільки дітей без провайдерів гаманця,
  // щоб уникнути спроб підключення до неіснуючих RPC
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
