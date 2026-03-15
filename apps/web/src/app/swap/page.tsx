'use client'

import { useState, useMemo } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { usePools, useSwapQuote, useSwap } from '@/hooks/usePools'
import { TxStatus } from '@/components/TxStatus'
import { TxState } from '@/types'

function shortMint(m: string) { return `${m.slice(0, 4)}…${m.slice(-4)}` }

export default function SwapPage() {
  const { publicKey } = useWallet()
  const { data: pools } = usePools()
  const { mutateAsync: execSwap, isPending } = useSwap()

  const [selectedPool, setSelectedPool] = useState<string>('')
  const [aToB, setAToB] = useState(true)
  const [amountIn, setAmountIn] = useState('')
  const [slippage, setSlippage] = useState('0.5')
  const [tx, setTx] = useState<TxState>({ status: 'idle' })

  const pool = pools?.find((p) => p.address === selectedPool)

  const amountInBig = useMemo(() => {
    const n = parseFloat(amountIn)
    if (!n || n <= 0) return 0n
    return BigInt(Math.floor(n * 1e6))
  }, [amountIn])

  const quote = useSwapQuote(pool, amountInBig, aToB)

  // apply user slippage
  const minOut = quote
    ? (quote.amountOut * (10_000n - BigInt(Math.floor(parseFloat(slippage) * 100)))) / 10_000n
    : 0n

  const handleSwap = async () => {
    if (!pool || !quote) return
    setTx({ status: 'pending' })
    try {
      const sig = await execSwap({ pool, amountIn: amountInBig, minAmountOut: minOut, aToB })
      setTx({ status: 'success', signature: sig })
      setAmountIn('')
    } catch (e: any) {
      setTx({ status: 'error', error: e.message })
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-100">Swap</h1>
        <p className="text-gray-400 mt-1">Trade agricultural tokens</p>
      </div>

      <div className="card space-y-5">
        {/* Pool selector */}
        <div>
          <label className="label">Select Pool</label>
          <select className="input" value={selectedPool} onChange={(e) => setSelectedPool(e.target.value)}>
            <option value="">— choose a pool —</option>
            {pools?.map((p) => (
              <option key={p.address} value={p.address}>
                {shortMint(p.tokenAMint)} / {shortMint(p.tokenBMint)}
              </option>
            ))}
          </select>
        </div>

        {/* Direction toggle */}
        {pool && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">Direction:</span>
            <button
              type="button"
              onClick={() => setAToB((v) => !v)}
              className="btn-secondary text-sm py-1 px-3"
            >
              {aToB
                ? `${shortMint(pool.tokenAMint)} → ${shortMint(pool.tokenBMint)}`
                : `${shortMint(pool.tokenBMint)} → ${shortMint(pool.tokenAMint)}`}
              {' '}⇄
            </button>
          </div>
        )}

        {/* Amount in */}
        <div>
          <label className="label">Amount In</label>
          <input
            className="input text-lg"
            type="number"
            min="0"
            placeholder="0.00"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
          />
        </div>

        {/* Quote */}
        {quote && (
          <div className="bg-gray-800/60 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">You receive</span>
              <span className="text-agro-300 font-semibold">
                {(Number(quote.amountOut) / 1e6).toFixed(6)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Price impact</span>
              <span className={quote.priceImpact > 5 ? 'text-red-400' : 'text-gray-300'}>
                {quote.priceImpact.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Fee ({pool!.feeBps / 100}%)</span>
              <span className="text-gray-300">{(Number(quote.fee) / 1e6).toFixed(6)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-700 pt-2 mt-1">
              <span className="text-gray-400">Minimum received</span>
              <span className="text-gray-300">{(Number(minOut) / 1e6).toFixed(6)}</span>
            </div>
          </div>
        )}

        {/* Slippage */}
        <div>
          <label className="label">Slippage tolerance (%)</label>
          <div className="flex gap-2">
            {['0.1', '0.5', '1.0'].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setSlippage(v)}
                className={`px-3 py-1 rounded text-sm border transition-colors ${
                  slippage === v
                    ? 'bg-agro-700 border-agro-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                }`}
              >
                {v}%
              </button>
            ))}
            <input
              className="input w-20 text-sm py-1"
              type="number"
              min="0.01"
              max="50"
              step="0.1"
              value={slippage}
              onChange={(e) => setSlippage(e.target.value)}
            />
          </div>
        </div>

        <TxStatus tx={tx} />

        {!publicKey ? (
          <WalletMultiButton className="w-full" />
        ) : (
          <button
            className="btn-primary w-full py-3"
            onClick={handleSwap}
            disabled={isPending || !pool || !quote || amountInBig === 0n}
          >
            {isPending ? 'Swapping…' : 'Swap'}
          </button>
        )}
      </div>
    </div>
  )
}
