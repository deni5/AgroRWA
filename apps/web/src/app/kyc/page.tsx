'use client'

import { useState, useEffect } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useRegisterEmitter } from '@/hooks/useIdentity'
import { TxStatus } from '@/components/TxStatus'
import type { TxState } from '@/types'
import { BN } from '@coral-xyz/anchor'

export default function KycPage() {
  const { publicKey, connected } = useWallet()
  const { connection } = useConnection()
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

  // Очищення помилок при зміні форми
  useEffect(() => {
    if (tx.status === 'error') setTx({ status: 'idle' })
  }, [form])

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // КРИТИЧНА ПЕРЕВІРКА: чи готовий гаманець і підключення
    if (!connected || !publicKey) {
      setTx({ status: 'error', error: 'Wallet not fully connected. Please reconnect.' })
      return
    }

    setTx({ status: 'pending' })
    
    try {
      console.log("--- DEBUG START ---")
      console.log("Wallet PK:", publicKey.toBase58())
      
      const docs = [form.doc1, form.doc2, form.doc3].filter(Boolean)
      const edrpouValue = form.edrpou.replace(/\D/g, '')

      if (!edrpouValue) throw new Error('ЄДРПОУ / ІПН обов’язковий')

      // Створюємо BN об'єкт окремо для перевірки
      const edrpouBN = new BN(edrpouValue)
      console.log("BN Created:", edrpouBN.toString())

      // ПІДГОТОВКА ОБ'ЄКТА ДЛЯ МУТАЦІЇ
      const payload = {
        legalName: form.legalName.trim(),
        edrpou: edrpouBN, 
        country: form.country,
        region: form.region.trim(),
        docsIpfs: docs,
      }

      console.log("Payload prepared:", payload)

      const sig = await mutateAsync(payload)
      
      console.log("Success Sig:", sig)
      setTx({ status: 'success', signature: sig })

    } catch (err: any) {
      console.error("FULL ERROR LOG:", err)
      
      // Обробка специфічної помилки _bn
      const errorMessage = err.message?.includes('_bn') 
        ? "Solana Error: One of the accounts or numbers is invalid (reading _bn)." 
        : err.message || 'Transaction failed'

      setTx({ status: 'error', error: errorMessage })
    } finally {
      console.log("--- DEBUG END ---")
    }
  }

  if (!publicKey) {
    return (
      <div className="max-w-lg mx-auto card text-center py-16 space-y-6 bg-gray-900/30 border-2 border-dashed border-gray-800">
        <div className="text-5xl">🔑</div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Emitter Registration</h2>
          <p className="text-gray-400">Please connect your Solana wallet to continue.</p>
        </div>
        <div className="flex justify-center">
          <WalletMultiButton className="!bg-agro-600 hover:!bg-agro-700" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4 border-b border-gray-800 pb-6">
        <div className="p-3 bg-agro-600/10 rounded-xl text-3xl">🌾</div>
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Emitter KYC Registration</h1>
          <p className="text-gray-400">AgroRWA Identity Verification</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900/20 p-8 rounded-2xl border border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-400 mb-2 block">Legal Name / ПІБ *</label>
            <input 
              className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-agro-500 outline-none" 
              placeholder="Full name or Company name"
              value={form.legalName} 
              onChange={(e) => set('legalName', e.target.value)} 
              required 
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-400 mb-2 block">ЄДРПОУ / ІПН *</label>
            <input 
              className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-agro-400 font-mono focus:ring-2 focus:ring-agro-500 outline-none" 
              placeholder="12345678"
              value={form.edrpou} 
              onChange={(e) => set('edrpou', e.target.value)} 
              required 
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-400 mb-2 block">Country</label>
            <select 
              className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-agro-500 outline-none"
              value={form.country} 
              onChange={(e) => set('country', e.target.value)}
            >
              <option value="UA">Ukraine</option>
              <option value="PL">Poland</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-400 mb-2 block">Region / Oblast *</label>
            <input 
              className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-agro-500 outline-none" 
              placeholder="e.g. Kyivska"
              value={form.region} 
              onChange={(e) => set('region', e.target.value)} 
              required 
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-800">
          <p className="text-xs font-bold text-agro-500 uppercase tracking-widest">Verification Documents (IPFS)</p>
          <input className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-sm font-mono text-gray-300" placeholder="IPFS Hash 1 (Passport/Extract)" value={form.doc1} onChange={(e) => set('doc1', e.target.value)} required />
          <input className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-sm font-mono text-gray-300" placeholder="IPFS Hash 2 (Registration)" value={form.doc2} onChange={(e) => set('doc2', e.target.value)} />
          <input className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-sm font-mono text-gray-300" placeholder="IPFS Hash 3 (Optional)" value={form.doc3} onChange={(e) => set('doc3', e.target.value)} />
        </div>

        <TxStatus tx={tx} />

        <button 
          type="submit" 
          disabled={isPending}
          className="w-full bg-agro-600 hover:bg-agro-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-agro-600/20 disabled:opacity-50"
        >
          {isPending ? 'Sending to Blockchain...' : 'Submit KYC Application'}
        </button>
      </form>
    </div>
  )
}
