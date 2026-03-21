'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useRegisterToken, RegisterTokenInput } from '@/hooks/useTokenRegistry'
import { TxStatus } from '@/components/TxStatus'
import { AssetCategory, TxState } from '@/types'

// ВИПРАВЛЕНО: Категорії тепер відповідають системному типу AssetCategory
const CATEGORIES: AssetCategory[] = [
  'Grain', 
  'Oilseeds', 
  'Livestock', 
  'Land', 
  'Equipment', 
  'Storage', 
  'Other'
]

// ВИПРАВЛЕНО: Значення за замовчуванням змінено з 'Farmland' на 'Land'
const DEFAULT_FORM: RegisterTokenInput = {
  mintAddress: '',
  title: '',
  description: '',
  category: 'Land', 
  logoUrl: '',
  bonusEnabled: false,
  rewardMint: '',
}

export default function RegisterTokenPage() {
  const { publicKey } = useWallet()
  const { mutateAsync, isPending } = useRegisterToken()
  const [form, setForm] = useState<RegisterTokenInput>(DEFAULT_FORM)
  const [tx, setTx] = useState<TxState>({ status: 'idle' })

  const set = (field: keyof RegisterTokenInput, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTx({ status: 'pending' })
    try {
      const sig = await mutateAsync(form)
      setTx({ status: 'success', signature: sig })
      setForm(DEFAULT_FORM)
    } catch (err: any) {
      setTx({ status: 'error', error: err.message })
    }
  }

  if (!publicKey) {
    return (
      <div className="max-w-lg mx-auto card text-center py-16 space-y-4">
        <p className="text-gray-400">Connect your wallet to register an asset.</p>
        <WalletMultiButton />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-100">Register Asset</h1>
        <p className="text-gray-400 mt-1">
          Tokenize your agricultural asset by registering its SPL token mint.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="label">Token Mint Address *</label>
          <input
            className="input font-mono"
            placeholder="Solana pubkey of the SPL token mint"
            value={form.mintAddress}
            onChange={(e) => set('mintAddress', e.target.value.trim())}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Title *</label>
            <input
              className="input"
              placeholder="e.g. Wheat Harvest 2025"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              maxLength={64}
              required
            />
          </div>
          <div>
            <label className="label">Category *</label>
            <select
              className="input"
              value={form.category}
              onChange={(e) => set('category', e.target.value as AssetCategory)}
              required
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Description *</label>
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="Describe your agricultural asset…"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            maxLength={256}
            required
          />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-gray-500 italic">This will be stored on-chain</p>
            <p className="text-xs text-gray-600">{form.description.length}/256</p>
          </div>
        </div>

        <div>
          <label className="label">Logo URL</label>
          <input
            className="input"
            placeholder="https://… or IPFS CID"
            value={form.logoUrl}
            onChange={(e) => set('logoUrl', e.target.value.trim())}
          />
        </div>

        <div className="border-t border-gray-800 pt-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              className="w-4 h-4 accent-green-500 rounded"
              checked={form.bonusEnabled}
              onChange={(e) => set('bonusEnabled', e.target.checked)}
            />
            <span className="text-gray-300 group-hover:text-white transition-colors">Enable bonus rewards</span>
          </label>

          {form.bonusEnabled && (
            <div className="mt-3 animate-in fade-in slide-in-from-top-2">
              <label className="label">Reward Token Mint</label>
              <input
                className="input font-mono"
                placeholder="SPL mint address for reward token"
                value={form.rewardMint}
                onChange={(e) => set('rewardMint', e.target.value.trim())}
              />
            </div>
          )}
        </div>

        <TxStatus tx={tx} />

        <button 
          type="submit" 
          className="btn-primary w-full py-3 font-bold" 
          disabled={isPending}
        >
          {isPending ? 'Registering…' : 'Register Asset'}
        </button>
      </form>
    </div>
  )
}
