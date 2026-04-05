'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import Link from 'next/link'
import { useEmitterProfile, useOracleProfile } from '@/hooks/useIdentity'

function shortAddr(a: string) { return `${a.slice(0, 6)}…${a.slice(-4)}` }

function StatRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f7f2', fontSize: '14px' }}>
      <span style={{ color: '#7aaa88', fontSize: '13px' }}>{label}</span>
      <span style={{ color: color || '#1a4328', fontWeight: '600' }}>{value}</span>
    </div>
  )
}

export default function PortfolioPage() {
  const { publicKey } = useWallet()
  const { data: emitter } = useEmitterProfile(publicKey?.toBase58())
  const { data: oracle } = useOracleProfile(publicKey?.toBase58())

  if (!publicKey) return (
    <div className="card" style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center', padding: '64px 32px' }}>
      <div style={{ fontSize: '40px', marginBottom: '16px' }}>💼</div>
      <p style={{ color: '#5a8a6a', marginBottom: '24px', fontSize: '14px' }}>
        Connect wallet to view your portfolio.
      </p>
      <WalletMultiButton />
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: '32px', fontWeight: '700', letterSpacing: '-0.03em', marginBottom: '4px' }}>
          Portfolio
        </h1>
        <p style={{ fontFamily: 'monospace', fontSize: '13px', color: '#7aaa88' }}>
          {shortAddr(publicKey.toBase58())}
        </p>
      </div>

      {/* Cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>

        {/* Emitter card */}
        <div className="card">
          <h2 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', letterSpacing: '-0.01em' }}>
            Emitter Status
          </h2>
          {emitter ? (
            <div>
              <StatRow label="KYC"
                value={emitter.kycStatus}
                color={emitter.kycStatus === 'Approved' ? '#52b788' : '#e9c46a'} />
              <StatRow label="Rating" value={`${emitter.ratingLabel} (${emitter.ratingScore})`} />
              <StatRow label="Deposit req." value={`${emitter.depositBps / 100}%`} />
              <StatRow label="Assets issued" value={String(emitter.totalIssued)} />
              <StatRow label="Fulfilled" value={String(emitter.totalFulfilled)} color="#52b788" />
              <StatRow label="Defaults" value={String(emitter.totalDefaults)} color={emitter.totalDefaults > 0 ? '#e24b4a' : '#1a4328'} />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#9cbb9e', fontSize: '13px' }}>
              Not registered.{' '}
              <Link href="/kyc" style={{ color: '#52b788', textDecoration: 'underline' }}>Register</Link>
            </div>
          )}
        </div>

        {/* Oracle card */}
        <div className="card">
          <h2 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', letterSpacing: '-0.01em' }}>
            Oracle Status
          </h2>
          {oracle ? (
            <div>
              <StatRow label="Status"
                value={oracle.isActive ? 'Active' : 'Inactive'}
                color={oracle.isActive ? '#52b788' : '#e24b4a'} />
              <StatRow label="Role" value={oracle.role} />
              <StatRow label="Reputation" value={`${oracle.reputationScore}/1000`} />
              <StatRow label="Verified" value={String(oracle.verifiedCount)} color="#2d6a4f" />
              <StatRow label="Disputes" value={String(oracle.disputeCount)} color={oracle.disputeCount > 0 ? '#e24b4a' : '#1a4328'} />
              <StatRow label="Stake" value={`${(Number(oracle.stakeAmount) / 1e6).toFixed(0)} USDC`} />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#9cbb9e', fontSize: '13px' }}>
              Not registered.{' '}
              <Link href="/oracle" style={{ color: '#52b788', textDecoration: 'underline' }}>Register</Link>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="card">
          <h2 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', letterSpacing: '-0.01em' }}>
            Quick Actions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { href: '/marketplace', label: 'Browse Assets', primary: false },
              { href: '/create-asset', label: 'List New Asset', primary: true },
              { href: '/oracle', label: 'Oracle Panel', primary: false },
              { href: '/insurance', label: 'Insurance Fund', primary: false },
            ].map(({ href, label, primary }) => (
              <Link key={href} href={href} style={{
                display: 'block',
                textAlign: 'center',
                padding: '10px 16px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '600',
                textDecoration: 'none',
                background: primary ? '#1a4328' : 'transparent',
                color: primary ? '#fff' : '#2d6a4f',
                border: primary ? 'none' : '1.5px solid rgba(26,67,40,0.15)',
                transition: 'all 0.2s',
              }}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Holdings */}
      <div className="card">
        <h2 style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.02em', marginBottom: '16px' }}>
          Holdings
        </h2>
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#9cbb9e', fontSize: '14px' }}>
          Token holdings will appear here after you purchase assets from the marketplace.
        </div>
      </div>

    </div>
  )
}

