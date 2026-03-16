import Link from 'next/link'
import type { Listing } from '@/types'
import { clsx } from 'clsx'

const TYPE_COLORS: Record<string, string> = {
  Forward: 'badge-green',
  Asset:   'badge-blue',
  Credit:  'badge-amber',
  Revenue: 'badge bg-purple-900/40 text-purple-400 border border-purple-700/30',
}

const STATUS_COLORS: Record<string, string> = {
  Verified:  'badge-green',
  Listed:    'badge-blue',
  Pending:   'badge-amber',
  Disputed:  'badge-red',
  Frozen:    'badge-red',
}

function formatAmount(n: bigint, decimals = 6) {
  return (Number(n) / 10 ** decimals).toLocaleString(undefined, { maximumFractionDigits: 2 })
}

interface Props { listing: Listing }

export function AssetCard({ listing }: Props) {
  const asset = listing.asset
  const emitter = listing.emitterProfile

  return (
    <Link href={`/asset/${asset?.mint ?? listing.assetMint}`}>
      <div className="card hover:border-green-700/60 transition-all cursor-pointer h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-100 text-base leading-tight">
              {asset?.title ?? 'Unknown Asset'}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">{asset?.category} · {asset?.unit}</p>
          </div>
          <div className="flex flex-col gap-1 items-end ml-2 flex-shrink-0">
            {asset?.tokenType && (
              <span className={clsx('badge', TYPE_COLORS[asset.tokenType])}>
                {asset.tokenType}
              </span>
            )}
            {asset?.lifecycleStatus && (
              <span className={clsx('badge', STATUS_COLORS[asset.lifecycleStatus] ?? 'badge-gray')}>
                {asset.lifecycleStatus}
              </span>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="bg-gray-800/60 rounded-lg px-4 py-3 mb-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Price per unit</span>
            <span className="text-green-400 font-semibold text-lg">
              ${formatAmount(listing.pricePerUnit)} {listing.currency}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-sm text-gray-400">Available</span>
            <span className="text-gray-300 text-sm">
              {formatAmount(listing.amountRemaining)} / {formatAmount(listing.amount)} {asset?.unit}
            </span>
          </div>
        </div>

        {/* Emitter */}
        {emitter && (
          <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
            <span>{emitter.legalName}</span>
            <span className={clsx('badge text-xs', {
              'badge-green': emitter.ratingLabel === 'AAA' || emitter.ratingLabel === 'AA',
              'badge-blue':  emitter.ratingLabel === 'A',
              'badge-amber': emitter.ratingLabel === 'B',
              'badge-red':   emitter.ratingLabel === 'C',
            })}>
              {emitter.ratingLabel}
            </span>
          </div>
        )}

        {/* Verifications */}
        {asset && (
          <div className="mt-2 flex items-center gap-1">
            {[...Array(asset.requiredVerifications)].map((_, i) => (
              <div key={i} className={clsx('w-2 h-2 rounded-full', {
                'bg-green-500': i < asset.verificationCount,
                'bg-gray-600':  i >= asset.verificationCount,
              })} />
            ))}
            <span className="text-xs text-gray-500 ml-1">
              {asset.verificationCount}/{asset.requiredVerifications} oracles signed
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
