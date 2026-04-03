'use client'
 
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import {
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import { IDENTITY_PROGRAM_ID, getEmitterPDA, getOraclePDA } from '@/lib/solana'
import type { EmitterProfile, OracleProfile } from '@/types'
import toast from 'react-hot-toast'
import BN from 'bn.js'
 
// ─── Discriminators (sha256("global:instruction_name")[0..8]) ────────────────
// Генеруються як: sha256(`global:register_emitter`).slice(0, 8)
// Ці значення фіксовані для кожної інструкції Anchor програми
 
function discriminator(name: string): Buffer {
  // Використовуємо вбудований crypto для sha256
  // Формат: "global:<snake_case_instruction_name>"
  const { createHash } = require('crypto')
  return createHash('sha256').update(`global:${name}`).digest().slice(0, 8)
}
 
// ─── Encode helpers ───────────────────────────────────────────────────────────
 
function encodeString(s: string): Buffer {
  const bytes = Buffer.from(s, 'utf-8')
  const len = Buffer.alloc(4)
  len.writeUInt32LE(bytes.length, 0)
  return Buffer.concat([len, bytes])
}
 
function encodeStringVec(arr: string[]): Buffer {
  const lenBuf = Buffer.alloc(4)
  lenBuf.writeUInt32LE(arr.length, 0)
  return Buffer.concat([lenBuf, ...arr.map(encodeString)])
}
 
function encodeU64(n: BN): Buffer {
  return n.toArrayLike(Buffer, 'le', 8)
}
 
// ─── Build registerEmitter instruction manually ───────────────────────────────
 
function buildRegisterEmitterIx(
  walletPubkey: PublicKey,
  emitterPDA: PublicKey,
  args: {
    legalName: string
    edrpou: string
    country: string
    region: string
    docsIpfs: string[]
  }
): TransactionInstruction {
  const disc = discriminator('register_emitter')
  const data = Buffer.concat([
    disc,
    encodeString(args.legalName),
    encodeString(args.edrpou),
    encodeString(args.country),
    encodeString(args.region),
    encodeStringVec(args.docsIpfs),
  ])
 
  return new TransactionInstruction({
    programId: IDENTITY_PROGRAM_ID,
    keys: [
      { pubkey: emitterPDA,                isSigner: false, isWritable: true },
      { pubkey: walletPubkey,              isSigner: true,  isWritable: true },
      { pubkey: SystemProgram.programId,   isSigner: false, isWritable: false },
    ],
    data,
  })
}
 
// ─── Build registerOracle instruction manually ────────────────────────────────
 
function buildRegisterOracleIx(
  walletPubkey: PublicKey,
  oraclePDA: PublicKey,
  args: {
    name: string
    role: 'AgroExpert' | 'Notary' | 'LegalAdvisor' | 'Auditor'
    credentialsIpfs: string
    stakeAmount: BN
  }
): TransactionInstruction {
  const roleIdx = { AgroExpert: 0, Notary: 1, LegalAdvisor: 2, Auditor: 3 }
  const disc = discriminator('register_oracle')
 
  const roleBuf = Buffer.alloc(1)
  roleBuf.writeUInt8(roleIdx[args.role], 0)
 
  const data = Buffer.concat([
    disc,
    encodeString(args.name),
    roleBuf,
    encodeString(args.credentialsIpfs),
    encodeU64(args.stakeAmount),
  ])
 
  return new TransactionInstruction({
    programId: IDENTITY_PROGRAM_ID,
    keys: [
      { pubkey: oraclePDA,               isSigner: false, isWritable: true },
      { pubkey: walletPubkey,            isSigner: true,  isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  })
}
 
// ─── Fetch emitter profile ────────────────────────────────────────────────────
 
export function useEmitterProfile(wallet?: string) {
  const { connection } = useConnection()
 
  return useQuery<EmitterProfile | null>({
    queryKey: ['emitter', wallet],
    enabled: !!wallet,
    queryFn: async () => {
      if (!wallet) return null
      try {
        const [pda] = getEmitterPDA(new PublicKey(wallet))
        const info = await connection.getAccountInfo(pda)
        if (!info) return null
        return parseEmitter(pda, info.data)
      } catch (e) {
        console.error('Error fetching emitter:', e)
        return null
      }
    },
    staleTime: 30_000,
  })
}
 
// ─── Fetch oracle profile ─────────────────────────────────────────────────────
 
export function useOracleProfile(wallet?: string) {
  const { connection } = useConnection()
 
  return useQuery<OracleProfile | null>({
    queryKey: ['oracle', wallet],
    enabled: !!wallet,
    queryFn: async () => {
      if (!wallet) return null
      try {
        const [pda] = getOraclePDA(new PublicKey(wallet))
        const info = await connection.getAccountInfo(pda)
        if (!info) return null
        return parseOracle(pda, info.data)
      } catch (e) {
        console.error('Error fetching oracle:', e)
        return null
      }
    },
    staleTime: 30_000,
  })
}
 
// ─── Fetch all oracles ────────────────────────────────────────────────────────
 
export function useAllOracles() {
  const { connection } = useConnection()
 
  return useQuery<OracleProfile[]>({
    queryKey: ['oracles', 'all'],
    queryFn: async () => {
      try {
        const accounts = await connection.getProgramAccounts(IDENTITY_PROGRAM_ID)
        return accounts
          .map(({ pubkey, account }) => {
            try { return parseOracle(pubkey, account.data) } catch { return null }
          })
          .filter((o): o is OracleProfile => o !== null && o.isActive)
      } catch {
        return []
      }
    },
    staleTime: 60_000,
  })
}
 
// ─── Register emitter mutation ────────────────────────────────────────────────
 
export function useRegisterEmitter() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const qc = useQueryClient()
 
  return useMutation({
    mutationFn: async (args: {
      legalName: string
      edrpou: string
      country: string
      region: string
      docsIpfs: string[]
    }) => {
      if (!wallet.publicKey || !wallet.signTransaction) {
        throw new Error('Wallet not connected')
      }
 
      const walletPubkey = new PublicKey(wallet.publicKey.toBase58())
      const [emitterPDA] = getEmitterPDA(walletPubkey)
 
      const ix = buildRegisterEmitterIx(walletPubkey, emitterPDA, args)
 
      const tx = new Transaction().add(ix)
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
      tx.recentBlockhash = blockhash
      tx.feePayer = walletPubkey
 
      const signed = await wallet.signTransaction(tx)
      const sig = await connection.sendRawTransaction(signed.serialize())
      await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight })
 
      return sig
    },
    onSuccess: (sig: string) => {
      toast.success('KYC submitted! TX: ' + sig.slice(0, 8) + '...')
      qc.invalidateQueries({ queryKey: ['emitter'] })
    },
    onError: (e: any) => {
      console.error('Emitter Registration Error:', e)
      toast.error(e?.message ?? 'Transaction failed')
    },
  })
}
 
