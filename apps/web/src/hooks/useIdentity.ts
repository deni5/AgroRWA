'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, SystemProgram } from '@solana/web3.js'
import { IDENTITY_PROGRAM_ID, getEmitterPDA, getOraclePDA } from '@/lib/solana'
import type { EmitterProfile, OracleProfile } from '@/types'
import toast from 'react-hot-toast'

// ─── Fetch emitter profile ────────────────────────────────────────────────────

export function useEmitterProfile(wallet?: string) {
  const { connection } = useConnection()

  return useQuery<EmitterProfile | null>({
    queryKey: ['emitter', wallet],
    enabled: !!wallet,
    queryFn: async () => {
      if (!wallet) return null
      const [pda] = getEmitterPDA(new PublicKey(wallet))
      const info = await connection.getAccountInfo(pda)
      if (!info) return null
      return parseEmitter(pda, info.data)
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
      const [pda] = getOraclePDA(new PublicKey(wallet))
      const info = await connection.getAccountInfo(pda)
      if (!info) return null
      return parseOracle(pda, info.data)
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
      const accounts = await connection.getProgramAccounts(IDENTITY_PROGRAM_ID, {
        filters: [{ memcmp: { offset: 8 + 32 + 4, bytes: '' } }], // all oracle accounts
      })
      return accounts
        .map(({ pubkey, account }) => {
          try { return parseOracle(pubkey, account.data) } catch { return null }
        })
        .filter((o): o is OracleProfile => o !== null && o.isActive)
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
      edrpou: any // Змінено на any, щоб приймати і рядок, і BN
      country: string
      region: string
      docsIpfs: string[]
    }) => {
      if (!wallet.publicKey) throw new Error('Wallet not connected')

      // Динамічний імпорт Anchor
      const { Program, AnchorProvider, BN } = await import('@coral-xyz/anchor')
      const idl = (await import('@/lib/idl/identity.json')).default
      
      const provider = new AnchorProvider(connection, wallet as any, { commitment: 'confirmed' })
      const program = new Program(idl as any, provider)

      const [emitterPDA] = getEmitterPDA(wallet.publicKey)

      // ПЕРЕВІРКА ТА ПЕРЕТВОРЕННЯ ЄДРПОУ (Лікуємо _bn тут)
      let finalEdrpou = args.edrpou;
      if (typeof args.edrpou === 'string') {
        const clean = args.edrpou.replace(/\D/g, '');
        if (!clean) throw new Error("EDRPOU is empty or invalid");
        finalEdrpou = new BN(clean);
      }

      console.log("Submitting with EDRPOU BN:", finalEdrpou.toString());

      const tx = await program.methods
        .registerEmitter({
          legalName: args.legalName,
          edrpou: finalEdrpou, // Тепер це точно BN об'єкт
          country: args.country,
          region: args.region,
          docsIpfs: args.docsIpfs,
        })
        .accounts({
          emitterProfile: emitterPDA,
          wallet: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc()

      return tx
    },
    onSuccess: () => {
      toast.success('Registration submitted! Awaiting KYC review.')
      qc.invalidateQueries({ queryKey: ['emitter'] })
    },
    onError: (e: Error) => {
      console.error("Mutation Error:", e);
      toast.error(e.message);
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
      if (!wallet.publicKey) throw new Error('Wallet not connected')

      const { Program, AnchorProvider, BN } = await import('@coral-xyz/anchor')
      const idl = (await import('@/lib/idl/identity.json')).default
      const provider = new AnchorProvider(connection, wallet as any, { commitment: 'confirmed' })
      const program = new Program(idl as any, provider)

      const [oraclePDA] = getOraclePDA(wallet.publicKey)
      const roleMap = {
        AgroExpert: { agroExpert: {} },
        Notary: { notary: {} },
        LegalAdvisor: { legalAdvisor: {} },
        Auditor: { auditor: {} },
      }

      const tx = await program.methods
        .registerOracle({
          name: args.name,
          role: roleMap[args.role],
          credentialsIpfs: args.credentialsIpfs,
          stakeAmount: new BN(args.stakeAmount.toString()),
        })
        .accounts({
          oracleProfile: oraclePDA,
          wallet: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc()

      return tx
    },
    onSuccess: () => {
      toast.success('Oracle registration submitted! Awaiting activation.')
      qc.invalidateQueries({ queryKey: ['oracle'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

// ─── Parsers ──────────────────────────────────────────────────────────────────

function parseEmitter(pubkey: PublicKey, data: Buffer): EmitterProfile {
  let offset = 8

  const readPubkey = () => { const pk = new PublicKey(data.slice(offset, offset + 32)).toBase58(); offset += 32; return pk }
  const readString = () => { const len = data.readUInt32LE(offset); offset += 4; const s = new TextDecoder().decode(data.slice(offset, offset + len)); offset += len; return s }
  const readStringVec = () => { const len = data.readUInt32LE(offset); offset += 4; return Array.from({ length: len }, () => readString()) }
  const readU8 = () => data[offset++]
  const readU16 = () => { const v = data.readUInt16LE(offset); offset += 2; return v }
  const readU32 = () => { const v = data.readUInt32LE(offset); offset += 4; return v }
  const readI64 = () => { const v = Number(data.readBigInt64LE(offset)); offset += 8; return v }
  const readOptionPubkey = () => { const some = Boolean(data[offset++]); if (!some) return undefined; const pk = new PublicKey(data.slice(offset, offset + 32)).toBase58(); offset += 32; return pk }
  const readOptionI64 = () => { const some = Boolean(data[offset++]); if (!some) return undefined; const v = Number(data.readBigInt64LE(offset)); offset += 8; return v }

  const wallet          = readPubkey()
  const legalName       = readString()
  const edrpou          = readString()
  const country         = readString()
  const region          = readString()
  const docsIpfs        = readStringVec()
  const kycStatusIdx    = readU8(); readU8() // enum discriminator
  const kycStatuses     = ['Pending', 'Approved', 'Rejected', 'Suspended'] as const
  const kycStatus       = kycStatuses[kycStatusIdx] ?? 'Pending'
  const kycReviewer     = readOptionPubkey()
  const kycReviewedAt   = readOptionI64()
  const kycNote         = readString()
  const ratingScore     = readU16()
  const totalIssued     = readU32()
  const totalFulfilled  = readU32()
  const totalDefaults   = readU8()
  const registeredAt    = readI64()
  readU8() // bump

  const ratingLabel = ratingScore >= 900 ? 'AAA' : ratingScore >= 700 ? 'AA' : ratingScore >= 500 ? 'A' : ratingScore >= 300 ? 'B' : 'C'
  const depositBps  = ratingScore >= 900 ? 200  : ratingScore >= 700 ? 500  : ratingScore >= 500 ? 800 : ratingScore >= 300 ? 1200 : 2000

  return {
    address: pubkey.toBase58(), wallet, legalName, edrpou, country, region,
    docsIpfs, kycStatus, kycReviewer, kycReviewedAt, kycNote: kycNote ?? '',
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

  const wallet            = readPubkey()
  const name              = readString()
  const roleIdx           = readU8(); readU8()
  const roles             = ['AgroExpert', 'Notary', 'LegalAdvisor', 'Auditor'] as const
  const role              = roles[roleIdx] ?? 'AgroExpert'
  const credentialsIpfs   = readString()
  const stakeAmount       = readU64()
  const isActive          = readBool()
  const reputationScore   = readU16()
  const verifiedCount     = readU32()
  const disputeCount      = readU16()
  const registeredAt      = readI64()
  readU8() // bump

  return {
    address: pubkey.toBase58(), wallet, name, role, credentialsIpfs,
    stakeAmount, isActive, reputationScore, verifiedCount, disputeCount, registeredAt,
  }
}
