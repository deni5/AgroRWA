'use client'

import { TxState } from '@/types'
import { clsx } from 'clsx'

interface Props {
  tx: TxState
  className?: string
}

export function TxStatus({ tx, className }: Props) {
  if (tx.status === 'idle') return null

  return (
    <div
      className={clsx(
        'rounded-lg px-4 py-3 text-sm flex items-start gap-3',
        tx.status === 'pending' && 'bg-yellow-900/30 border border-yellow-700/40 text-yellow-300',
        tx.status === 'success' && 'bg-agro-900/30 border border-agro-700/40 text-agro-300',
        tx.status === 'error'   && 'bg-red-900/30 border border-red-700/40 text-red-300',
        className
      )}
    >
      {tx.status === 'pending' && <span className="animate-spin mt-0.5">⏳</span>}
      {tx.status === 'success' && <span>✅</span>}
      {tx.status === 'error'   && <span>❌</span>}
      <div>
        {tx.status === 'pending' && 'Transaction pending…'}
        {tx.status === 'success' && (
          <>
            Transaction confirmed!{' '}
            {tx.signature && (
              <a
                href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                View on Explorer
              </a>
            )}
          </>
        )}
        {tx.status === 'error' && (tx.error ?? 'Transaction failed')}
      </div>
    </div>
  )
}
