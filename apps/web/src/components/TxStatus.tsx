'use client'

import type { TxState } from '@/types'
import { clsx } from 'clsx'

export function TxStatus({ tx, className }: { tx: TxState; className?: string }) {
  if (tx.status === 'idle') return null

  return (
    <div className={clsx('rounded-lg px-4 py-3 text-sm flex items-start gap-3', {
      'bg-yellow-900/30 border border-yellow-700/40 text-yellow-300': tx.status === 'pending',
      'bg-green-900/30 border border-green-700/40 text-green-300':   tx.status === 'success',
      'bg-red-900/30 border border-red-700/40 text-red-300':         tx.status === 'error',
    }, className)}>
      <span className="flex-shrink-0">
        {tx.status === 'pending' && <span className="animate-spin inline-block">⏳</span>}
        {tx.status === 'success' && '✅'}
        {tx.status === 'error'   && '❌'}
      </span>
      <div>
        {tx.status === 'pending' && 'Transaction pending…'}
        {tx.status === 'success' && (
          <>Transaction confirmed!{' '}
            {tx.signature && (
              <a href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                target="_blank" rel="noopener noreferrer" className="underline">
                View on Explorer ↗
              </a>
            )}
          </>
        )}
        {tx.status === 'error' && (tx.error ?? 'Transaction failed')}
      </div>
    </div>
  )
}
