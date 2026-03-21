'use client'
export const dynamic = 'force-dynamic'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useToken } from '@/hooks/useTokenRegistry'
import { usePools } from '@/hooks/usePools'

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export default function TokenDetailPage() {
  const { mint } = useParams<{ mint: string }>()
  const { data: token, isLoading } = useToken(mint)
  const { data: allPools } = usePools()

  const tokenPools = allPools?.filter(
    (p) => p.tokenAMint === mint || p.tokenBMint === mint
  )

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-gray-800 rounded w-48" />
        <div className="card h-48 bg-gray-800" />
      </div>
    )
  }

  if (!token) {
    return (
      <div className="card text-center py-16 text-gray-500">
        Token not found.{' '}
        <Link href="/tokens" className="text-agro-400 underline">Back to tokens</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/tokens" className="text-sm text-gray-500 hover:text-gray-300">
        ← Back to tokens
      </Link>

      {/* Header */}
      <div className="card">
        <div className="flex items-start gap-4">
          {token.logoUrl ? (
            <img src={token.logoUrl} alt={token.symbol} className="w-16 h-16 rounded-full bg-gray-800 object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-agro-800 flex items-center justify-center text-agro-300 font-bold text-xl">
              {token.symbol?.slice(0, 2)}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-100">{token.name}</h1>
              <span className="text-gray-400 font-mono">{token.symbol}</span>
              {token.category && (
                <span className="badge bg-agro-900/40 text-agro-300 border border-agro-700/30">
                  {token.category.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              )}
              {token.bonusEnabled && (
                <span className="badge bg-yellow-900/30 text-yellow-400 border border-yellow-700/30">
                  ✦ Bonus
                </span>
              )}
            </div>
            {token.description && (
              <p className="text-gray-400 mt-2">{token.description}</p>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="label">Mint Address</p>
            <p className="font-mono text-gray-300 break-all">{token.mint}</p>
          </div>
          <div>
            <p className="label">Creator</p>
            <p className="font-mono text-gray-300">{shortAddress(token.creator ?? '')}</p>
          </div>
          <div>
            <p className="label">Decimals</p>
            <p className="text-gray-300">{token.decimals}</p>
          </div>
          {token.registeredAt && (
            <div>
              <p className="label">Registered</p>
              <p className="text-gray-300">
                {new Date(token.registeredAt * 1000).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href={`/create-pool?tokenA=${mint}`} className="btn-primary">
          Create Pool
        </Link>
        <Link href={`/add-liquidity?tokenA=${mint}`} className="btn-secondary">
          Add Liquidity
        </Link>
        <Link href={`/swap?from=${mint}`} className="btn-secondary">
          Swap
        </Link>
        <a
          href={`https://explorer.solana.com/address/${mint}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary"
        >
          Explorer ↗
        </a>
      </div>

      {/* Pools */}
      <div>
        <h2 className="text-xl font-semibold text-gray-100 mb-4">Liquidity Pools</h2>
        {!tokenPools?.length ? (
          <div className="card text-center py-8 text-gray-500">
            No pools yet.{' '}
            <Link href={`/create-pool?tokenA=${mint}`} className="text-agro-400 underline">
              Create one
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {tokenPools.map((pool) => (
              <div key={pool.address} className="card flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="font-medium text-gray-100">
                    {shortAddress(pool.tokenAMint)} / {shortAddress(pool.tokenBMint)}
                  </p>
                  <p className="text-sm text-gray-500 font-mono">{shortAddress(pool.address)}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="text-agro-300">Price: {pool.price.toFixed(6)}</p>
                  <p className="text-gray-500">
                    Reserves: {(Number(pool.reserveA) / 1e6).toLocaleString()} /{' '}
                    {(Number(pool.reserveB) / 1e6).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/swap?pool=${pool.address}`} className="btn-secondary text-sm py-1">Swap</Link>
                  <Link href={`/add-liquidity?pool=${pool.address}`} className="btn-primary text-sm py-1">+ Liquidity</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
