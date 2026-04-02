'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useRegisterEmitter } from '@/hooks/useIdentity'
import { TxStatus } from '@/components/TxStatus'
import type { TxState } from '@/types'
import { BN } from '@coral-xyz/anchor'

export default function KycPage() {
  const { publicKey } = useWallet()
  const { mutateAsync, isPending } = useRegisterEmitter()

  const [form, setForm] = useState({
    legalName: '',
    edrpou: '',
    country: 'UA',
    region: '',
    doc1: '',
    doc2: '',
    doc3: '',
  })
  
  const [tx, setTx] = useState<TxState>({ status: 'idle' })

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Захист від відправки без підключеного гаманця
    if (!publicKey) {
      setTx({ status: 'error', error: 'Wallet not connected' })
      return
    }

    setTx({ status: 'pending' })
    
    try {
      // 1. Очищаємо масив документів від порожніх рядків
      const docs = [form.doc1, form.doc2, form.doc3].filter(Boolean)

      // 2. Перетворюємо ЄДРПОУ/ІПН у формат BN (Big Number)
      // Це лікує помилку "Cannot read properties of undefined (reading '_bn')"
      const edrpouValue = form.edrpou.replace(/\s/g, '') // видаляємо пробіли
      
      if (isNaN(Number(edrpouValue))) {
        throw new Error('ЄДРПОУ / ІПН має бути числом')
      }

      const sig = await mutateAsync({
        legalName: form.legalName,
        // Передаємо як BN, якщо смарт-контракт очікує u64/u128
        // Якщо ваш хук сам робить перетворення, залиште як рядок, 
        // але зазвичай помилка саме тут.
        edrpou: new BN(edrpouValue), 
        country: form.country,
        region: form.region,
        docsIpfs: docs,
      })

      setTx({ status: 'success', signature: sig })
    } catch (err: any) {
      console.error("KYC Submission Error:", err)
      setTx({ 
        status: 'error', 
        error: err.message || 'Transaction failed. Check console for details.' 
      })
    }
  }

  if (!publicKey) {
    return (
      <div className="max-w-lg mx-auto card text-center py-16 space-y-4 bg-gray-900/20 border-dashed border-gray-800">
        <div className="flex justify-center text-4xl mb-2">🛡️</div>
        <p className="text-gray-400">Connect your wallet to register as an emitter in AgroRWA.</p>
        <div className="flex justify-center">
          <WalletMultiButton className="!bg-agro-600 hover:!bg-agro-700 transition-colors" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-gray-100">Emitter KYC Registration</h1>
        <p className="text-gray-400 mt-1">
          Register your farm or company to start tokenizing agricultural assets.
          KYC review takes 1-3 business days.
        </p>
      </div>

      <div className="card border-amber-800/30 bg-amber-900/10 text-sm text-amber-300 space-y-2 p-4 rounded-xl">
        <p className="font-medium flex items-center gap-2">
          <span>⚠️</span> Required documents (upload to IPFS first)
        </p>
        <ul className="list-disc list-inside text-amber-400/70 space-y-1 ml-2">
          <li>ЄДРПОУ extract or passport copy</li>
          <li>Company registration documents</li>
          <li>Agricultural activity license (if applicable)</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5 bg-gray-900/40 border-gray-800 p-6 rounded-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label text-gray-400 mb-1.5 block">Legal Name / ПІБ *</label>
            <input 
              className="input w-full bg-gray-950 border-gray-800 focus:border-agro-500 transition-all" 
              placeholder="ТОВ Агрофірма Зоря / Іваненко Іван Іванович"
              value={form.legalName} 
              onChange={(e) => set('legalName', e.target.value)} 
              required 
              maxLength={128} 
            />
          </div>
          <div>
            <label className="label text-gray-400 mb-1.5 block">ЄДРПОУ / ІПН *</label>
            <input 
              className="input w-full bg-gray-950 border-gray-800 font-mono text-agro-400 focus:border-agro-500" 
              placeholder="12345678"
              value={form.edrpou} 
              onChange={(e) => set('edrpou', e.target.value.replace(/\D/g, ''))} 
              required 
              maxLength={16} 
            />
          </div>
          <div>
            <label className="label text-gray-400 mb-1.5 block">Country</label>
            <select 
              className="input w-full bg-gray-950 border-gray-800 focus:border-agro-500" 
              value={form.country} 
              onChange={(e) => set('country', e.target.value)}
            >
              <option value="UA">Ukraine</option>
              <option value="PL">Poland</option>
              <option value="DE">Germany</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label text-gray-400 mb-1.5 block">Region / Oblast *</label>
            <input 
              className="input w-full bg-gray-950 border-gray-800 focus:border-agro-500" 
              placeholder="Харківська область"
              value={form.region} 
              onChange={(e) => set('region', e.target.value)} 
              required 
              maxLength={64} 
            />
          </div>
        </div>

        <div className="border-t border-gray-800 pt-5 space-y-4">
          <p className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Document IPFS Hashes</p>
          <div>
            <label className="label text-gray-400 mb-1 block">Document 1 — ЄДРПОУ / Паспорт *</label>
            <input 
              className="input w-full bg-gray-950 border-gray-800 font-mono text-sm focus:border-agro-500" 
              placeholder="QmXxx... or ipfs://"
              value={form.doc1} 
              onChange={(e) => set('doc1', e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="label text-gray-400 mb-1 block">Document 2 — Реєстраційні документи</label>
            <input 
              className="input w-full bg-gray-950 border-gray-800 font-mono text-sm focus:border-agro-500" 
              placeholder="QmXxx..."
              value={form.doc2} 
              onChange={(e) => set('doc2', e.target.value)} 
            />
          </div>
          <div>
            <label className="label text-gray-400 mb-1 block">Document 3 — Ліцензія / Інше</label>
            <input 
              className="input w-full bg-gray-950 border-gray-800 font-mono text-sm focus:border-agro-500" 
              placeholder="QmXxx..."
              value={form.doc3} 
              onChange={(e) => set('doc3', e.target.value)} 
            />
          </div>
        </div>

        <TxStatus tx={tx} />

        <button 
          type="submit" 
          className="btn-primary w-full py-4 text-lg font-bold shadow-lg shadow-agro-900/20 disabled:opacity-50 disabled:cursor-not-allowed" 
          disabled={isPending}
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Confirming on Solana...
            </span>
          ) : 'Submit KYC Application'}
        </button>
      </form>
    </div>
  )
}
