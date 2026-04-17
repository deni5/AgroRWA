'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import Link from 'next/link'
import { useEmitterProfile, useOracleProfile } from '@/hooks/useIdentity'
import { useAllAssets } from '@/hooks/useAsset'

function shortAddr(a: string) { return `${a.slice(0, 6)}…${a.slice(-4)}` }

function StatRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f7f2', fontSize: '14px' }}>
      <span style={{ color: '#7aaa88', fontSize: '13px' }}>{label}</span>
      <span style={{ color: color || '#1a4328', fontWeight: '600' }}>{value}</span>
    </div>
  )
}

const LIFECYCLE_COLOR: Record<string, string> = {
  Pending: '#e9c46a', Verified: '#52b788', Listed: '#2d6a4f',
  PartialSold: '#52b788', FullySold: '#1a4328', Delivered: '#1a4328',
  Settled: '#7aaa88', Disputed: '#e24b4a', Frozen: '#e24b4a', Cancelled: '#9cbb9e',
}

export default function PortfolioPage() {
  const { publicKey } = useWallet()
  const { data: emitter } = useEmitterProfile(publicKey?.toBase58())
  const { data: oracle } = useOracleProfile(publicKey?.toBase58())
  const { data: allAssets, isLoading: assetsLoading } = useAllAssets()

  const myAssets = allAssets?.filter(a => a.emitter === publicKey?.toBase58()) ?? []

  if (!publicKey) return (
    <div className="card" style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center', padding: '64px 32px' }}>
      <div style={{ fontSize: '40px', marginBottom: '16px' }}>💼</div>
      <p style={{ color: '#5a8a6a', marginBottom: '24px', fontSize: '14px' }}>Connect wallet to view your portfolio.</p>
      <WalletMultiButton />
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '32px', fontWeight: '700', letterSpacing: '-0.03em', marginBottom: '4px' }}>Portfolio</h1>
        <p style={{ fontFamily: 'monospace', fontSize: '13px', color: '#7aaa88' }}>{shortAddr(publicKey.toBase58())}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div className="card">
          <h2 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Emitter Status</h2>
          {emitter ? (
            <div>
              <StatRow label="KYC" value={emitter.kycStatus} color={emitter.kycStatus === 'Approved' ? '#52b788' : '#e9c46a'} />
              <StatRow label="Rating" value={`${emitter.ratingLabel} (${emitter.ratingScore})`} />
              <StatRow label="Deposit req." value={`${emitter.depositBps / 100}%`} />
              <StatRow label="Assets issued" value={S