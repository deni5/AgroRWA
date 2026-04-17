'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import Link from 'next/link'
import { useEmitterProfile, useOracleProfile } from '@/hooks/useIdentity'
import { useAllAssets } from '@/hooks/useAsset'

function shortAddr(a: string) { return `${a.slice(0, 6)}...${a.slice(-4)}` }

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
              <StatRow label="Rating" value={emitter.ratingLabel + " (" + emitter.ratingScore + ")"} />
              <StatRow label="Deposit req." value={emitter.depositBps / 100 + "%"} />
              <StatRow label="Assets issued" value={String(emitter.totalIssued)} />
              <StatRow label="Fulfilled" value={String(emitter.totalFulfilled)} color="#52b788" />
              <StatRow label="Defaults" value={String(emitter.totalDefaults)} color={emitter.totalDefaults > 0 ? '#e24b4a' : '#1a4328'} />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#9cbb9e', fontSize: '13px' }}>
              Not registered. <Link href="/kyc" style={{ color: '#52b788', textDecoration: 'underline' }}>Register</Link>
            </div>
          )}
        </div>

        <div className="card">
          <h2 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Oracle Status</h2>
          {oracle ? (
            <div>
              <StatRow label="Status" value={oracle.isActive ? 'Active' : 'Inactive'} color={oracle.isActive ? '#52b788' : '#e24b4a'} />
              <StatRow label="Role" value={oracle.role} />
              <StatRow label="Reputation" value={oracle.reputationScore + "/1000"} />
              <StatRow label="Verified" value={String(oracle.verifiedCount)} color="#2d6a4f" />
              <StatRow label="Disputes" value={String(oracle.disputeCount)} color={oracle.disputeCount > 0 ? '#e24b4a' : '#1a4328'} />
              <StatRow label="Stake" value={(Number(oracle.stakeAmount) / 1e6).toFixed(0) + " USDC"} />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#9cbb9e', fontSize: '13px' }}>
              Not registered. <Link href="/oracle" style={{ color: '#52b788', textDecoration: 'underline' }}>Register</Link>
            </div>
          )}
        </div>

        <div className="card">
          <h2 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { href: '/marketplace', label: 'Browse Marketplace', primary: false },
              { href: '/create-asset', label: 'Tokenize New Asset', primary: true },
              { href: '/oracle', label: 'Oracle Panel', primary: false },
              { href: '/insurance', label: 'Insurance Fund', primary: false },
            ].map(({ href, label, primary }) => (
              <Link key={href} href={href} style={{
                display: 'block', textAlign: 'center', padding: '10px 16px', borderRadius: '12px',
                fontSize: '13px', fontWeight: '600', textDecoration: 'none',
                background: primary ? '#1a4328' : 'transparent', color: primary ? '#fff' : '#2d6a4f',
                border: primary ? 'none' : '1.5px solid rgba(26,67,40,0.15)',
              }}>{label}</Link>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.02em' }}>My Assets</h2>
          <Link href="/create-asset" style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', textDecoration: 'none', background: '#1a4328', color: '#fff' }}>+ Tokenize Asset</Link>
        </div>
        {assetsLoading && <div style={{ textAlign: 'center', padding: '32px 0', color: '#9cbb9e' }}>Loading assets...</div>}
        {!assetsLoading && myAssets.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#9cbb9e', fontSize: '14px' }}>
            No assets yet. <Link href="/create-asset" style={{ color: '#52b788', textDecoration: 'underline' }}>Tokenize your first asset</Link>
          </div>
        )}
        {!assetsLoading && myAssets.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {myAssets.map((asset) => (
              <div key={asset.address} style={{ background: '#f4faf6', borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: '#1a4328' }}>{asset.title}</span>
                    <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' as const, background: (LIFECYCLE_COLOR[asset.lifecycleStatus] || '#999') + '22', color: LIFECYCLE_COLOR[asset.lifecycleStatus] || '#999' }}>{asset.lifecycleStatus}</span>
                    <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '600', background: '#d8f3dc', color: '#2d6a4f' }}>{asset.tokenType}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#7aaa88' }}>
                    <span>{Number(asset.totalSupply).toLocaleString()} {asset.unit}</span>
                    <span>{(Number(asset.pricePerUnit) / 1000000).toFixed(2)} USDC/{asset.unit}</span>
                    <span>{asset.category}</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>{asset.mint.slice(0, 8)}...</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  {asset.lifecycleStatus === 'Pending' && <span style={{ padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '600', color: '#7aaa88', border: '1px solid rgba(26,67,40,0.1)' }}>Awaiting Oracle</span>}
                  {asset.lifecycleStatus === 'Verified' && <button style={{ padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '600', background: '#1a4328', color: '#fff', border: 'none', cursor: 'pointer' }}>List on Market</button>}
                  <a href={"https://explorer.solana.com/address/" + asset.mint + "?cluster=devnet"} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '600', color: '#2d6a4f', textDecoration: 'none', border: '1.5px solid rgba(26,67,40,0.15)' }}>Explorer</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2 style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.02em', marginBottom: '16px' }}>Holdings</h2>
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#9cbb9e', fontSize: '14px' }}>
          Purchased token holdings will appear here after you buy assets from the marketplace.
        </div>
      </div>
    </div>
  )
}
