'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import {
  MARKETPLACE_PROGRAM_ID,
  ASSET_REGISTRY_PROGRAM_ID,
  IDENTITY_PROGRAM_ID,
  getListingPDA,
} from '@/lib/solana'
import type { Listing, AssetRecord, EmitterProfile } from '@/types'
import BN from 'bn.js'
import toast from 'react-hot-toast'

// ─── Fetch all listings ───────────────────────────────────────────────────────

export function useAllListings() {
  const { connection } = useConnection()

  return useQuery<Listing[]>({
    queryKey: ['listings', 'all'],
    queryFn: async () => {
      const accounts = await connection.getProgramAccounts(MARKETPLACE_PROGRAM_ID)
      return accounts.map(({ pubkey, account }) => parseListing(pubkey, account.data))
        .filter((l) => l.status === 'Active')
    },
    staleTime: 15_000,
    refetchInterval: 30_000,
  })
}

// ─── Fetch single listing ─────────────────────────────────────────────────────

export function useListing(address: string) {
  const { connection } = useConnection()

  return useQuery<Listing | null>({
    queryKey: ['listing', address],
    queryFn: async () => {
      const info = await connection.getAccountInfo(new PublicKey(address))
      if (!info) return null
      return parseListing(new PublicKey(address), info.data)
    },
    staleTime: 10_000,
  })
}

// ─── Fill order mutation ──────────────────────────────────────────────────────

export function useFillOrder() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({
      listing,
      amount,
    }: {
      listing: Listing
      amount: bigint
    }) => {
      if (!wallet.publicKey || !wallet.sendTransaction)
        throw new Error('Wallet not connected')

      const { Program, AnchorProvider, BN } = await import('@coral-xyz/anchor')
      const idl = (await import('@/lib/idl/marketplace.json')).default
      const provider = new AnchorProvider(connection, wallet as any, { commitment: 'confirmed' })
      const program = new Program(idl as any, provider)

      const tx = await program.methods
        .fillOrder(new BN(amount.toString()))
        .accounts({
          listing: new PublicKey(listing.address),
          investor: wallet.publicKey,
        })
        .rpc()

      return tx
    },
    onSuccess: (sig) => {
      toast.success('Purchase successful!')
      qc.invalidateQueries({ queryKey: ['listings'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

// ─── Create listing mutation ──────────────────────────────────────────────────

export function useCreateListing() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (args: {
      assetMint: string
      amount: bigint
      pricePerUnit: bigint
      minLot: bigint
      currency: 'USDC' | 'USDT' | 'SOL'
      expiresAt?: number
    }) => {
      if (!wallet.publicKey || !wallet.sendTransaction)
        throw new Error('Wallet not connected')

      const { Program, AnchorProvider, BN } = await import('@coral-xyz/anchor')
      const idl = (await import('@/lib/idl/marketplace.json')).default
      const provider = new AnchorProvider(connection, wallet as any, { commitment: 'confirmed' })
      const program = new Program(idl as any, provider)

      const [listingPDA] = getListingPDA(new PublicKey(args.assetMint), wallet.publicKey)

      const currencyMap = { USDC: { usdc: {} }, USDT: { usdt: {} }, SOL: { sol: {} } }

      const tx = await program.methods
        .createListing({
          amount: new BN(args.amount.toString()),
          pricePerUnit: new BN(args.pricePerUnit.toString()),
          currency: currencyMap[args.currency],
          minLot: new BN(args.minLot.toString()),
          expiresAt: args.expiresAt ? new BN(args.expiresAt) : null,
        })
        .accounts({
          listing: listingPDA,
          assetMint: new PublicKey(args.assetMint),
          emitter: wallet.publicKey,
        })
        .rpc()

      return tx
    },
    onSuccess: () => {
      toast.success('Asset listed on marketplace!')
      qc.invalidateQueries({ queryKey: ['listings'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

// ─── Account parser ───────────────────────────────────────────────────────────

function parseListing(pubkey: PublicKey, data: Buffer): Listing {
  // Skip 8-byte discriminator
  let offset = 8

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
  const readU8 = () => data[offset++]
  const readI64 = () => {
    const val = data.readBigInt64LE(offset)
    offset += 8
    return Number(val)
  }
  const readBool = () => Boolean(data[offset++])
  const readOptionI64 = () => {
    const some = Boolean(data[offset++])
    if (!some) return undefined
    const val = Number(data.readBigInt64LE(offset))
    offset += 8
    return val
  }

  const assetMint     = readPubkey()
  const emitter       = readPubkey()
  const escrowVault   = readPubkey()
  const amount        = readU64()
  const amountRemaining = readU64()
  const pricePerUnit  = readU64()
  const currency      = (['USDC', 'USDT', 'SOL'] as const)[readU8()] ?? 'USDC'
  const minLot        = readU64()
  const listingType   = (['Primary', 'Secondary'] as const)[readU8()] ?? 'Primary'
  const status        = (['Active', 'Filled', 'Cancelled', 'Expired'] as const)[readU8()] ?? 'Active'
  const createdAt     = readI64()
  const expiresAt     = readOptionI64()
  readU8() // bump

  return {
    address: pubkey.toBase58(),
    assetMint,
    emitter,
    escrowVault,
    amount,
    amountRemaining,
    pricePerUnit,
    currency,
    minLot,
    listingType,
    status,
    createdAt,
    expiresAt,
  }
}
