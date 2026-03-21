'use client'

import Link from 'next/link'
import { AssetRecord } from '@/types' // Використовуємо AssetRecord, бо він має категорію
import { clsx } from 'clsx'

// ВИПРАВЛЕНО: Ключі тепер відповідають AssetCategory з types/index.ts
const CATEGORY_COLORS: Record<string, string> = {
  Grain:     'bg-yellow-900/40 text-yellow-300 border-yellow-700/50',
  Oilseeds:  'bg-amber-900/40 text-amber-300 border-amber-700/50',
  Livestock: 'bg-red-900/40 text-red-300 border-red-700/50',
  Land:      'bg-green-900/40 text-green-300 border-green-700/50',
  Equipment: 'bg-blue-900/40 text-blue-300 border-blue-700/50',
  Storage:   'bg-purple-900/40 text-purple-300 border-purple-700/50',
  Other:     'bg-gray-700/40 text-gray-400 border-gray-600/50',
}

interface Props {
  // У твоїх типах токен для картки — це AssetRecord
  token: any 
}

export function TokenCard({ token }: Props) {
  return (
    <Link href={`/token/${token.mint}`}>
      <div className="card hover:border-agro-500/50 transition-all duration-300 cursor-pointer h-full group">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {token.logoUrl ? (
              <img
                src={token.logoUrl}
                alt={token.symbol}
                className="w-10 h-10 rounded-full object-cover bg-gray-800 border border-gray-700"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-agro-900 flex items-center justify-center text-agro-300 font-bold text-xs border border-agro-700">
                {token.symbol?.slice(0, 3) ?? '??'}
              </div>
            )}
            <div>
              <p className="font-bold text-gray-100 group-hover:text-agro-400 transition-colors">
                {token.symbol}
              </p>
              <p className="text-xs text-gray-400">{token.name || token.title}</p>
            </div>
          </div>
          
          {token.category && (
            <span className={clsx(
              'px-2 py-0.5 rounded text-[10px] font-bold uppercase border',
              CATEGORY_COLORS[token.category as string] ?? CATEGORY_COLORS.Other
            )}>
              {token.category}
            </span>
          )}
        </div>

        {/* Якщо це AssetRecord, у нього поле title та description */}
        {(token.description || token.title) && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-4">
            {token.description}
          </p>
        )}

        <div className="mt-auto space-y-3">
          <div className="text-[10px] text-gray-600 font-mono bg-black/20 p-1.5 rounded truncate">
            {token.mint}
          </div>

          {/* Додамо ціну, якщо вона є (RWA специфіка) */}
          {token.pricePerUnit && (
            <div className="flex justify-between items-end">
              <span className="text-[10px] text-gray-500 uppercase">Price</span>
              <span className="text-sm font-semibold text-gray-200">
                ${(Number(token.pricePerUnit) / 1e6).toFixed(2)} USDC
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
