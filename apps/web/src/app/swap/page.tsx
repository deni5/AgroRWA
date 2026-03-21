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

  // ВИПРАВЛЕНО: Замінено 0n на BigInt(0)
  const amountInBig = useMemo(() => {
    const n = parseFloat(amountIn)
    if (!n || n <= 0) return BigInt(0)
    return BigInt(Math.floor(n * 1e6))
  }, [amountIn])

  const quote = useSwapQuote(pool, amountInBig, aToB)

  // ВИПРАВЛЕНО: Замінено 10_000n на BigInt(10000)
  const minOut = quote
    ? (quote.amountOut * (BigInt(10000) - BigInt(Math.floor(parseFloat(slippage) * 100)))) / BigInt(10000)
    : BigInt(0)

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
    <div className="max-w-lg mx-auto space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-100 font-display">Swap Assets</h1>
        <p className="text-gray-400 mt-1">Instant agricultural liquidity</p>
      </div>

      <div className="card space-y-5 border border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div>
          <label className="label text-gray-400">Select Liquidity Pool</label>
          <select 
            className="input bg-gray-950 border-gray-800 focus:border-agro-500" 
            value={selectedPool} 
            onChange={(e) => setSelectedPool(e.target.value)}
          >
            <option value="">— choose a pool —</option>
            {pools?.map((p) => (
              <option key={p.address} value={p.address}>
                {shortMint(p.tokenAMint)} / {shortMint(p.tokenBMint)} (Fee: {p.feeBps / 100}%)
              </option>
            ))}
          </select>
        </div>

        {pool && (
          <div className="flex items-center justify-between px-2">
            <span className="text-xs text-gray-500 uppercase font-semibold">Direction</span>
            <button
              type="button"
              onClick={() => setAToB((v) => !v)}
              className="text-xs py-1 px-3 rounded-full border border-agro-500/30 text-agro-400 hover:bg-agro-500/10 transition-colors"
            >
              {aToB
                ? `${shortMint(pool.tokenAMint)} → ${shortMint(pool.tokenBMint)}`
                : `${shortMint(pool.tokenBMint)} → ${shortMint(pool.tokenAMint)}`}
              {' '} ⇄
            </button>
          </div>
        )}

        <div>
          <label className="label text-gray-400">Sell Amount</label>
          <div className="relative">
            <input
              className="input bg-gray-950 border-gray-800 text-lg pr-16"
              type="number"
              min="0"
              placeholder="0.00"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
              {pool ? (aToB ? 'TOKEN A' : 'TOKEN B') : ''}
            </span>
          </div>
        </div>

        {quote && (
          <div className="bg-black/40 rounded-xl p-4 space-y-3 border border-gray-800/50">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Estimated Receive</span>
              <span className="text-agro-400 font-bold text-lg">
                {(Number(quote.amountOut) / 1e6).toFixed(4)}
              </span>
            </div>
            <div className="h-px bg-gray-800" />
            <div className="grid grid-cols-2 gap-y-2 text-xs">
              <span className="text-gray-500">Price Impact</span>
              <span className={`text-right ${quote.priceImpact > 3 ? 'text-red-400' : 'text-green-500'}`}>
                {quote.priceImpact.toFixed(2)}%
              </span>
              <span className="text-gray-500">Slippage</span>
              <span className="text-right text-gray-300">{slippage}%</span>
            </div>
          </div>
        )}

        <TxStatus tx={tx} />

        {!publicKey ? (
          <div className="flex justify-center pt-2">
            <WalletMultiButton className="!w-full !bg-agro-600 hover:!bg-agro-700 !rounded-xl !h-12 !transition-all" />
          </div>
        ) : (
          <button
            className="btn-primary w-full py-4 text-lg font-bold shadow-lg shadow-agro-900/20 disabled:opacity-50"
            onClick={handleSwap}
            disabled={isPending || !pool || !quote || amountInBig === BigInt(0)}
          >
            {isPending ? 'Executing Transaction...' : 'Swap Assets'}
          </button>
        )}
      </div>
    </div>
  )
}
