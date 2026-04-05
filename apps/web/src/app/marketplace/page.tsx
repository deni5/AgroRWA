'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAllListings } from '@/hooks/useMarketplace'
import { usePythPrice } from '@/hooks/usePyth'
import { AssetCard } from '@/components/AssetCard'
import type { TokenType, AssetCategory } from '@/types'

const TOKEN_TYPES: TokenType[] = ['Forward', 'Asset', 'Credit', 'Revenue']
const CATEGORIES: AssetCategory[] = ['Grain', 'Oilseeds', 'Livestock', 'Land', 'Equipment', 'Storage', 'Other']

export default function MarketplacePage() {
  const { data: listings, isLoading } = useAllListings()
  const wheatPrice = usePythPrice('WHEAT/USD')

  const [typeFilter, setTypeFilter] = useState<TokenType | 'All'>('All')
  const [categoryFilter, setCategoryFilter] = useState<AssetCategory | 'All'>('All')
  const [search, setSearch] = useState('')

  const filtered = listings?.filter((l) => {
    if (typeFilter !== 'All' && l.asset?.tokenType !== typeFilter) return false
    if (categoryFilter !== 'All' && l.asset?.category !== categoryFilter) return false
    if (search && !l.asset?.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }) ?? []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '700', letterSpacing: '-0.03em', marginBottom: '4px' }}>
            Marketplace
          </h1>
          <p style={{ color: '#5a8a6a', fontSize: '14px' }}>
            Verified agricultural assets available for investment
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {wheatPrice.data && (
            <div style={{
              background: '#fff',
              border: '1px solid rgba(26,67,40,0.08)',
              borderRadius: '12px',
              padding: '8px 16px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px -2px rgba(26,67,40,0.08)',
            }}>
              <span style={{ color: '#7aaa88' }}>WHEAT/USD</span>
              <span style={{ color: '#2d6a4f', fontWeight: '700', fontFamily: 'monospace' }}>
                ${(wheatPrice.data as any).price?.toFixed(2) || '0.00'}
              </span>
            </div>
          )}
          <Link href="/create-asset" className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
            + List Asset
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        <input
          className="input"
          style={{ maxWidth: '260px' }}
          placeholder="Search assets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input"
          style={{ width: '160px' }}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
        >
          <option value="All">All types</option>
          {TOKEN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          className="input"
          style={{ width: '180px' }}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as any)}
        >
          <option value="All">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              height: '220px',
              borderRadius: '20px',
              background: 'linear-gradient(90deg, #f0f7f2 25%, #e8f5eb 50%, #f0f7f2 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && filtered.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '64px 32px' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>🌾</div>
          <p style={{ color: '#7aaa88', fontSize: '15px', marginBottom: '16px' }}>
            No assets found.
          </p>
          <Link href="/create-asset" className="btn-primary" style={{ display: 'inline-block', padding: '12px 24px' }}>
            List the first asset
          </Link>
        </div>
      )}

      {/* Results */}
      {!isLoading && filtered.length > 0 && (
        <>
          <p style={{ fontSize: '13px', color: '#9cbb9e' }}>
            {filtered.length} listing{filtered.length !== 1 ? 's' : ''} found
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {filtered.map((listing) => (
              <AssetCard key={listing.address.toString()} listing={listing} />
            ))}
          </div>
        </>
      )}

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

    </div>
  )
}
