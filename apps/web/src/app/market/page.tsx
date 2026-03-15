'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePools } from '@/hooks/usePools'
import { PairsTable } from '@/components/PairsTable'

export default function MarketPage() {
  const { data: pools, isLoading } = usePools()
  const [search, setSearch] = useState('')

  const filtered = pools?.filter((p) =>
    !search ||
    p.tokenAMint.toLowerCase().includes(search.toLowerCase()) ||
    p.tokenBMint.toLowerCase().includes(search.toLowerCase()) ||
    p.tokenASymbol?.toLowerCase().includes(search.toLowerCase()) ||
    p.tokenBSymbol?.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  const totalLiquidity = pools?.reduce((sum, p) => sum + p.liquidity, 0) ?? 0

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
        <div className="card text-center">
          <p className="text-2xl font-bold text-agro-400">{pools?.length ?? '—'}</p>
          <p className="text-sm text-gray-500 mt-1">Active Pools</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-agro-400">
            ${totalLiquidity > 0 ? totalLiquidity.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '—'}
          </p>
          <p className="text-sm text-gray-500 mt-1">Total Liquidity</p>
        </div>
        <div className="card text-center col-span-2 md:col-span-1">
          <p className="text-2xl font-bold text-blue-400">Devnet</p>
          <p className="text-sm text-gray-500 mt-1">Network</p>
        </div>
      </div>

      <input
        className="input max-w-sm"
        placeholder="Search by token or address…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <PairsTable pools={filtered} isLoading={isLoading} />
    </div>
  )
}
