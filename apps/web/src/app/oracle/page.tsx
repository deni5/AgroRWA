'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useOracleProfile, useRegisterOracle } from '@/hooks/useIdentity'
import { TxStatus } from '@/components/TxStatus'
import { useState } from 'react'
import type { TxState } from '@/types'
import toast from 'react-hot-toast'

const ROLE_OPTIONS = [
  { value: 'AgroExpert',   label: '🌾 Agro Expert',    desc: 'Verify crop quality, quantity, storage conditions' },
  { value: 'Notary',       label: '⚖️ Notary',          desc: 'Certify ownership and legal documents' },
  { value: 'LegalAdvisor', label: '📋 Legal Advisor',   desc: 'Confirm legal clearance and contract validity' },
  { value: 'Auditor',      label: '🔍 Auditor',         desc: 'Verify financial records and revenue reports' },
]

export default function OraclePanelPage() {
  const { publicKey } = useWallet()
  const { data: oracle, isLoading } = useOracleProfile(publicKey?.toBase58())
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
      setTx({ status: 'success', signature: sig })
    } catch (e: any) {
      setTx({ status: 'error', error: e.message })
    }
  }

  if (!publicKey) return (
    <div className="max-w-lg mx-auto card text-center py-16 space-y-4">
      <p className="text-gray-400">Connect wallet to access Oracle Panel.</p>
      <WalletMultiButton />
    </div>
  )

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-100">Oracle Panel</h1>
        <p className="text-gray-400 mt-1">
          Register as a certified oracle or manage your pending verifications.
        </p>
      </div>

      {/* Existing oracle profile */}
      {oracle && (
        <div className="card border-green-800/40">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-100">Your Oracle Profile</h2>
            <span className={`badge ${oracle.isActive ? 'badge-green' : 'badge-red'}`}>
              {oracle.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-400">{oracle.reputationScore}</p>
              <p className="text-xs text-gray-500">Reputation</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">{oracle.verifiedCount}</p>
              <p className="text-xs text-gray-500">Verified</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-400">{oracle.disputeCount}</p>
              <p className="text-xs text-gray-500">Disputes</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-300">{oracle.role}</p>
              <p className="text-xs text-gray-500">Role</p>
            </div>
          </div>
        </div>
      )}

      {/* Register form */}
      {!oracle && (
        <form onSubmit={handleRegister} className="card space-y-5">
          <h2 className="text-lg font-semibold text-gray-100">Register as Oracle</h2>

          <div className="card border-blue-800/30 bg-blue-900/10 text-sm text-blue-300 space-y-1">
            <p className="font-medium">Oracle Stake Requirement</p>
            <p className="text-blue-400/70">Minimum 50 USDC stake. 20% of your verification fees go to the insurance fund. Your stake can be slashed if misconduct is proven.</p>
          </div>

          <div>
            <label className="label">Full Name / Organization *</label>
            <input className="input" placeholder="Іванов Іван Іванович — Агро-консультант"
              value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
              required maxLength={64} />
          </div>

          <div>
            <label className="label">Role *</label>
            <div className="grid grid-cols-2 gap-3">
              {ROLE_OPTIONS.map(({ value, label, desc }) => (
                <button key={value} type="button"
                  onClick={() => setForm(p => ({ ...p, role: value as any }))}
                  className={`text-left p-3 rounded-lg border text-sm transition-colors ${
                    form.role === value
                      ? 'border-green-600 bg-green-900/30'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <p className="font-medium text-gray-100">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Credentials (IPFS hash) *</label>
            <input className="input font-mono text-sm"
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
            <p className="text-xs text-gray-500 mt-1">
              Higher stake = higher trust signal to investors
            </p>
          </div>

          <TxStatus tx={tx} />

          <button type="submit" className="btn-primary w-full py-3" disabled={isPending}>
            {isPending ? 'Registering...' : 'Register as Oracle'}
          </button>
        </form>
      )}

      {/* Pending verifications queue */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Pending Verifications</h2>
        <div className="text-center py-8 text-gray-500 text-sm">
          No pending verifications.
          {!oracle && ' Register as oracle to start signing asset verifications.'}
        </div>
      </div>
    </div>
  )
}