// ─── Register oracle mutation ─────────────────────────────────────────────────
 
export function useRegisterOracle() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const qc = useQueryClient()
 
  return useMutation({
    mutationFn: async (args: {
      name: string
      role: 'AgroExpert' | 'Notary' | 'LegalAdvisor' | 'Auditor'
      credentialsIpfs: string
      stakeAmount: bigint
    }) => {
      if (!wallet.publicKey || !wallet.signTransaction) {
        throw new Error('Wallet not connected')
      }
 
      const walletPubkey = new PublicKey(wallet.publicKey.toBase58())
      const [oraclePDA] = getOraclePDA(walletPubkey)
 
      const ix = buildRegisterOracleIx(walletPubkey, oraclePDA, {
        name: args.name,
        role: args.role,
        credentialsIpfs: args.credentialsIpfs,
        stakeAmount: new BN(args.stakeAmount.toString()),
      })
 
      const tx = new Transaction().add(ix)
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
      tx.recentBlockhash = blockhash
      tx.feePayer = walletPubkey
 
      const signed = await wallet.signTransaction(tx)
      const sig = await connection.sendRawTransaction(signed.serialize())
      await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight })
 
      return sig
    },
    onSuccess: () => {
      toast.success('Oracle registered!')
      qc.invalidateQueries({ queryKey: ['oracle'] })
    },
    onError: (e: any) => {
      console.error('Oracle Registration Error:', e)
      toast.error(e?.message ?? 'Transaction failed')
    },
  })
}
 
// ─── Parsers (raw buffer) ─────────────────────────────────────────────────────
 
