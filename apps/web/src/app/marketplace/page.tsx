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
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Marketplace</h1>
          <p className="text-gray-400 mt-1">Verified agricultural assets available for investment</p>
        </div>
        <div className="flex items-center gap-3">
          {wheatPrice.data && (
            <div className="card py-2 px-4 text-sm">
              <span className="text-gray-400">WHEAT/USD</span>
              <span className="text-green-400 font-semibold ml-2">
                ${wheatPrice.data.price.toFixed(2)}
              </span>
            </div>
          )}
          <Link href="/create-asset" className="btn-primary">+ List Asset</Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          className="input max-w-xs"
          placeholder="Search assets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input w-40" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)}>
          <option value="All">All types</option>
          {TOKEN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="input w-44" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as any)}>
          <option value="All">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="card h-56 animate-pulse bg-gray-800" />)}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="card text-center py-16 text-gray-500">
          No assets found.{' '}
          <Link href="/create-asset" className="text-green-400 underline">List the first one</Link>
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <>
          <p className="text-sm text-gray-500">{filtered.length} listing{filtered.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((listing) => (
              <AssetCard key={listing.address} listing={listing} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
