'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TokenCard } from '@/components/TokenCard'
import { useAllTokens } from '@/hooks/useTokenRegistry'
import { AssetCategory } from '@/types'

const CATEGORIES: AssetCategory[] = [
  'Farmland', 'GrainProduction', 'Livestock',
  'HarvestFutures', 'AgriculturalMachinery', 'Other',
]

export default function TokensPage() {
  const { data: tokens, isLoading, error } = useAllTokens()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<AssetCategory | 'All'>('All')

  const filtered = tokens?.filter((t) => {
    const matchSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.symbol.toLowerCase().includes(search.toLowerCase()) ||
      t.mint.toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === 'All' || t.category === category
    return matchSearch && matchCategory
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Tokens</h1>
          <p className="text-gray-400 mt-1">Registered agricultural real-world assets</p>
        </div>
        <Link href="/register-token" className="btn-primary">
          + Register Asset
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          className="input flex-1"
          placeholder="Search by name, symbol, or address…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input sm:w-56"
          value={category}
          onChange={(e) => setCategory(e.target.value as AssetCategory | 'All')}
        >
          <option value="All">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.replace(/([A-Z])/g, ' $1').trim()}
            </option>
          ))}
        </select>
      </div>

      {/* Results */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse h-40 bg-gray-800" />
          ))}
        </div>
      )}

      {error && (
        <div className="card border-red-800 text-red-400 text-center py-8">
          Failed to load tokens. Make sure the program is deployed.
        </div>
      )}

      {!isLoading && !error && filtered?.length === 0 && (
        <div className="card text-center py-16 text-gray-500">
          <p className="text-lg mb-2">No tokens found.</p>
          <Link href="/register-token" className="text-agro-400 underline">
            Register the first agricultural asset
          </Link>
        </div>
      )}

      {!isLoading && filtered && filtered.length > 0 && (
        <>
          <p className="text-sm text-gray-500">{filtered.length} asset{filtered.length !== 1 ? 's' : ''} found</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((token) => (
              <TokenCard key={token.mint} token={token} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
