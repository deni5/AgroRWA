'use client'
 
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, Keypair } from '@solana/web3.js'
import { REGISTRY_PROGRAM_ID, getAssetPDA } from '@/lib/solana'
import type { AssetRecord, TokenType, AssetCategory, TxState } from '@/types'
import toast from 'react-hot-toast'
import BN from 'bn.js'
 
// ─── Fetch single asset ───────────────────────────────────────────────────────
 
export function useAsset(mint?: string) {
  const { connection } = useConnection()
 
  return useQuery<AssetRecord | null>({
    queryKey: ['asset', mint],
    enabled: !!mint,
    queryFn: async () => {
      if (!mint) return null
      try {
        const [pda] = getAssetPDA(new PublicKey(mint))
        const info = await connection.getAccountInfo(pda)
        if (!info) return null
        return parseAsset(pda, info.data)
      } catch {
        return null
      }
    },
    staleTime: 30_000,
  })
}
 
// ─── Fetch all assets ─────────────────────────────────────────────────────────
 
export function useAllAssets() {
  const { connection } = useConnection()
 
  return useQuery<AssetRecord[]>({
    queryKey: ['assets', 'all'],
    queryFn: async () => {
      try {
        const accounts = await connection.getProgramAccounts(REGISTRY_PROGRAM_ID)
        return accounts
          .map(({ pubkey, account }) => {
            try { return parseAsset(pubkey, account.data) } catch { return null }
          })
          .filter((a): a is AssetRecord => a !== null)
      } catch {
        return []
      }
    },
    staleTime: 30_000,
  })
}
 
// ─── Create asset mutation ────────────────────────────────────────────────────
 
export function useCreateAsset() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const qc = useQueryClient()
 
  return useMutation({
    mutationFn: async (args: {
      tokenType: TokenType
      title: string
      description: string
      category: AssetCategory
      locationGps: string
      characteristics: string
      totalSupply: bigint
      unit: string
      pricePerUnit: bigint
      currency: 'USDC' | 'USDT' | 'SOL'
      deliveryDate: number
      docsIpfs: string[]
      requiredVerifications: number
    }) => {
      if (!wallet.publicKey || !wallet.signTransaction) {
        throw new Error('Wallet not connected')
      }
 
      const { Program, AnchorProvider, BN } = await import('@coral-xyz/anchor')
      const idl = (await import('@/lib/idl/asset_registry.json')).default
      const provider = new AnchorProvider(connection, wallet as any, { commitment: 'confirmed' })
      const program = new Program(idl as any, REGISTRY_PROGRAM_ID, provider)
 
      // Новий mint keypair
      const mintKeypair = Keypair.generate()
 
      const tokenTypeMap: Record<TokenType, object> = {
        Forward: { forward: {} },
        Asset:   { asset: {} },
        Credit:  { credit: {} },
        Revenue: { revenue: {} },
      }
 
      const categoryMap: Record<AssetCategory, object> = {
        Grain:     { grain: {} },
        Oilseeds:  { oilseeds: {} },
        Livestock: { livestock: {} },
        Land:      { land: {} },
        Equipment: { equipment: {} },
        Storage:   { storage: {} },
        Other:     { other: {} },
      }
 
      const currencyMap = {
        USDC: { usdc: {} },
        USDT: { usdt: {} },
        SOL:  { sol: {} },
      }
 
      const sig = await (program.methods as any)
        .createAsset({
          tokenType:             tokenTypeMap[args.tokenType],
          title:                 args.title,
          description:           args.description,
          category:              categoryMap[args.category],
          locationGps:           args.locationGps,
          characteristics:       args.characteristics,
          totalSupply:           new BN(args.totalSupply.toString()),
          unit:                  args.unit,
          pricePerUnit:          new BN(args.pricePerUnit.toString()),
          currency:              currencyMap[args.currency],
          deliveryDate:          new BN(args.deliveryDate),
          docsIpfs:              args.docsIpfs,
          requiredVerifications: args.requiredVerifications,
        })
        .accounts({
          assetRecord:            (await PublicKey.findProgramAddress(
                                    [Buffer.from('asset'), mintKeypair.publicKey.toBuffer()],
                                    REGISTRY_PROGRAM_ID
                                  ))[0],
          mint:                   mintKeypair.publicKey,
          emitter:                wallet.publicKey,
          tokenProgram:           new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
          associatedTokenProgram: new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'),
          systemProgram:          new PublicKey('11111111111111111111111111111111'),
          rent:                   new PublicKey('SysvarRent111111111111111111111111111111111'),
        })
        .signers([mintKeypair])
        .rpc()
 
      return { sig, mint: mintKeypair.publicKey.toBase58() }
    },
    onSuccess: ({ sig, mint }) => {
      toast.success(`Asset created! Mint: ${mint.slice(0, 8)}...`)
      qc.invalidateQueries({ queryKey: ['assets'] })
    },
    onError: (e: any) => {
      console.error('CreateAsset error:', e)
      toast.error(e?.message ?? 'Transaction failed')
    },
  })
}
 
// ─── Parser ───────────────────────────────────────────────────────────────────
 
function parseAsset(pubkey: PublicKey, data: Buffer): AssetRecord {
  let offset = 8
 
  const readPubkey = () => { const pk = new PublicKey(data.slice(offset, offset + 32)).toBase58(); offset += 32; return pk }
  const readString = () => { const len = data.readUInt32LE(offset); offset += 4; const s = new TextDecoder().decode(data.slice(offset, offset + len)); offset += len; return s }
  const readStringVec = () => { const len = data.readUInt32LE(offset); offset += 4; return Array.from({ length: len }, () => readString()) }
  const readU8  = () => data[offset++]
  const readU64 = () => { const v = data.readBigUInt64LE(offset); offset += 8; return v }
  const readI64 = () => { const v = Number(data.readBigInt64LE(offset)); offset += 8; return v }
 
  const mint       = readPubkey()
  const emitter    = readPubkey()
  const tokenTypeIdx = readU8()
  const tokenTypes = ['Forward', 'Asset', 'Credit', 'Revenue'] as const
  const tokenType  = tokenTypes[tokenTypeIdx] ?? 'Forward'
  const title      = readString()
  const description = readString()
  const categoryIdx = readU8()
  const categories = ['Grain', 'Oilseeds', 'Livestock', 'Land', 'Equipment', 'Storage', 'Other'] as const
  const category   = categories[categoryIdx] ?? 'Other'
  const locationGps = readString()
  const characteristics = readString()
  const totalSupply = readU64()
  const unit        = readString()
  const pricePerUnit = readU64()
  const currencyIdx  = readU8()
  const currencies   = ['USDC', 'USDT', 'SOL'] as const
  const currency     = currencies[currencyIdx] ?? 'USDC'
  const deliveryDate = readI64()
  const docsIpfs     = readStringVec()
  const lifecycleIdx = readU8()
  const lifecycles   = ['Pending', 'Verified', 'Listed', 'PartialSold', 'FullySold', 'Delivered', 'Settled', 'Disputed', 'Frozen', 'Cancelled'] as const
  const lifecycleStatus = lifecycles[lifecycleIdx] ?? 'Pending'
  const verificationCount   = readU8()
  const requiredVerifications = readU8()
  const createdAt   = readI64()
 
  return {
    address: pubkey.toBase58(), mint, emitter, tokenType, title, description,
    category, locationGps, characteristics, totalSupply, unit, pricePerUnit,
    currency, deliveryDate, docsIpfs, lifecycleStatus, verificationCount,
    requiredVerifications, createdAt,
  }
}
