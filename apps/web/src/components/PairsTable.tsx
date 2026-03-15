'use client'

import Link from 'next/link'
import { PoolWithPrice } from '@/types'

interface Props {
  pools: PoolWithPrice[]
  isLoading?: boolean
}

function formatNumber(n: number, decimals = 2) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`
  return `$${n.toFixed(decimals)}`
}

function shortMint(mint: string) {
  return `${mint.slice(0, 4)}…${mint.slice(-4)}`
}

export function PairsTable({ pools, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-800 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (!pools.length) {
    return (
      <div className="card text-center text-gray-500 py-12">
        No pools found.{' '}
        <Link href="/create-pool" className="text-agro-400 underline">
          Create the first one
        </Link>
        .
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800 text-gray-400 text-left">
            <th className="px-4 py-3 font-medium">Pair</th>
            <th className="px-4 py-3 font-medium">Price</th>
            <th className="px-4 py-3 font-medium">Liquidity</th>
            <th className="px-4 py-3 font-medium">Reserve A</th>
            <th className="px-4 py-3 font-medium">Reserve B</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pools.map((pool) => (
            <tr
              key={pool.address}
              className="border-b border-gray-800/60 hover:bg-gray-800/40 transition-colors"
            >
              <td className="px-4 py-3 font-medium text-gray-100">
                {pool.tokenASymbol ?? shortMint(pool.tokenAMint)} /{' '}
                {pool.tokenBSymbol ?? shortMint(pool.tokenBMint)}
              </td>
              <td className="px-4 py-3 text-agro-300">
                {pool.price.toFixed(6)}
              </td>
              <td className="px-4 py-3">{formatNumber(pool.liquidity)}</td>
              <td className="px-4 py-3 text-gray-400">
                {(Number(pool.reserveA) / 1e6).toLocaleString()}
              </td>
              <td className="px-4 py-3 text-gray-400">
                {(Number(pool.reserveB) / 1e6).toLocaleString()}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Link
                    href={`/swap?pool=${pool.address}`}
                    className="text-xs btn-secondary py-1 px-2"
                  >
                    Swap
                  </Link>
                  <Link
                    href={`/add-liquidity?pool=${pool.address}`}
                    className="text-xs btn-primary py-1 px-2"
                  >
                    + Liquidity
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
