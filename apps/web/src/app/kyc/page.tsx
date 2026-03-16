'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useRegisterEmitter } from '@/hooks/useIdentity'
import { TxStatus } from '@/components/TxStatus'
import type { TxState } from '@/types'

export default function KycPage() {
  const { publicKey } = useWallet()
  const { mutateAsync, isPending } = useRegisterEmitter()

  const [form, setForm] = useState({
    legalName: '',
    edrpou: '',
    country: 'UA',
    region: '',
    doc1: '', doc2: '', doc3: '',
  })
  const [tx, setTx] = useState<TxState>({ status: 'idle' })

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTx({ status: 'pending' })
    try {
      const docs = [form.doc1, form.doc2, form.doc3].filter(Boolean)
      const sig = await mutateAsync({
        legalName: form.legalName,
        edrpou: form.edrpou,
        country: form.country,
        region: form.region,
        docsIpfs: docs,
      })
      setTx({ status: 'success', signature: sig })
    } catch (e: any) {
      setTx({ status: 'error', error: e.message })
    }
  }

  if (!publicKey) {
    return (
      <div className="max-w-lg mx-auto card text-center py-16 space-y-4">
        <p className="text-gray-400">Connect your wallet to register as an emitter.</p>
        <WalletMultiButton />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-100">Emitter KYC Registration</h1>
        <p className="text-gray-400 mt-1">
          Register your farm or company to start tokenizing agricultural assets.
          KYC review takes 1-3 business days.
        </p>
      </div>

      <div className="card border-amber-800/30 bg-amber-900/10 text-sm text-amber-300 space-y-1">
        <p className="font-medium">Required documents (upload to IPFS first)</p>
        <p className="text-amber-400/70">• ЄДРПОУ extract or passport copy</p>
        <p className="text-amber-400/70">• Company registration documents</p>
        <p className="text-amber-400/70">• Agricultural activity license (if applicable)</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Legal Name / ПІБ *</label>
            <input className="input" placeholder="ТОВ Агрофірма Зоря / Іваненко Іван Іванович"
              value={form.legalName} onChange={(e) => set('legalName', e.target.value)} required maxLength={128} />
          </div>
          <div>
            <label className="label">ЄДРПОУ / ІПН *</label>
            <input className="input font-mono" placeholder="12345678"
              value={form.edrpou} onChange={(e) => set('edrpou', e.target.value)} required maxLength={16} />
          </div>
          <div>
            <label className="label">Country</label>
            <select className="input" value={form.country} onChange={(e) => set('country', e.target.value)}>
              <option value="UA">Ukraine</option>
              <option value="PL">Poland</option>
              <option value="DE">Germany</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Region / Oblast *</label>
            <input className="input" placeholder="Харківська область"
              value={form.region} onChange={(e) => set('region', e.target.value)} required maxLength={64} />
          </div>
        </div>

        <div className="border-t border-gray-800 pt-4 space-y-3">
          <p className="text-sm font-medium text-gray-300">Document IPFS Hashes</p>
          <div>
            <label className="label">Document 1 — ЄДРПОУ / Паспорт *</label>
            <input className="input font-mono text-sm" placeholder="QmXxx... or https://ipfs.io/ipfs/Qm..."
              value={form.doc1} onChange={(e) => set('doc1', e.target.value)} required />
          </div>
          <div>
            <label className="label">Document 2 — Реєстраційні документи</label>
            <input className="input font-mono text-sm" placeholder="QmXxx..."
              value={form.doc2} onChange={(e) => set('doc2', e.target.value)} />
          </div>
          <div>
            <label className="label">Document 3 — Ліцензія / Інше</label>
            <input className="input font-mono text-sm" placeholder="QmXxx..."
              value={form.doc3} onChange={(e) => set('doc3', e.target.value)} />
          </div>
        </div>

        <TxStatus tx={tx} />

        <button type="submit" className="btn-primary w-full py-3" disabled={isPending}>
          {isPending ? 'Submitting...' : 'Submit KYC Application'}
        </button>
      </form>
    </div>
  )
}
