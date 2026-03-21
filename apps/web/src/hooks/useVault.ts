'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, SystemProgram } from '@solana/web3.js'
import { VAULT_PROGRAM_ID, getVaultDepositPDA } from '@/lib/solanaConnection'
import { VaultDeposit } from '@/types'
import BN from 'bn.js'
import toast from 'react-hot-toast'

// ─── Fetch user's vault deposits ─────────────────────────────────────────────

export function useVaultDeposits() {
  const { connection } = useConnection()
  const { publicKey } = useWallet()

  return useQuery<VaultDeposit[]>({
    queryKey: ['vault', 'deposits', publicKey?.toBase58()],
    enabled: !!publicKey,
    queryFn: async () => {
      if (!publicKey) return []

      const accounts = await connection.getProgramAccounts(VAULT_PROGRAM_ID, {
        filters: [
          { memcmp: { offset: 8, bytes: publicKey.toBase58() } }, // user field
        ],
      })

      const now = Math.floor(Date.now() / 1000)

      return accounts.map(({ pubkey, account }) => {
        const data = account.data.slice(8)
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
        const readI64 = () => {
          const val = Number(data.readBigInt64LE(offset))
          offset += 8
          return val
        }

        const user       = readPubkey()
        const lpMint     = readPubkey()
        const amount     = readU64()
        const unlockTime = readI64()
        const redeemed   = Boolean(data[offset++])

        return {
          address: pubkey.toBase58(),
          user,
          lpMint,
          amount,
          unlockTime,
          redeemed,
          secondsRemaining: Math.max(0, unlockTime - now),
        } satisfies VaultDeposit
      })
    },
    staleTime: 30_000,
  })
}

// ─── Deposit LP ───────────────────────────────────────────────────────────────

export function useDepositLp() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({
      lpMint,
      amount,
    }: {
      lpMint: string
      amount: bigint
    }) => {
      if (!wallet.publicKey || !wallet.sendTransaction)
        throw new Error('Wallet not connected')

      const { Program, AnchorProvider } = await import('@coral-xyz/anchor')
      const idl = (await import('@/lib/idl/insurance.json')).default
      const provider = new AnchorProvider(connection, wallet as any, { commitment: 'confirmed' })
      const program = new Program(idl as any, provider)

      const lpMintPK = new PublicKey(lpMint)
      const [depositPDA] = getVaultDepositPDA(wallet.publicKey, lpMintPK)

      const tx = await program.methods
        .depositLp(new BN(amount.toString()))
        .accounts({
          vaultDeposit: depositPDA,
          lpMint: lpMintPK,
          user: wallet.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
          associatedTokenProgram: new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe1bsn'),
        })
        .rpc()

      return tx
    },
    onSuccess: (sig) => {
      toast.success('LP tokens locked for 30 days!')
      qc.invalidateQueries({ queryKey: ['vault'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

// ─── Redeem LP ────────────────────────────────────────────────────────────────

export function useRedeemLp() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ deposit }: { deposit: VaultDeposit }) => {
      if (!wallet.publicKey || !wallet.sendTransaction)
        throw new Error('Wallet not connected')

      const { Program, AnchorProvider } = await import('@coral-xyz/anchor')
      const idl = (await import('@/lib/idl/vault.json')).default
      const provider = new AnchorProvider(connection, wallet as any, { commitment: 'confirmed' })
      const program = new Program(idl as any, provider)

      const lpMintPK = new PublicKey(deposit.lpMint)
      const [depositPDA] = getVaultDepositPDA(wallet.publicKey, lpMintPK)

      const tx = await program.methods
        .redeemLp()
        .accounts({
          vaultDeposit: depositPDA,
          lpMint: lpMintPK,
          user: wallet.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        })
        .rpc()

      return tx
    },
    onSuccess: () => {
      toast.success('LP tokens redeemed!')
      qc.invalidateQueries({ queryKey: ['vault'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })
}
