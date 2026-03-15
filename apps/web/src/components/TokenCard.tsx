import Link from 'next/link'
import { Token } from '@/types'
import { clsx } from 'clsx'

const CATEGORY_COLORS: Record<string, string> = {
  Farmland:               'bg-green-900/40 text-green-300',
  GrainProduction:        'bg-yellow-900/40 text-yellow-300',
  Livestock:              'bg-orange-900/40 text-orange-300',
  HarvestFutures:         'bg-blue-900/40 text-blue-300',
  AgriculturalMachinery:  'bg-gray-700/60 text-gray-300',
  Other:                  'bg-gray-700/40 text-gray-400',
}

interface Props {
  token: Token
}

export function TokenCard({ token }: Props) {
  return (
    <Link href={`/token/${token.mint}`}>
      <div className="card hover:border-agro-700 transition-colors cursor-pointer h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {token.logoUrl ? (
              <img
                src={token.logoUrl}
                alt={token.symbol}
                className="w-10 h-10 rounded-full object-cover bg-gray-800"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-agro-800 flex items-center justify-center text-agro-300 font-bold text-sm">
                {token.symbol?.slice(0, 2) ?? '?'}
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-100">{token.symbol}</p>
              <p className="text-sm text-gray-400">{token.name}</p>
            </div>
          </div>
          {token.category && (
            <span className={clsx('badge', CATEGORY_COLORS[token.category] ?? CATEGORY_COLORS.Other)}>
              {token.category.replace(/([A-Z])/g, ' $1').trim()}
            </span>
          )}
        </div>

        {token.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{token.description}</p>
        )}

        <div className="text-xs text-gray-600 font-mono truncate">{token.mint}</div>

        {token.bonusEnabled && (
          <div className="mt-2 text-xs text-agro-400">✦ Bonus rewards enabled</div>
        )}
      </div>
    </Link>
  )
}
