'use client'
export const dynamic = 'force-dynamic'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { usePools } from '@/hooks/usePools'
import { PairsTable } from '@/components/PairsTable'

export default function MarketPage() {
  const { data: pools, isLoading } = usePools()
  const [search, setSearch] = useState('')

  // ФІКС: Безпечна фільтрація з перевіркою на масив
  const filtered = useMemo(() => {
    if (!Array.isArray(pools)) return []
    
    return (pools as any[]).filter((p) => {
      const s = search.toLowerCase()
      return (
        !search ||
        p.tokenAMint?.toLowerCase().includes(s) ||
        p.tokenBMint?.toLowerCase().includes(s) ||
        p.tokenASymbol?.toLowerCase().includes(s) ||
        p.tokenBSymbol?.toLowerCase().includes(s)
      )
    })
  }, [pools, search])

  // ФІКС: Безпечний розрахунок ліквідності
  const totalLiquidity = useMemo(() => {
    if (!Array.isArray(pools)) return 0
    return (pools as any[]).reduce((sum, p) => sum + (Number(p.liquidity) || 0), 0)
  }, [pools])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Market</h1>
          <p className="text-gray-400 mt-1">All agricultural token trading pairs</p>
        </div>
        <Link href="/create-pool" className="btn-primary">+ Create Pool</Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="card text-center bg-gray-900/50 p-4 rounded-xl border border-gray-800">
          <p className="text-2xl font-bold text-agro-400">
            {Array.isArray(pools) ? pools.length : '—'}
          </p>
          <p className="text-sm text-gray-500 mt-1">Active Pools</p>
        </div>
        <div className="card text-center bg-gray-900/50 p-4 rounded-xl border border-gray-800">
          <p className="text-2xl font-bold text-agro-400">
            ${totalLiquidity > 0 ? totalLiquidity.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '—'}
          </p>
          <p className="text-sm text-gray-500 mt-1">Total Liquidity</p>
        </div>
        <div className="card text-center col-span-2 md:col-span-1 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
          <p className="text-2xl font-bold text-blue-400">Devnet</p>
          <p className="text-sm text-gray-500 mt-1">Network</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <input
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 focus:ring-2 focus:ring-agro-500 outline-none"
          placeholder="Search by token or address…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <PairsTable pools={filtered} isLoading={isLoading} />
    </div>
  )
}
