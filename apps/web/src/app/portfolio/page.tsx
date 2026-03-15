'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import Link from 'next/link'
import { useVaultDeposits } from '@/hooks/useVault'
import { usePools } from '@/hooks/usePools'

function shortMint(m: string) { return `${m.slice(0, 6)}…${m.slice(-4)}` }

export default function PortfolioPage() {
  const { publicKey } = useWallet()
  const { data: deposits, isLoading: loadingDeposits } = useVaultDeposits()
  const { data: pools } = usePools()

  if (!publicKey) {
    return (
      <div className="max-w-lg mx-auto card text-center py-16 space-y-4">
        <p className="text-gray-400">Connect your wallet to view your portfolio.</p>
        <WalletMultiButton />
      </div>
    )
  }

  const activeDeposits = deposits?.filter((d) => !d.redeemed) ?? []
  const redeemedDeposits = deposits?.filter((d) => d.redeemed) ?? []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-100">Portfolio</h1>
        <p className="text-gray-400 mt-1 font-mono text-sm">{shortMint(publicKey.toBase58())}</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-agro-400">{activeDeposits.length}</p>
          <p className="text-sm text-gray-500 mt-1">Active Vault Deposits</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-gray-400">{redeemedDeposits.length}</p>
          <p className="text-sm text-gray-500 mt-1">Redeemed</p>
        </div>
        <div className="card text-center col-span-2 md:col-span-1">
          <p className="text-2xl font-bold text-blue-400">{pools?.length ?? 0}</p>
          <p className="text-sm text-gray-500 mt-1">Available Pools</p>
        </div>
      </div>

      {/* Vault deposits */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-100">Vault Deposits</h2>
          <Link href="/vault" className="btn-secondary text-sm py-1.5">Manage Vault</Link>
        </div>

        {loadingDeposits && (
          <div className="space-y-3 animate-pulse">
            {[...Array(2)].map((_, i) => <div key={i} className="card h-16 bg-gray-800" />)}
          </div>
        )}

        {!loadingDeposits && activeDeposits.length === 0 && (
          <div className="card text-center py-8 text-gray-500">
            No active vault deposits.{' '}
            <Link href="/vault" className="text-agro-400 underline">Deposit LP tokens</Link>
          </div>
        )}

        <div className="space-y-3">
          {activeDeposits.map((d) => {
            const locked = d.secondsRemaining > 0
            const unlockDate = new Date(d.unlockTime * 1000).toLocaleDateString()
            return (
              <div key={d.address} className="card flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="font-mono text-sm text-gray-300">{shortMint(d.lpMint)} LP</p>
                  <p className="text-sm text-gray-500">
                    Amount: {(Number(d.amount) / 1e6).toFixed(6)}
                  </p>
                </div>
                <div className="text-sm text-right">
                  {locked ? (
                    <>
                      <p className="text-yellow-400">🔒 Locked</p>
                      <p className="text-gray-500">Unlocks {unlockDate}</p>
                    </>
                  ) : (
                    <p className="text-agro-400">✅ Ready to redeem</p>
                  )}
                </div>
                <Link
                  href="/vault"
                  className={`btn-primary text-sm py-1.5 px-4 ${locked ? 'opacity-40 pointer-events-none' : ''}`}
                >
                  {locked ? 'Locked' : 'Redeem'}
                </Link>
              </div>
            )
          })}
        </div>
      </section>

      {/* Quick links */}
      <section>
        <h2 className="text-xl font-semibold text-gray-100 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/tokens" className="btn-secondary">Browse Tokens</Link>
          <Link href="/market" className="btn-secondary">Market</Link>
          <Link href="/swap" className="btn-secondary">Swap</Link>
          <Link href="/add-liquidity" className="btn-primary">+ Add Liquidity</Link>
        </div>
      </section>
    </div>
  )
}
