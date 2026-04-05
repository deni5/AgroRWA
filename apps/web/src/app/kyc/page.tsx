'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useRegisterEmitter } from '@/hooks/useIdentity'
import { TxStatus } from '@/components/TxStatus'
import type { TxState } from '@/types'

export default function KycPage() {
  const { publicKey, connected } = useWallet()
  const { mutateAsync, isPending } = useRegisterEmitter()

  const [form, setForm] = useState({
    legalName: '',
    edrpou: '',
    country: 'Ukraine',
    region: '',
    doc1: '',
    doc2: '',
    doc3: '',
  })

  const [tx, setTx] = useState<TxState>({ status: 'idle' })

  useEffect(() => {
    if (tx.status === 'error') setTx({ status: 'idle' })
  }, [form])

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!connected || !publicKey) {
      setTx({ status: 'error', error: 'Wallet not connected. Please reconnect.' })
      return
    }
    setTx({ status: 'pending' })
    try {
      const docs = [form.doc1, form.doc2, form.doc3].filter(Boolean)
      const sig = await mutateAsync({
        legalName: form.legalName.trim(),
        edrpou: form.edrpou.trim(),
        country: form.country,
        region: form.region.trim(),
        docsIpfs: docs,
      })
      setTx({ status: 'success', sig })
    } catch (err: any) {
      setTx({ status: 'error', error: err.message || 'Transaction failed' })
    }
  }

  if (!publicKey) return (
    <div className="card" style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center', padding: '64px 32px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔑</div>
      <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', letterSpacing: '-0.02em' }}>
        Emitter Registration
      </h2>
      <p style={{ color: '#5a8a6a', marginBottom: '24px', fontSize: '14px' }}>
        Connect your Solana wallet to continue.
      </p>
      <WalletMultiButton />
    </div>
  )

  return (
    <div style={{ maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '16px',
          background: '#d8f3dc', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '24px', flexShrink: 0,
        }}>🌾</div>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', letterSpacing: '-0.03em', marginBottom: '2px' }}>
            Emitter KYC Registration
          </h1>
          <p style={{ color: '#5a8a6a', fontSize: '14px' }}>AgroRWA Identity Verification</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        <div>
          <label className="label">Legal Name / ПІБ *</label>
          <input className="input" placeholder="Full name or Company name"
            value={form.legalName} onChange={(e) => set('legalName', e.target.value)} required />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label className="label">ЄДРПОУ / ІПН *</label>
            <input className="input" style={{ fontFamily: 'monospace' }}
              placeholder="12345678"
              value={form.edrpou} onChange={(e) => set('edrpou', e.target.value)} required />
          </div>
          <div>
            <label className="label">Country</label>
            <select className="input" value={form.country} onChange={(e) => set('country', e.target.value)}>
              <option value="Ukraine">Ukraine</option>
              <option value="Poland">Poland</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label">Region / Oblast *</label>
          <input className="input" placeholder="e.g. Kharkivska"
            value={form.region} onChange={(e) => set('region', e.target.value)} required />
        </div>

        {/* Documents */}
        <div style={{
          borderTop: '1px solid rgba(26,67,40,0.08)',
          paddingTop: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <label className="label">Verification Documents (IPFS)</label>
          {[
            { key: 'doc1', placeholder: 'IPFS Hash 1 — Passport / Company Extract *', required: true },
            { key: 'doc2', placeholder: 'IPFS Hash 2 — Registration Certificate', required: false },
            { key: 'doc3', placeholder: 'IPFS Hash 3 — Optional', required: false },
          ].map(({ key, placeholder, required }) => (
            <input key={key} className="input"
              style={{ fontFamily: 'monospace', fontSize: '13px' }}
              placeholder={placeholder}
              value={(form as any)[key]}
              onChange={(e) => set(key, e.target.value)}
              required={required} />
          ))}
        </div>

        <TxStatus tx={tx} />

        <button type="submit" className="btn-primary" style={{ width: '100%', padding: '16px' }}
          disabled={isPending}>
          {isPending ? 'Sending to Blockchain...' : 'Submit KYC Application'}
        </button>

      </form>
    </div>
  )
}
