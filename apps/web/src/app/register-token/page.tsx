'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import * as anchor from '@coral-xyz/anchor'
import { TxStatus } from '@/components/TxStatus'
import { TxState } from '@/types'

// Типізація вхідних даних для KYC
interface KYCInput {
  legalName: string
  taxId: string // ЄДРПОУ / ІПН
  country: string
  region: string
  docIpfsHash1: string
  docIpfsHash2: string
  docIpfsHash3: string
}

const DEFAULT_FORM: KYCInput = {
  legalName: '',
  taxId: '',
  country: 'Ukraine',
  region: '',
  docIpfsHash1: '',
  docIpfsHash2: '',
  docIpfsHash3: '',
}

export default function EmitterKYCPage() {
  const { publicKey, sendTransaction } = useWallet()
  const [form, setForm] = useState<KYCInput>(DEFAULT_FORM)
  const [tx, setTx] = useState<TxState>({ status: 'idle' })

  // Функція для оновлення полів
  const setField = (field: keyof KYCInput, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 1. Головний захист від 'undefined' (читання _bn)
    if (!publicKey) {
      setTx({ status: 'error', error: 'Wallet not connected' })
      return
    }

    setTx({ status: 'pending' })

    try {
      // 2. Валідація податкового номера (має бути числом)
      const taxIdNum = parseInt(form.taxId)
      if (isNaN(taxIdNum)) {
        throw new Error('Tax ID (ЄДРПОУ/ІПН) must be a valid number')
      }

      // 3. Перетворення в Big Number для Anchor
      // Саме тут зазвичай виникає помилка _bn, якщо передати не валідний об'єкт
      const taxIdBN = new anchor.BN(taxIdNum)

      console.log("Submitting KYC for:", publicKey.toBase58())
      
      /* Тут викликається твій хук або метод контракту. 
         Приклад передачі даних у контракт через програму:
         const sig = await program.methods
           .registerEmitter(form.legalName, taxIdBN, form.country, form.region, [form.docIpfsHash1, form.docIpfsHash2, form.docIpfsHash3])
           .accounts({
             emitter: publicKey,
             systemProgram: anchor.web3.SystemProgram.programId,
           })
           .rpc()
      */

      // Імітація виклику (заміни на реальний mutateAsync або program.rpc)
      // const sig = await mutateAsync({ ...form, taxId: taxIdBN }) 
      
      // Для тестування виведемо в консоль успіх
      console.log("Form successfully processed with BN:", taxIdBN.toString())
      
      setTx({ status: 'success', signature: 'SIMULATED_SIG_SUCCESS' })
      setForm(DEFAULT_FORM)
    } catch (err: any) {
      console.error("KYC Error Details:", err)
      // Виводимо зрозумілу помилку замість [object Object]
      setTx({ status: 'error', error: err.message || 'KYC Registration failed' })
    }
  }

  // Екран, якщо гаманець не підключений
  if (!publicKey) {
    return (
      <div className="max-w-lg mx-auto card text-center py-20 space-y-6 border-dashed border-gray-800 bg-gray-900/20">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center text-3xl">🛡️</div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-100">KYC Verification Required</h2>
          <p className="text-gray-400">Please connect your authorized wallet to start the emitter registration.</p>
        </div>
        <div className="flex justify-center">
          <WalletMultiButton className="!bg-agro-600 hover:!bg-agro-700" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-agro-600/20 border border-agro-500/50 rounded-xl flex items-center justify-center text-2xl">
          📑
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Emitter KYC Registration</h1>
          <p className="text-gray-400">Register your farm or company to start tokenizing assets</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6 bg-gray-900/40 border-gray-800 p-6 rounded-2xl">
        <div className="grid grid-cols-1 gap-6">
          {/* Legal Name */}
          <div>
            <label className="label text-gray-400">Legal Name / ПІБ *</label>
            <input
              className="input focus:border-agro-500"
              placeholder="Full Legal Name"
              value={form.legalName}
              onChange={(e) => setField('legalName', e.target.value)}
              required
            />
          </div>

          {/* Tax ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="label text-gray-400">ЄДРПОУ / ІПН *</label>
              <input
                className="input focus:border-agro-500"
                placeholder="12345678"
                type="text"
                value={form.taxId}
                onChange={(e) => setField('taxId', e.target.value.replace(/\D/g, ''))} // Тільки цифри
                required
              />
            </div>
            <div>
              <label className="label text-gray-400">Country</label>
              <select
                className="input focus:border-agro-500 bg-gray-950"
                value={form.country}
                onChange={(e) => setField('country', e.target.value)}
              >
                <option value="Ukraine">Ukraine</option>
                <option value="Poland">Poland</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Region */}
          <div>
            <label className="label text-gray-400">Region / Oblast *</label>
            <input
              className="input focus:border-agro-500"
              placeholder="e.g. Kyivska oblast"
              value={form.region}
              onChange={(e) => setField('region', e.target.value)}
              required
            />
          </div>

          {/* IPFS Hashes */}
          <div className="space-y-4 pt-4 border-t border-gray-800">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Document IPFS Hashes</h3>
            <input
              className="input text-xs font-mono"
              placeholder="Document 1: Passport/Extract"
              value={form.docIpfsHash1}
              onChange={(e) => setField('docIpfsHash1', e.target.value)}
              required
            />
            <input
              className="input text-xs font-mono"
              placeholder="Document 2: Registration"
              value={form.docIpfsHash2}
              onChange={(e) => setField('docIpfsHash2', e.target.value)}
              required
            />
            <input
              className="input text-xs font-mono"
              placeholder="Document 3: License (Optional)"
              value={form.docIpfsHash3}
              onChange={(e) => setField('docIpfsHash3', e.target.value)}
            />
          </div>
        </div>

        <TxStatus tx={tx} />

        <button
          type="submit"
          className="btn-primary w-full py-4 text-lg font-bold"
          disabled={tx.status === 'pending'}
        >
          {tx.status === 'pending' ? 'Processing...' : 'Submit KYC Application'}
        </button>
      </form>
    </div>
  )
}
