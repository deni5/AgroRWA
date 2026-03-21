'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TokenCard } from '@/components/TokenCard'
import { useAllTokens } from '@/hooks/useTokenRegistry'
import { AssetCategory } from '@/types'

// ВИПРАВЛЕНО: Категорії тепер відповідають типу AssetCategory з types/index.ts
const CATEGORIES: AssetCategory[] = [
  'Grain', 
  'Oilseeds', 
  'Livestock', 
  'Land', 
  'Equipment', 
  'Storage', 
  'Other',
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
    
    // Перевірка категорії (тепер типи збігаються)
    const matchCategory = category === 'All' || t.category === category
    return matchSearch && matchCategory
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Tokens</h1>
          <p className="text-gray-400 mt-1">Registered agricultural real-world assets (RWA)</p>
        </div>
        <Link href="/register-token" className="btn-primary whitespace-nowrap text-center">
          + Register Asset
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            className="input w-full pl-10"
            placeholder="Search by name, symbol, or address…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
        </div>
        <select
          className="input sm:w-64 bg-gray-900 border-gray-800 focus:border-agro-500"
          value={category}
          onChange={(e) => setCategory(e.target.value as AssetCategory | 'All')}
        >
          <option value="All">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Results */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse h-48 bg-gray-800/50 border-gray-800" />
          ))}
        </div>
      )}

      {error && (
        <div className="card border-red-900/50 bg-red-900/10 text-red-400 text-center py-10">
          <p className="font-bold">Failed to load tokens</p>
          <p className="text-sm opacity-80">Make sure your RPC provider is active and the program is deployed.</p>
        </div>
      )}

      {!isLoading && !error && filtered?.length === 0 && (
        <div className="card text-center py-20 border-dashed border-gray-800">
          <p className="text-lg text-gray-400 mb-4">No assets found matching your criteria.</p>
          <Link href="/register-token" className="btn-secondary py-2 px-6">
            Register New Asset
          </Link>
        </div>
      )}

      {!isLoading && filtered && filtered.length > 0 && (
        <>
          <div className="flex justify-between items-center">
             <p className="text-sm text-gray-500">Showing {filtered.length} verified asset{filtered.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((token) => (
              <TokenCard key={token.mint} token={token} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
