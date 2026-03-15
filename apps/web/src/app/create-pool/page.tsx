'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { PublicKey } from '@solana/web3.js'
import { useConnection } from '@solana/wallet-adapter-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getPoolPDA, POOL_PROGRAM_ID } from '@/lib/solanaConnection'
import { TxStatus } from '@/components/TxStatus'
import { TxState } from '@/types'
import toast from 'react-hot-toast'

const POPULAR_BASES = [
  { label: 'SOL', mint: 'So11111111111111111111111111111111111111112' },
  { label: 'USDC (devnet)', mint: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU' },
]

function isValidPubkey(s: string) {
  try { new PublicKey(s); return true } catch { return false }
}

function sortMints(a: string, b: string): [string, string] {
  const pa = new PublicKey(a).toBuffer()
  const pb = new PublicKey(b).toBuffer()
  return pa.compare(pb) < 0 ? [a, b] : [b, a]
}

export default function CreatePoolPage() {
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const qc = useQueryClient()

  const [tokenA, setTokenA] = useState('')
  const [tokenB, setTokenB] = useState('')
  const [tx, setTx] = useState<TxState>({ status: 'idle' })

  const [sortedA, sortedB] =
    isValidPubkey(tokenA) && isValidPubkey(tokenB) && tokenA !== tokenB
      ? sortMints(tokenA, tokenB)
      : ['', '']

  const [poolPDA] = sortedA
    ? getPoolPDA(new PublicKey(sortedA), new PublicKey(sortedB))
    : [null]

  const { mutateAsync: createPool, isPending } = useMutation({
    mutationFn: async () => {
      if (!publicKey) throw new Error('Wallet not connected')
      const { Program, AnchorProvider, SystemProgram } = await import('@coral-xyz/anchor')
      const idl = (await import('@/lib/idl/liquidity_pool.json')).default
      const provider = new AnchorProvider(connection, { publicKey } as any, { commitment: 'confirmed' })
      const program = new Program(idl as any, provider)

      const mintA = new PublicKey(sortedA)
      const mintB = new PublicKey(sortedB)

      const tx = await program.methods
        .createPool()
        .accounts({
          pool: poolPDA,
          tokenAMint: mintA,
          tokenBMint: mintB,
          creator: publicKey,
          systemProgram: PublicKey.default,
          tokenProgram: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
          associatedTokenProgram: new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe1bsn'),
          rent: new PublicKey('SysvarRent111111111111111111111111111111111'),
        })
        .rpc()
      return tx
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pools'] }),
    onError: (e: Error) => toast.error(e.message),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTx({ status: 'pending' })
    try {
      const sig = await createPool()
      setTx({ status: 'success', signature: sig })
    } catch (err: any) {
      setTx({ status: 'error', error: err.message })
    }
  }

  if (!publicKey) {
    return (
      <div className="max-w-lg mx-auto card text-center py-16 space-y-4">
        <p className="text-gray-400">Connect your wallet to create a pool.</p>
        <WalletMultiButton />
      </div>
    )
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-100">Create Pool</h1>
        <p className="text-gray-400 mt-1">Launch a new AgroToken liquidity pair.</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label className="label">Token A Mint *</label>
          <input
            className="input font-mono"
            placeholder="SPL token mint address"
            value={tokenA}
            onChange={(e) => setTokenA(e.target.value.trim())}
            required
          />
        </div>

        <div>
          <label className="label">Token B Mint *</label>
          <input
            className="input font-mono"
            placeholder="SPL token mint address"
            value={tokenB}
            onChange={(e) => setTokenB(e.target.value.trim())}
            required
          />
          <div className="flex gap-2 mt-2">
            {POPULAR_BASES.map((b) => (
              <button
                key={b.mint}
                type="button"
                onClick={() => setTokenB(b.mint)}
                className="text-xs btn-secondary py-1 px-2"
              >
                Use {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        {poolPDA && (
          <div className="bg-gray-800/60 rounded-lg p-4 text-sm space-y-2">
            <p className="text-gray-400 font-medium">Pool preview</p>
            <div className="flex justify-between">
              <span className="text-gray-500">Pool PDA</span>
              <span className="font-mono text-gray-300 text-xs">{poolPDA.toBase58().slice(0, 16)}…</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Sorted token A</span>
              <span className="font-mono text-gray-300 text-xs">{sortedA.slice(0, 12)}…</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Sorted token B</span>
              <span className="font-mono text-gray-300 text-xs">{sortedB.slice(0, 12)}…</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Fee</span>
              <span className="text-gray-300">0.30%</span>
            </div>
          </div>
        )}

        <TxStatus tx={tx} />

        <button
          type="submit"
          className="btn-primary w-full py-3"
          disabled={isPending || !sortedA || !sortedB}
        >
          {isPending ? 'Creating…' : 'Create Pool'}
        </button>
      </form>
    </div>
  )
}
