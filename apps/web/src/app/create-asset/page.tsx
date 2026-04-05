'use client'

import { useState, useMemo } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useEmitterProfile } from '@/hooks/useIdentity'
import { useCreateAsset } from '@/hooks/useAsset'
import { usePythPrice, calcForwardPrice } from '@/hooks/usePyth'
import { TxStatus } from '@/components/TxStatus'
import type { TokenType, AssetCategory, TxState } from '@/types'

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
  const createAsset = useCreateAsset()

  const [step, setStep] = useState(1)
  const [tx, setTx] = useState<TxState>({ status: 'idle' })
  const [form, setForm] = useState({
    tokenType: 'Forward' as TokenType,
    title: '', description: '',
    category: 'Grain' as AssetCategory,
    locationGps: '', characteristics: '',
    totalSupply: '', unit: 'ton',
    pricePerUnit: '', currency: 'USDC',
    deliveryDate: '', doc1: '', doc2: '', doc3: '',
    requiredVerifications: '2',
  })

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const suggestedPrice = useMemo(() => {
    if (form.tokenType === 'Forward' && wheatPrice.data && emitter) {
      const currentPrice = (wheatPrice.data as any).price || 0
      return calcForwardPrice(currentPrice, 90, emitter.ratingScore)
    }
    return null
  }, [form.tokenType, wheatPrice.data, emitter])

  const handleSubmit = async () => {
    setTx({ status: 'pending' })
    try {
      const result = await createAsset.mutateAsync({
        tokenType: form.tokenType,
        title: form.title,
        description: form.description,
        category: form.category,
        locationGps: form.locationGps || '',
        characteristics: form.characteristics || '{}',
        totalSupply: BigInt(parseInt(form.totalSupply)),
        unit: form.unit,
        pricePerUnit: BigInt(Math.round(parseFloat(form.pricePerUnit) * 1_000_000)),
        currency: 'USDC',
        deliveryDate: Math.floor(new Date(form.deliveryDate).getTime() / 1000),
        docsIpfs: [form.doc1, form.doc2, form.doc3].filter(Boolean),
        requiredVerifications: parseInt(form.requiredVerifications),
      })
      setTx({ status: 'success', sig: result.sig })
    } catch (e: any) {
      setTx({ status: 'error', error: e?.message ?? 'Transaction failed' })
    }
  }

  if (!publicKey) return (
    <div className="card" style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center', padding: '64px 32px' }}>
      <p style={{ color: '#5a8a6a', marginBottom: '24px' }}>Connect wallet to create an asset listing.</p>
      <WalletMultiButton />
    </div>
  )

  if (!emitter || emitter.kycStatus !== 'Approved') return (
    <div className="card" style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center', padding: '48px 32px' }}>
      <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔐</div>
      <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>KYC Required</h2>
      <p style={{ color: '#5a8a6a', marginBottom: '24px', fontSize: '14px' }}>You need approved KYC status to create asset listings.</p>
      <a href="/kyc" className="btn-primary" style={{ display: 'inline-block' }}>Register as Emitter</a>
    </div>
  )

  return (
    <div style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: '32px', fontWeight: '700', letterSpacing: '-0.03em', marginBottom: '6px' }}>
          Create Asset Token
        </h1>
        <p style={{ color: '#5a8a6a', fontSize: '15px' }}>Tokenize your agricultural asset in 3 steps.</p>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {['Asset Details', 'Pricing & Docs', 'Review'].map((s, i) => (
          <div key={s} style={{
            flex: 1, textAlign: 'center', fontSize: '12px', fontWeight: '600',
            padding: '8px 4px',
            borderBottom: `2px solid ${step === i+1 ? '#2d6a4f' : step > i+1 ? '#52b788' : 'rgba(26,67,40,0.12)'}`,
            color: step === i+1 ? '#2d6a4f' : step > i+1 ? '#52b788' : '#9cbb9e',
            transition: 'all 0.2s',
            letterSpacing: '0.02em',
          }}>
            {i + 1}. {s}
          </div>
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.02em' }}>Token Type</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {TOKEN_TYPES.map(({ value, label, desc }) => (
              <button key={value} type="button" onClick={() => set('tokenType', value)} style={{
                textAlign: 'left', padding: '14px', borderRadius: '16px', cursor: 'pointer',
                border: form.tokenType === value ? '1.5px solid #2d6a4f' : '1.5px solid rgba(26,67,40,0.1)',
                background: form.tokenType === value ? '#e8f7ed' : '#f8fbf9',
                transition: 'all 0.2s',
              }}>
                <p style={{ fontWeight: '600', fontSize: '14px', color: '#1a4328', marginBottom: '4px' }}>{label}</p>
                <p style={{ fontSize: '12px', color: '#7aaa88', lineHeight: '1.4' }}>{desc}</p>
              </button>
            ))}
          </div>

          <div>
            <label className="label">Asset Title *</label>
            <input className="input" placeholder="Wheat Harvest 2025 · Kharkiv Region"
              value={form.title} onChange={(e) => set('title', e.target.value)} maxLength={64} />
          </div>

          <div>
            <label className="label">Description *</label>
            <textarea className="input" style={{ resize: 'none' }} rows={3}
              placeholder="Describe the asset, quality, conditions..."
              value={form.description} onChange={(e) => set('description', e.target.value)} maxLength={512} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
            <input className="input" style={{ fontFamily: 'monospace' }} placeholder="49.9935,36.2304"
              value={form.locationGps} onChange={(e) => set('locationGps', e.target.value)} />
          </div>

          <div>
            <label className="label">Characteristics (JSON)</label>
            <input className="input" style={{ fontFamily: 'monospace', fontSize: '13px' }}
              placeholder='{"class":"2","moisture":"14%","protein":"12%"}'
              value={form.characteristics} onChange={(e) => set('characteristics', e.target.value)} />
          </div>

          <button type="button" className="btn-primary" style={{ width: '100%', padding: '14px' }}
            onClick={() => setStep(2)} disabled={!form.title || !form.description}>
            Next: Pricing & Documents →
          </button>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.02em' }}>Pricing & Documents</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="label">Total Supply *</label>
              <input className="input" type="number" min="1" placeholder="100"
                value={form.totalSupply} onChange={(e) => set('totalSupply', e.target.value)} />
              <p style={{ fontSize: '12px', color: '#9cbb9e', marginTop: '4px' }}>in {form.unit}s</p>
            </div>
            <div>
              <label className="label">Delivery Date *</label>
              <input className="input" type="date"
                value={form.deliveryDate} onChange={(e) => set('deliveryDate', e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="label">Price per {form.unit} (USDC) *</label>
              <input className="input" type="number" min="0" step="0.01" placeholder="215.50"
                value={form.pricePerUnit} onChange={(e) => set('pricePerUnit', e.target.value)} />
              {suggestedPrice && (
                <button type="button" onClick={() => set('pricePerUnit', suggestedPrice.toFixed(2))}
                  style={{ fontSize: '12px', color: '#52b788', marginTop: '4px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
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

          <div style={{ borderTop: '1px solid rgba(26,67,40,0.08)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label className="label">Documents (IPFS hashes)</label>
            {[
              { key: 'doc1', placeholder: 'Ownership / Right of title *' },
              { key: 'doc2', placeholder: 'Quality Report / Expert Assessment' },
              { key: 'doc3', placeholder: 'Notarial Deed / Legal Clearance' },
            ].map(({ key, placeholder }) => (
              <input key={key} className="input" style={{ fontFamily: 'monospace', fontSize: '13px' }}
                placeholder={`QmXxx... — ${placeholder}`}
                value={(form as any)[key]} onChange={(e) => set(key, e.target.value)} />
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>← Back</button>
            <button type="button" className="btn-primary" style={{ flex: 1 }} onClick={() => setStep(3)}
              disabled={!form.totalSupply || !form.pricePerUnit || !form.doc1}>
              Next: Review →
            </button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.02em' }}>Review & Submit</h2>

          <div style={{ background: '#f4faf6', borderRadius: '16px', padding: '20px' }}>
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
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(26,67,40,0.06)', fontSize: '14px' }}>
                <span style={{ color: '#7aaa88', fontSize: '13px' }}>{k}</span>
                <span style={{ color: '#1a4328', fontWeight: '600' }}>{v}</span>
              </div>
            ))}
          </div>

          <TxStatus tx={tx} />

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setStep(2)}>← Back</button>
            <button type="button" className="btn-primary" style={{ flex: 1, padding: '16px' }}
              disabled={tx.status === 'pending' || createAsset.isPending}
              onClick={handleSubmit}>
              {tx.status === 'pending' || createAsset.isPending ? 'Creating...' : 'Create Asset Token'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
