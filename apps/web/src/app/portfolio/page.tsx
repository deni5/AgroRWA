'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import Link from 'next/link'
import { useEmitterProfile, useOracleProfile } from '@/hooks/useIdentity'

function shortAddr(a: string) { return `${a.slice(0, 6)}…${a.slice(-4)}` }

export default function PortfolioPage() {
  const { publicKey } = useWallet()
  const { data: emitter } = useEmitterProfile(publicKey?.toBase58())
  const { data: oracle }  = useOracleProfile(publicKey?.toBase58())

  if (!publicKey) return (
    <div className="max-w-lg mx-auto card text-center py-16 space-y-4">
      <p className="text-gray-400">Connect wallet to view your portfolio.</p>
      <WalletMultiButton />
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-100">Portfolio</h1>
        <p className="text-gray-400 mt-1 font-mono text-sm">{shortAddr(publicKey.toBase58())}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Emitter card */}
        <div className="card">
          <h2 className="font-semibold text-gray-100 mb-3">Emitter Status</h2>
          {emitter ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">KYC</span>
                <span className={emitter.kycStatus === 'Approved' ? 'text-green-400' : 'text-amber-400'}>
                  {emitter.kycStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Rating</span>
                <span className="text-gray-100 font-semibold">{emitter.ratingLabel} ({emitter.ratingScore})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Deposit req.</span>
                <span className="text-gray-100">{emitter.depositBps / 100}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Assets issued</span>
                <span className="text-gray-100">{emitter.totalIssued}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Fulfilled</span>
                <span className="text-green-400">{emitter.totalFulfilled}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Defaults</span>
                <span className="text-red-400">{emitter.totalDefaults}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 text-sm">
              Not registered.{' '}
              <Link href="/kyc" className="text-green-400 underline">Register</Link>
            </div>
          )}
        </div>

        {/* Oracle card */}
        <div className="card">
          <h2 className="font-semibold text-gray-100 mb-3">Oracle Status</h2>
          {oracle ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Status</span>
                <span className={oracle.isActive ? 'text-green-400' : 'text-red-400'}>
                  {oracle.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Role</span>
                <span className="text-gray-100">{oracle.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Reputation</span>
                <span className="text-gray-100 font-semibold">{oracle.reputationScore}/1000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Verified</span>
                <span className="text-blue-400">{oracle.verifiedCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Disputes</span>
                <span className="text-red-400">{oracle.disputeCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Stake</span>
                <span className="text-gray-100">{(Number(oracle.stakeAmount) / 1e6).toFixed(0)} USDC</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 text-sm">
              Not registered.{' '}
              <Link href="/oracle" className="text-green-400 underline">Register</Link>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="card">
          <h2 className="font-semibold text-gray-100 mb-3">Quick Actions</h2>
          <div className="flex flex-col gap-2">
            <Link href="/marketplace" className="btn-secondary text-sm text-center">Browse Assets</Link>
            <Link href="/create-asset" className="btn-primary text-sm text-center">List New Asset</Link>
            <Link href="/oracle" className="btn-secondary text-sm text-center">Oracle Panel</Link>
            <Link href="/insurance" className="btn-secondary text-sm text-center">Insurance Fund</Link>
          </div>
        </div>
      </div>

      {/* Holdings (placeholder) */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-100 mb-4">Holdings</h2>
        <div className="text-center py-10 text-gray-500">
          Token holdings will appear here after you purchase assets from the marketplace.
        </div>
      </div>
    </div>
  )
}
