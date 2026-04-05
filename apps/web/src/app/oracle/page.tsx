'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useOracleProfile, useRegisterOracle } from '@/hooks/useIdentity'
import { TxStatus } from '@/components/TxStatus'
import { useState } from 'react'
import type { TxState } from '@/types'

const ROLE_OPTIONS = [
  { value: 'AgroExpert',   label: '🌾 Agro Expert',   desc: 'Verify crop quality, quantity, storage conditions' },
  { value: 'Notary',       label: '⚖️ Notary',         desc: 'Certify ownership and legal documents' },
  { value: 'LegalAdvisor', label: '📋 Legal Advisor',  desc: 'Confirm legal clearance and contract validity' },
  { value: 'Auditor',      label: '🔍 Auditor',        desc: 'Verify financial records and revenue reports' },
]

export default function OraclePanelPage() {
  const { publicKey } = useWallet()
  const { data: oracle } = useOracleProfile(publicKey?.toBase58())
  const { mutateAsync: registerOracle, isPending } = useRegisterOracle()

  const [form, setForm] = useState({
    name: '',
    role: 'AgroExpert' as const,
    credentialsIpfs: '',
    stakeAmount: '50',
  })
  const [tx, setTx] = useState<TxState>({ status: 'idle' })

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setTx({ status: 'pending' })
    try {
      const sig = await registerOracle({
        name: form.name,
        role: form.role,
        credentialsIpfs: form.credentialsIpfs,
        stakeAmount: BigInt(Math.floor(Number(form.stakeAmount) * 1_000_000)),
      })
      setTx({ status: 'success', sig })
    } catch (e: any) {
      setTx({ status: 'error', error: e.message })
    }
  }

  if (!publicKey) return (
    <div className="max-w-lg mx-auto card text-center py-16 space-y-4">
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
      <p style={{ color: '#5a8a6a', marginBottom: '16px' }}>
        Connect wallet to access Oracle Panel.
      </p>
      <WalletMultiButton />
    </div>
  )

  return (
    <div style={{ maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: '32px', fontWeight: '700', letterSpacing: '-0.03em', marginBottom: '6px' }}>
          Oracle Panel
        </h1>
        <p style={{ color: '#5a8a6a', fontSize: '15px' }}>
          Register as a certified oracle or manage your pending verifications.
        </p>
      </div>

      {/* Oracle profile */}
      {oracle && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.02em' }}>
              Your Oracle Profile
            </h2>
            <span style={{
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '700',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              background: oracle.isActive ? '#d8f3dc' : '#f0f0ee',
              color: oracle.isActive ? '#1a4328' : '#666',
            }}>
              {oracle.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', textAlign: 'center' }}>
            {[
              { val: oracle.reputationScore, label: 'Reputation', color: '#52b788' },
              { val: oracle.verifiedCount,   label: 'Verified',   color: '#2d6a4f' },
              { val: oracle.disputeCount,    label: 'Disputes',   color: '#e9c46a' },
              { val: oracle.role,            label: 'Role',       color: '#1a4328' },
            ].map(({ val, label, color }) => (
              <div key={label} style={{
                background: '#f4faf6',
                borderRadius: '16px',
                padding: '16px 8px',
              }}>
                <p style={{ fontSize: '22px', fontWeight: '700', color, letterSpacing: '-0.02em' }}>
                  {String(val)}
                </p>
                <p style={{ fontSize: '11px', color: '#7aaa88', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Register form */}
      {!oracle && (
        <form onSubmit={handleRegister} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.02em' }}>
            Register as Oracle
          </h2>

          {/* Info block */}
          <div style={{
            background: '#f0faf3',
            border: '1px solid rgba(82,183,136,0.25)',
            borderRadius: '16px',
            padding: '16px',
            fontSize: '13px',
            color: '#2d6a4f',
          }}>
            <p style={{ fontWeight: '600', marginBottom: '4px' }}>Oracle Stake Requirement</p>
            <p style={{ color: '#5a8a6a', lineHeight: '1.5' }}>
              Minimum 50 USDC stake. 20% of your verification fees go to the insurance fund.
              Your stake can be slashed if misconduct is proven.
            </p>
          </div>

          <div>
            <label className="label">Full Name / Organization *</label>
            <input className="input" placeholder="Іванов Іван — Агро-консультант"
              value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
              required maxLength={64} />
          </div>

          <div>
            <label className="label">Role *</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {ROLE_OPTIONS.map(({ value, label, desc }) => (
                <button key={value} type="button"
                  onClick={() => setForm(p => ({ ...p, role: value as any }))}
                  style={{
                    textAlign: 'left',
                    padding: '14px',
                    borderRadius: '16px',
                    border: form.role === value
                      ? '1.5px solid #2d6a4f'
                      : '1.5px solid rgba(26,67,40,0.1)',
                    background: form.role === value ? '#e8f7ed' : '#f8fbf9',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <p style={{ fontWeight: '600', fontSize: '14px', color: '#1a4328', marginBottom: '4px' }}>
                    {label}
                  </p>
                  <p style={{ fontSize: '12px', color: '#7aaa88', lineHeight: '1.4' }}>{desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Credentials (IPFS hash) *</label>
            <input className="input" style={{ fontFamily: 'monospace', fontSize: '13px' }}
              placeholder="QmXxx... — diploma, license, certificate"
              value={form.credentialsIpfs}
              onChange={(e) => setForm(p => ({ ...p, credentialsIpfs: e.target.value }))}
              required />
          </div>

          <div>
            <label className="label">Stake Amount (USDC, min 50)</label>
            <input className="input" type="number" min="50" step="10"
              value={form.stakeAmount}
              onChange={(e) => setForm(p => ({ ...p, stakeAmount: e.target.value }))} />
            <p style={{ fontSize: '12px', color: '#9cbb9e', marginTop: '6px' }}>
              Higher stake = higher trust signal to investors
            </p>
          </div>

          <TxStatus tx={tx} />

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '16px' }}
            disabled={isPending}>
            {isPending ? 'Registering...' : 'Register as Oracle'}
          </button>
        </form>
      )}

      {/* Pending verifications */}
      <div className="card">
        <h2 style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.02em', marginBottom: '16px' }}>
          Pending Verifications
        </h2>
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#9cbb9e', fontSize: '14px' }}>
          No pending verifications.
          {!oracle && ' Register as oracle to start signing asset verifications.'}
        </div>
      </div>

    </div>
  )
}
