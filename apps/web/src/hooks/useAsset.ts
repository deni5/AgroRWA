'use client'
 
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import {
  PublicKey, Keypair, Transaction, TransactionInstruction,
  SystemProgram, SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js'
import { REGISTRY_PROGRAM_ID } from '@/lib/solana'
import type { AssetRecord, TokenType, AssetCategory } from '@/types'
import toast from 'react-hot-toast'
import BN from 'bn.js'
import { createHash } from 'crypto'
 
// ─── Constants ────────────────────────────────────────────────────────────────
const TOKEN_PROGRAM_ID        = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
const ASSOCIATED_TOKEN_PROGRAM = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
 
// ─── Encoding helpers ─────────────────────────────────────────────────────────
function disc(name: string): Buffer {
  return Buffer.from(createHash('sha256').update(`global:${name}`).digest()).slice(0, 8)
}
function encodeString(s: string): Buffer {
  const b = Buffer.from(s, 'utf-8')
  const len = Buffer.alloc(4); len.writeUInt32LE(b.length, 0)
  return Buffer.concat([len, b])
}
function encodeStringVec(arr: string[]): Buffer {
  const len = Buffer.alloc(4); len.writeUInt32LE(arr.length, 0)
  return Buffer.concat([len, ...arr.map(encodeString)])
}
function encodeU8(n: number): Buffer { const b = Buffer.alloc(1); b.writeUInt8(n, 0); return b }
function encodeU64(n: BN): Buffer { return n.toArrayLike(Buffer, 'le', 8) }
function encodeI64(n: number): Buffer { return new BN(n).toArrayLike(Buffer, 'le', 8) }
 
const TOKEN_TYPE_IDX: Record<TokenType, number> = { Forward: 0, Asset: 1, Credit: 2, Revenue: 3 }
const CATEGORY_IDX: Record<AssetCategory, number> = {
  Grain: 0, Oilseeds: 1, Livestock: 2, Land: 3, Equipment: 4, Storage: 5, Other: 6
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
      } catch { return [] }
    },
    staleTime: 30_000,
  })
}
 
// ─── Fetch single asset ───────────────────────────────────────────────────────
export function useAsset(mint?: string) {
  const { connection } = useConnection()
 
  return useQuery<AssetRecord | null>({
    queryKey: ['asset', mint],
    enabled: !!mint,
    queryFn: async () => {
      if (!mint) return null
      try {
        const [pda] = PublicKey.findProgramAddressSync(
          [Buffer.from('asset'), new PublicKey(mint).toBuffer()],
          REGISTRY_PROGRAM_ID
        )
        const info = await connection.getAccountInfo(pda)
        if (!info) return null
        return parseAsset(pda, info.data)
      } catch { return null }
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
 
      const mintKeypair = Keypair.generate()
      const [assetPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('asset'), mintKeypair.publicKey.toBuffer()],
        REGISTRY_PROGRAM_ID
      )
 
      const currencyIdx: Record<string, number> = { USDC: 0, USDT: 1, SOL: 2 }
 
      const data = Buffer.concat([
        disc('create_asset'),
        encodeU8(TOKEN_TYPE_IDX[args.tokenType]),
        encodeString(args.title),
        encodeString(args.description),
        encodeU8(CATEGORY_IDX[args.category]),
        encodeString(args.locationGps || ''),
        encodeString(args.characteristics || '{}'),
        encodeU64(new BN(args.totalSupply.toString())),
        encodeString(args.unit),
        encodeU64(new BN(args.pricePerUnit.toString())),
        encodeU8(currencyIdx[args.currency] ?? 0),
        encodeI64(args.deliveryDate),
        encodeStringVec(args.docsIpfs),
        encodeU8(args.requiredVerifications),
      ])
 
      const ix = new TransactionInstruction({
        programId: REGISTRY_PROGRAM_ID,
        keys: [
          { pubkey: assetPDA,                isSigner: false, isWritable: true },
          { pubkey: mintKeypair.publicKey,   isSigner: true,  isWritable: true },
          { pubkey: wallet.publicKey,        isSigner: true,  isWritable: true },
          { pubkey: TOKEN_PROGRAM_ID,        isSigner: false, isWritable: false },
          { pubkey: ASSOCIATED_TOKEN_PROGRAM,isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          { pubkey: SYSVAR_RENT_PUBKEY,      isSigner: false, isWritable: false },
        ],
        data,
      })
 
      const tx = new Transaction().add(ix)
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
      tx.recentBlockhash = blockhash
      tx.feePayer = wallet.publicKey
      tx.partialSign(mintKeypair)
 
      const signed = await wallet.signTransaction(tx)
      const sig = await connection.sendRawTransaction(signed.serialize())
      await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight })
 
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
 
  const readPubkey    = () => { const pk = new PublicKey(data.slice(offset, offset + 32)).toBase58(); offset += 32; return pk }
  const readString    = () => { const len = data.readUInt32LE(offset); offset += 4; const s = new TextDecoder().decode(data.slice(offset, offset + len)); offset += len; return s }
  const readStringVec = () => { const len = data.readUInt32LE(offset); offset += 4; return Array.from({ length: len }, () => readString()) }
  const readU8        = () => data[offset++]
  const readU64       = () => { const v = data.readBigUInt64LE(offset); offset += 8; return v }
  const readI64       = () => { const v = Number(data.readBigInt64LE(offset)); offset += 8; return v }
 
  const mint              = readPubkey()
  const emitter           = readPubkey()
  const tokenTypeIdx      = readU8()
  const tokenTypes        = ['Forward', 'Asset', 'Credit', 'Revenue'] as const
  const tokenType         = tokenTypes[tokenTypeIdx] ?? 'Forward'
  const title             = readString()
  const description       = readString()
  const categoryIdx       = readU8()
  const categories        = ['Grain', 'Oilseeds', 'Livestock', 'Land', 'Equipment', 'Storage', 'Other'] as const
  const category          = categories[categoryIdx] ?? 'Other'
  const locationGps       = readString()
  const characteristics   = readString()
  const totalSupply       = readU64()
  const unit              = readString()
  const pricePerUnit      = readU64()
  const currencyIdx       = readU8()
  const currencies        = ['USDC', 'USDT', 'SOL'] as const
  const currency          = currencies[currencyIdx] ?? 'USDC'
  const deliveryDate      = readI64()
  const docsIpfs          = readStringVec()
  const lifecycleIdx      = readU8()
  const lifecycles        = ['Pending','Verified','Listed','PartialSold','FullySold','Delivered','Settled','Disputed','Frozen','Cancelled'] as const
  const lifecycleStatus   = lifecycles[lifecycleIdx] ?? 'Pending'
  const verificationCount      = readU8()
  const requiredVerifications  = readU8()
  const createdAt         = readI64()
 
  return {
    address: pubkey.toBase58(), mint, emitter, tokenType, title, description,
    category, locationGps, characteristics, totalSupply, unit, pricePerUnit,
    currency, deliveryDate, docsIpfs, lifecycleStatus, verificationCount,
    requiredVerifications, createdAt,
  }
}
