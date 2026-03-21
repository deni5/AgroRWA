'use client'
export const dynamic = 'force-dynamic';

import { useState, useMemo } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { PublicKey } from '@solana/web3.js'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { usePools } from '@/hooks/usePools'
import { getPoolPDA } from '@/lib/solanaConnection'
import { TxStatus } from '@/components/TxStatus'
import { TxState, PoolWithPrice } from '@/types' // Додав PoolWithPrice для точності
// @ts-ignore
import BN from 'bn.js'
import toast from 'react-hot-toast'

export default function AddLiquidityPage() {
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const qc = useQueryClient()
  const { data: pools } = usePools()

  const [selectedPool, setSelectedPool] = useState('')
  const [amountA, setAmountA] = useState('')
  const [amountB, setAmountB] = useState('')
  const [tx, setTx] = useState<TxState>({ status: 'idle' })

  // ФІКС: Безпечний пошуку пулу з приведенням до масиву
  const pool = useMemo(() => {
    if (Array.isArray(pools)) {
      return (pools as PoolWithPrice[]).find((p) => p.address === selectedPool)
    }
    return null
  }, [pools, selectedPool])

  // Auto-calculate B from A based on pool price
  const handleAmountAChange = (val: string) => {
    setAmountA(val)
    if (pool && pool.price && pool.price > 0 && val) {
      setAmountB((parseFloat(val) * pool.price).toFixed(6))
    }
  }

  const amountABig = useMemo(() => {
    const n = parseFloat(amountA)
    return n > 0 ? BigInt(Math.floor(n * 1e6)) : BigInt(0)
  }, [amountA])

  const amountBBig = useMemo(() => {
    const n = parseFloat(amountB)
    return n > 0 ? BigInt(Math.floor(n * 1e6)) : BigInt(0)
  }, [amountB])

  // Estimated LP tokens (Додано перевірки на існування резервів)
  const estimatedLp = useMemo(() => {
    if (!pool || amountABig === BigInt(0) || amountBBig === BigInt(0)) return BigInt(0)
    
    // Тут важливо: перевіряємо чи є резерви в типі (залежить від вашої структури Pool)
    const lpSupply = (pool as any).lpSupply || BigInt(0)
    const reserveA = (pool as any).reserveA || BigInt(1)
    const reserveB = (pool as any).reserveB || BigInt(1)

    if (lpSupply === BigInt(0)) {
      return BigInt(Math.floor(Math.sqrt(Number(amountABig) * Number(amountBBig))))
    }
    const shareA = (amountABig * lpSupply) / reserveA
    const shareB = (amountBBig * lpSupply) / reserveB
    return shareA < shareB ? shareA : shareB
  }, [pool, amountABig, amountBBig])

  const poolShare = useMemo(() => {
    const lpSupply = (pool as any)?.lpSupply || BigInt(0)
    if (!pool || estimatedLp === BigInt(0) || lpSupply === BigInt(0)) return 0
    return Number((estimatedLp * BigInt(10000)) / (lpSupply + estimatedLp)) / 100
  }, [pool, estimatedLp])

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async () => {
      if (!publicKey || !pool) throw new Error('Missing data')
      const { Program, AnchorProvider } = await import('@coral-xyz/anchor')
      const idl = (await import('@/lib/idl/marketplace.json')).default
      const provider = new AnchorProvider(connection, { publicKey } as any, { commitment: 'confirmed' })
      const program = new Program(idl as any, provider)

      const [poolPDA] = getPoolPDA(new PublicKey(pool.tokenAMint), new PublicKey(pool.tokenBMint))

      return program.methods
        .addLiquidity(new BN(amountABig.toString()), new BN(amountBBig.toString()), new BN('0'))
        .accounts({ pool: poolPDA, user: publicKey })
        .rpc()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pools'] }),
    onError: (e: Error) => toast.error(e.message),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTx({ status: 'pending' })
    try {
      const sig = await mutateAsync()
      setTx({ status: 'success', signature: sig })
      setAmountA(''); setAmountB('')
    } catch (err: any) {
      setTx({ status: 'error', error: err.message })
    }
  }

  if (!publicKey) {
    return (
      <div className="max-w-lg mx-auto card text-center py-16 space-y-4">
        <p className="text-gray-400">Connect your wallet to add liquidity.</p>
        <div className="flex justify-center">
            <WalletMultiButton />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-100">Add Liquidity</h1>
        <p className="text-gray-400 mt-1">Provide liquidity and earn trading fees.</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5 bg-gray-900/50 p-6 rounded-xl border border-gray-800">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Select Pool</label>
          <select 
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 focus:ring-2 focus:ring-agro-500 outline-none" 
            value={selectedPool} 
            onChange={(e) => setSelectedPool(e.target.value)} 
            required
          >
            <option value="">— choose a pool —</option>
            {Array.isArray(pools) && (pools as PoolWithPrice[]).map((p) => (
              <option key={p.address} value={p.address}>
                {p.tokenAMint.slice(0, 4)}…/{p.tokenBMint.slice(0, 4)}… (price: {p.price?.toFixed(4) || '0.00'})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Token A Amount</label>
            <input
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 focus:ring-2 focus:ring-agro-500 outline-none"
              type="number" min="0" step="0.000001" placeholder="0.00"
              value={amountA}
              onChange={(e) => handleAmountAChange(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Token B Amount</label>
            <input
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 focus:ring-2 focus:ring-agro-500 outline-none"
              type="number" min="0" step="0.000001" placeholder="0.00"
              value={amountB}
              onChange={(e) => setAmountB(e.target.value)}
              required
            />
          </div>
        </div>

        {pool && estimatedLp > BigInt(0) && (
          <div className="bg-gray-800/60 rounded-lg p-4 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Current price</span>
              <span className="text-gray-300">{pool.price?.toFixed(6) || '0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Pool share</span>
              <span className="text-green-400 font-medium">{poolShare.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">LP tokens received (est.)</span>
              <span className="text-gray-300">{(Number(estimatedLp) / 1e6).toFixed(6)}</span>
            </div>
          </div>
        )}

        <TxStatus tx={tx} />

        <button
          type="submit"
          className="w-full bg-agro-600 hover:bg-agro-500 disabled:bg-gray-700 text-white font-bold py-3 rounded-lg transition-colors"
          disabled={isPending || !pool || amountABig === BigInt(0)}
        >
          {isPending ? 'Adding…' : 'Add Liquidity'}
        </button>
      </form>
    </div>
  )
}
