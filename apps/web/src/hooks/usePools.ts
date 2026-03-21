'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, SystemProgram } from '@solana/web3.js'
import { POOL_PROGRAM_ID, getPoolPDA } from '@/lib/solanaConnection'
import { Pool, PoolWithPrice, SwapQuote } from '@/types'
import BN from 'bn.js'
import toast from 'react-hot-toast'

// ─── Fetch all pools ──────────────────────────────────────────────────────────

export function usePools() {
  const { connection } = useConnection()

  return useQuery<PoolWithPrice[]>({
    queryKey: ['pools', 'all'],
    queryFn: async () => {
      const accounts = await connection.getProgramAccounts(POOL_PROGRAM_ID)

      return accounts.map(({ pubkey, account }) => {
        const data = account.data.slice(8) // skip discriminator
        let offset = 0

        const readPubkey = () => {
          const pk = new PublicKey(data.slice(offset, offset + 32)).toBase58()
          offset += 32
          return pk
        }
        const readU64 = () => {
          const val = data.readBigUInt64LE(offset)
          offset += 8
          return val
        }
        const readU16 = () => {
          const val = data.readUInt16LE(offset)
          offset += 2
          return val
        }
        const readI64 = () => {
          const val = data.readBigInt64LE(offset)
          offset += 8
          return Number(val)
        }

        const tokenAMint = readPubkey()
        const tokenBMint = readPubkey()
        const vaultA     = readPubkey()
        const vaultB     = readPubkey()
        const lpMint     = readPubkey()
        const creator    = readPubkey()
        const reserveA   = readU64()
        const reserveB   = readU64()
        const lpSupply   = readU64()
        const feeBps     = readU16()
        const createdAt  = readI64()

        const price =
          reserveA > 0n ? Number(reserveB) / Number(reserveA) : 0
        const liquidity =
          (Number(reserveA) / 1e6) * price + Number(reserveB) / 1e6

        return {
          address: pubkey.toBase58(),
          tokenAMint,
          tokenBMint,
          vaultA,
          vaultB,
          lpMint,
          lpSupply,
          creator,
          reserveA,
          reserveB,
          feeBps,
          createdAt,
          price,
          liquidity,
        } satisfies PoolWithPrice
      })
    },
    staleTime: 15_000,
    refetchInterval: 30_000,
  })
}

// ─── Swap quote ───────────────────────────────────────────────────────────────

export function useSwapQuote(
  pool: PoolWithPrice | undefined,
  amountIn: bigint,
  aToB: boolean
): SwapQuote | null {
  if (!pool || amountIn === 0n) return null

  const [reserveIn, reserveOut] = aToB
    ? [pool.reserveA, pool.reserveB]
    : [pool.reserveB, pool.reserveA]

  const feeDenom = 10_000n
  const amountInWithFee =
    (amountIn * (feeDenom - BigInt(pool.feeBps))) / feeDenom

  if (reserveIn === 0n || reserveOut === 0n) return null

  const amountOut =
    (reserveOut * amountInWithFee) / (reserveIn + amountInWithFee)

  const priceImpact =
    Number((amountInWithFee * 10_000n) / (reserveIn + amountInWithFee)) / 100

  const fee = amountIn - amountInWithFee
  const slippage = 50n // 0.5% default
  const minAmountOut = (amountOut * (10_000n - slippage)) / 10_000n

  return { amountIn, amountOut, priceImpact, fee, minAmountOut }
}

// ─── Swap mutation ────────────────────────────────────────────────────────────

export function useSwap() {
  const { connection } = useConnection()
  const wallet = useWallet()

  return useMutation({
    mutationFn: async ({
      pool,
      amountIn,
      minAmountOut,
      aToB,
    }: {
      pool: PoolWithPrice
      amountIn: bigint
      minAmountOut: bigint
      aToB: boolean
    }) => {
      if (!wallet.publicKey || !wallet.sendTransaction)
        throw new Error('Wallet not connected')

      const { Program, AnchorProvider } = await import('@coral-xyz/anchor')
      const idl = (await import('@/lib/idl/marketplace.json')).default
      const provider = new AnchorProvider(connection, wallet as any, { commitment: 'confirmed' })
      const program = new Program(idl as any, provider)

      const [poolPDA] = getPoolPDA(
        new PublicKey(pool.tokenAMint),
        new PublicKey(pool.tokenBMint)
      )

      const tx = await program.methods
        .swap(new BN(amountIn.toString()), new BN(minAmountOut.toString()), aToB)
        .accounts({
          pool: poolPDA,
          vaultIn:  new PublicKey(aToB ? pool.tokenAMint : pool.tokenBMint),
          vaultOut: new PublicKey(aToB ? pool.tokenBMint : pool.tokenAMint),
          userTokenIn:  wallet.publicKey,
          userTokenOut: wallet.publicKey,
          user: wallet.publicKey,
          tokenProgram: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
          systemProgram: SystemProgram.programId,
        })
        .rpc()

      return tx
    },
    onSuccess: () => toast.success('Swap successful!'),
    onError: (e: Error) => toast.error(e.message),
  })
}
