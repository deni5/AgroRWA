'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useRegisterToken, RegisterTokenInput } from '@/hooks/useTokenRegistry'
import { TxStatus } from '@/components/TxStatus'
import { AssetCategory, TxState } from '@/types'

const CATEGORIES: AssetCategory[] = [
  'Grain', 
  'Oilseeds', 
  'Livestock', 
  'Land', 
  'Equipment', 
  'Storage', 
  'Other'
]

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
    
    // Проста валідація адреси
    if (form.mintAddress.length < 32) {
      setTx({ status: 'error', error: 'Invalid Mint Address' })
      return
    }

    setTx({ status: 'pending' })
    try {
      const sig = await mutateAsync(form)
      setTx({ status: 'success', signature: sig })
      setForm(DEFAULT_FORM)
    } catch (err: any) {
      setTx({ status: 'error', error: err.message || 'Transaction failed' })
    }
  }

  if (!publicKey) {
    return (
      <div className="max-w-lg mx-auto card text-center py-20 space-y-6 border-dashed border-gray-800">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center text-3xl">🪪</div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-100">Wallet Required</h2>
          <p className="text-gray-400">Please connect your wallet to access the registration portal.</p>
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
          🌱
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Register Asset</h1>
          <p className="text-gray-400">Tokenize your agricultural real-world assets</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6 bg-gray-900/40 border-gray-800">
        <div className="space-y-4">
          <div>
            <label className="label text-gray-400">Token Mint Address <span className="text-agro-500">*</span></label>
            <input
              className="input font-mono focus:border-agro-500"
              placeholder="Ex: 7xKX...j8Pn"
              value={form.mintAddress}
              onChange={(e) => set('mintAddress', e.target.value.trim())}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="label text-gray-400">Asset Title <span className="text-agro-500">*</span></label>
              <input
                className="input focus:border-agro-500"
                placeholder="e.g. Corn Batch #42"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                maxLength={64}
                required
              />
            </div>
            <div>
              <label className="label text-gray-400">Category <span className="text-agro-500">*</span></label>
              <select
                className="input focus:border-agro-500 bg-gray-950"
                value={form.category}
                onChange={(e) => set('category', e.target.value as AssetCategory)}
                required
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label text-gray-400">Description <span className="text-agro-500">*</span></label>
            <textarea
              className="input resize-none focus:border-agro-500"
              rows={4}
              placeholder="Detailed information about the asset, harvest date, location..."
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              maxLength={256}
              required
            />
            <div className="flex justify-between mt-1 px-1">
              <p className="text-[10px] text-gray-600 uppercase font-bold tracking-tighter">On-chain storage</p>
              <p className={`text-xs ${form.description.length > 240 ? 'text-red-500' : 'text-gray-600'}`}>
                {form.description.length}/256
              </p>
            </div>
          </div>

          <div>
            <label className="label text-gray-400">Logo or Image URL</label>
            <input
              className="input focus:border-agro-500"
              placeholder="https://arweave.net/... or ipfs://"
              value={form.logoUrl}
              onChange={(e) => set('logoUrl', e.target.value.trim())}
            />
          </div>

          <div className="pt-4 border-t border-gray-800">
            <div className="flex items-center justify-between bg-black/20 p-4 rounded-xl border border-gray-800">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="bonus-toggle"
                  className="w-5 h-5 accent-agro-500 cursor-pointer"
                  checked={form.bonusEnabled}
                  onChange={(e) => set('bonusEnabled', e.target.checked)}
                />
                <label htmlFor="bonus-toggle" className="text-sm font-medium text-gray-300 cursor-pointer">
                  Enable Staking Bonus Rewards
                </label>
              </div>
              <span className="text-[10px] bg-agro-500/10 text-agro-400 px-2 py-0.5 rounded border border-agro-500/20">Optional</span>
            </div>

            {form.bonusEnabled && (
              <div className="mt-4 p-4 bg-agro-900/10 border border-agro-800/50 rounded-xl animate-in fade-in zoom-in-95">
                <label className="label text-agro-400">Reward Token Mint Address</label>
                <input
                  className="input font-mono border-agro-900 focus:border-agro-500"
                  placeholder="The mint address of the reward token"
                  value={form.rewardMint}
                  onChange={(e) => set('rewardMint', e.target.value.trim())}
                />
              </div>
            )}
          </div>
        </div>

        <TxStatus tx={tx} />

        <button 
          type="submit" 
          className="btn-primary w-full py-4 text-lg font-bold shadow-lg shadow-agro-900/20" 
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
          ) : 'Register Asset'}
        </button>
      </form>
    </div>
  )
}
