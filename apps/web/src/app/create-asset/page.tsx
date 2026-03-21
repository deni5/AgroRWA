'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useEmitterProfile } from '@/hooks/useIdentity'
import { usePythPrice, calcForwardPrice } from '@/hooks/usePyth'
import { TxStatus } from '@/components/TxStatus'
import type { TokenType, AssetCategory, TxState } from '@/types'
import toast from 'react-hot-toast'

const TOKEN_TYPES: { value: TokenType; label: string; desc: string }[] = [
  { value: 'Forward', label: '🌾 Forward Token', desc: 'Future harvest — price anchored to Pyth spot' },
  { value: 'Asset',   label: '🚜 Asset Token',   desc: 'Equipment, commodity, land backed by appraisal' },
  { value: 'Credit',  label: '💳 Credit Token',  desc: 'Agricultural bond with fixed coupon payments' },
  { value: 'Revenue', label: '📈 Revenue Token', desc: 'Share of farm seasonal revenue' },
]

const CATEGORIES: AssetCategory[] = ['Grain', 'Oilseeds', 'Livestock', 'Land', 'Equipment', 'Storage', 'Other']

export default function CreateAssetPage() {
  const { publicKey } = useWallet()
  const { data: emitter } = useEmitterProfile(publicKey?.toBase58())
  const wheatPrice = usePythPrice('WHEAT/USD')

  const [step, setStep] = useState(1)
  const [tx, setTx] = useState<TxState>({ status: 'idle' })
  const [form, setForm] = useState({
    tokenType: 'Forward' as TokenType,
    title: '',
    description: '',
    category: 'Grain' as AssetCategory,
    locationGps: '',
    characteristics: '',
    totalSupply: '',
    unit: 'ton',
    pricePerUnit: '',
    currency: 'USDC',
    deliveryDate: '',
    doc1: '', doc2: '', doc3: '',
    requiredVerifications: '2',
  })

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  // Safe calculation for Pyth price
  const suggestedPrice = useMemo(() => {
    if (form.tokenType === 'Forward' && wheatPrice.data && emitter) {
      // Додаємо 'as any', щоб TypeScript не сварився на відсутність поля price в типі
      const currentPrice = (wheatPrice.data as any).price || 0
      return calcForwardPrice(currentPrice, 90, emitter.ratingScore)
    }
    return null
  }, [form.tokenType, wheatPrice.data, emitter])

  if (!publicKey) return (
    <div className="max-w-lg mx-auto card text-center py-16 space-y-4">
      <p className="text-gray-400">Connect wallet to create an asset listing.</p>
      <WalletMultiButton />
    </div>
  )

  if (!emitter || emitter.kycStatus !== 'Approved') return (
    <div className="max-w-lg mx-auto card text-center py-12 space-y-4">
      <div className="text-4xl">🔐</div>
      <h2 className="text-xl font-semibold text-gray-100">KYC Required</h2>
      <p className="text-gray-400">You need approved KYC status to create asset listings.</p>
      <a href="/kyc" className="btn-primary inline-block">Register as Emitter</a>
    </div>
  )

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-100">Create Asset Token</h1>
        <p className="text-gray-400 mt-1">Tokenize your agricultural asset in 3 steps.</p>
      </div>

      {/* Steps indicator */}
      <div className="flex gap-2">
        {['Asset Details', 'Pricing & Docs', 'Review'].map((s, i) => (
          <div key={s} className={`flex-1 text-center text-sm py-2 rounded-lg border transition-colors ${
            step === i + 1 ? 'border-green-600 bg-green-900/30 text-green-400' :
            step > i + 1  ? 'border-green-800 bg-green-900/10 text-green-600' :
                            'border-gray-700 text-gray-500'
          }`}>{i + 1}. {s}</div>
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="card space-y-5">
          <h2 className="text-lg font-semibold text-gray-100">Token Type</h2>
          <div className="grid grid-cols-2 gap-3">
            {TOKEN_TYPES.map(({ value, label, desc }) => (
              <button key={value} type="button"
                onClick={() => set('tokenType', value)}
                className={`text-left p-3 rounded-lg border transition-colors ${
                  form.tokenType === value
                    ? 'border-green-600 bg-green-900/30'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <p className="font-medium text-sm text-gray-100">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </button>
            ))}
          </div>

          <div>
            <label className="label">Asset Title *</label>
            <input className="input" placeholder="Wheat Harvest 2025 · Kharkiv Region"
              value={form.title} onChange={(e) => set('title', e.target.value)} required maxLength={64} />
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea className="input resize-none" rows={3}
              placeholder="Describe the asset, quality, conditions..."
              value={form.description} onChange={(e) => set('description', e.target.value)}
              required maxLength={512} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category *</label>
              <select className="input" value={form.category} onChange={(e) => set('category', e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Unit *</label>
              <select className="input" value={form.unit} onChange={(e) => set('unit', e.target.value)}>
                {['ton', 'kg', 'unit', 'ha', 'liter', 'piece'].map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">GPS Location (lat,lng)</label>
            <input className="input font-mono" placeholder="49.9935,36.2304"
              value={form.locationGps} onChange={(e) => set('locationGps', e.target.value)} />
          </div>
          <div>
            <label className="label">Characteristics (JSON)</label>
            <input className="input font-mono text-sm"
              placeholder='{"class":"2","moisture":"14%","protein":"12%"}'
              value={form.characteristics} onChange={(e) => set('characteristics', e.target.value)} />
          </div>

          <button type="button" className="btn-primary w-full" onClick={() => setStep(2)}
            disabled={!form.title || !form.description}>
            Next: Pricing & Documents →
          </button>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="card space-y-5">
          <h2 className="text-lg font-semibold text-gray-100">Pricing & Documents</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Total Supply *</label>
              <input className="input" type="number" min="1" placeholder="100"
                value={form.totalSupply} onChange={(e) => set('totalSupply', e.target.value)} required />
              <p className="text-xs text-gray-500 mt-1">in {form.unit}s</p>
            </div>
            <div>
              <label className="label">Delivery Date *</label>
              <input className="input" type="date"
                value={form.deliveryDate} onChange={(e) => set('deliveryDate', e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Price per {form.unit} (USDC) *</label>
              <input className="input" type="number" min="0" step="0.01" placeholder="215.50"
                value={form.pricePerUnit} onChange={(e) => set('pricePerUnit', e.target.value)} required />
              {suggestedPrice && (
                <button type="button" className="text-xs text-green-400 mt-1 hover:underline"
                  onClick={() => set('pricePerUnit', suggestedPrice.toFixed(2))}>
                  Pyth suggested: ${suggestedPrice.toFixed(2)} (click to use)
                </button>
              )}
            </div>
            <div>
              <label className="label">Required Verifications</label>
              <select className="input" value={form.requiredVerifications}
                onChange={(e) => set('requiredVerifications', e.target.value)}>
                <option value="1">1 oracle</option>
                <option value="2">2 oracles</option>
                <option value="3">3 oracles</option>
              </select>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-4 space-y-3">
            <p className="text-sm font-medium text-gray-300">Documents (IPFS hashes)</p>
            {[
              { key: 'doc1', label: 'Ownership / Right of title *' },
              { key: 'doc2', label: 'Quality Report / Expert Assessment' },
              { key: 'doc3', label: 'Notarial Deed / Legal Clearance' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input className="input font-mono text-sm" placeholder="QmXxx..."
                  value={(form as any)[key]} onChange={(e) => set(key, e.target.value)}
                  required={key === 'doc1'} />
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button type="button" className="btn-secondary flex-1" onClick={() => setStep(1)}>← Back</button>
            <button type="button" className="btn-primary flex-1" onClick={() => setStep(3)}
              disabled={!form.totalSupply || !form.pricePerUnit || !form.doc1}>
              Next: Review →
            </button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-gray-100">Review & Submit</h2>
          <div className="bg-gray-800/60 rounded-lg p-4 space-y-2 text-sm">
            {[
              ['Type', form.tokenType],
              ['Title', form.title],
              ['Category', form.category],
              ['Supply', `${form.totalSupply} ${form.unit}`],
              ['Price', `${form.pricePerUnit} USDC / ${form.unit}`],
              ['Delivery', form.deliveryDate],
              ['Verifications needed', form.requiredVerifications],
              ['Emitter deposit', `${((Number(form.pricePerUnit || 0) * Number(form.totalSupply || 0)) * (emitter?.depositBps || 0) / 10000).toFixed(2)} USDC (${(emitter?.depositBps || 0) / 100}% — rating ${emitter?.ratingLabel || 'N/A'})`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-gray-400">{k}</span>
                <span className="text-gray-100">{v}</span>
              </div>
            ))}
          </div>

          <TxStatus tx={tx} />

          <div className="flex gap-3">
            <button type="button" className="btn-secondary flex-1" onClick={() => setStep(2)}>← Back</button>
            <button type="button" className="btn-primary flex-1 py-3"
              disabled={tx.status === 'pending'}
              onClick={() => toast.error('Connect IDL after anchor build to enable on-chain submit')}>
              {tx.status === 'pending' ? 'Creating...' : 'Create Asset Token'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