function parseEmitter(pubkey: PublicKey, data: Buffer): EmitterProfile {
  let offset = 8
 
  const readPubkey = () => {
    const pk = new PublicKey(data.slice(offset, offset + 32)).toBase58()
    offset += 32; return pk
  }
  const readString = () => {
    const len = data.readUInt32LE(offset); offset += 4
    const s = new TextDecoder().decode(data.slice(offset, offset + len)); offset += len
    return s
  }
  const readStringVec = () => {
    const len = data.readUInt32LE(offset); offset += 4
    return Array.from({ length: len }, () => readString())
  }
  const readU8  = () => data[offset++]
  const readU16 = () => { const v = data.readUInt16LE(offset); offset += 2; return v }
  const readU32 = () => { const v = data.readUInt32LE(offset); offset += 4; return v }
  const readI64 = () => { const v = Number(data.readBigInt64LE(offset)); offset += 8; return v }
  const readOptionPubkey = () => {
    const some = Boolean(data[offset++])
    if (!some) return undefined
    return readPubkey()
  }
  const readOptionI64 = () => {
    const some = Boolean(data[offset++])
    if (!some) return undefined
    return readI64()
  }
 
  const wallet         = readPubkey()
  const legalName      = readString()
  const edrpou         = readString()
  const country        = readString()
  const region         = readString()
  const docsIpfs       = readStringVec()
  const kycStatusIdx   = readU8()
  const kycStatuses    = ['Pending', 'Approved', 'Rejected', 'Suspended'] as const
  const kycStatus      = kycStatuses[kycStatusIdx] ?? 'Pending'
  const kycReviewer    = readOptionPubkey()
  const kycReviewedAt  = readOptionI64()
  const kycNote        = readString()
  const ratingScore    = readU16()
  const totalIssued    = readU32()
  const totalFulfilled = readU32()
  const totalDefaults  = readU8()
  const registeredAt   = readI64()
 
  const ratingLabel = ratingScore >= 900 ? 'AAA' : ratingScore >= 700 ? 'AA' : ratingScore >= 500 ? 'A' : ratingScore >= 300 ? 'B' : 'C'
  const depositBps  = ratingScore >= 900 ? 200  : ratingScore >= 700 ? 500  : ratingScore >= 500 ? 800 : ratingScore >= 300 ? 1200 : 2000
 
  return {
    address: pubkey.toBase58(), wallet, legalName, edrpou, country, region,
    docsIpfs, kycStatus, kycReviewer, kycReviewedAt, kycNote,
    ratingScore, ratingLabel, depositBps,
    totalIssued, totalFulfilled, totalDefaults, registeredAt,
  }
}
 
function parseOracle(pubkey: PublicKey, data: Buffer): OracleProfile {
  let offset = 8
 
  const readPubkey  = () => { const pk = new PublicKey(data.slice(offset, offset + 32)).toBase58(); offset += 32; return pk }
  const readString  = () => { const len = data.readUInt32LE(offset); offset += 4; const s = new TextDecoder().decode(data.slice(offset, offset + len)); offset += len; return s }
  const readU8      = () => data[offset++]
  const readU16     = () => { const v = data.readUInt16LE(offset); offset += 2; return v }
  const readU32     = () => { const v = data.readUInt32LE(offset); offset += 4; return v }
  const readU64     = () => { const v = data.readBigUInt64LE(offset); offset += 8; return v }
  const readBool    = () => Boolean(data[offset++])
  const readI64     = () => { const v = Number(data.readBigInt64LE(offset)); offset += 8; return v }
 
  const wallet          = readPubkey()
  const name            = readString()
  const roleIdx         = readU8()
  const roles           = ['AgroExpert', 'Notary', 'LegalAdvisor', 'Auditor'] as const
  const role            = roles[roleIdx] ?? 'AgroExpert'
  const credentialsIpfs = readString()
  const stakeAmount     = readU64()
  const isActive        = readBool()
  const reputationScore = readU16()
  const verifiedCount   = readU32()
  const disputeCount    = readU16()
  const registeredAt    = readI64()
 
  return {
    address: pubkey.toBase58(), wallet, name, role, credentialsIpfs,
    stakeAmount, isActive, reputationScore, verifiedCount, disputeCount, registeredAt,
  }
}
