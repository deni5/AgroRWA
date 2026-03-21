'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, SystemProgram } from '@solana/web3.js'
import { REGISTRY_PROGRAM_ID, getAssetPDA } from '@/lib/solanaConnection'
import { Token, AssetCategory } from '@/types'
import toast from 'react-hot-toast'

// ─── Fetch all registered assets ─────────────────────────────────────────────

export function useAllTokens() {
  const { connection } = useConnection()

  return useQuery<Token[]>({
    queryKey: ['tokens', 'all'],
    queryFn: async () => {
      // Fetch all accounts owned by the registry program
      const accounts = await connection.getProgramAccounts(REGISTRY_PROGRAM_ID)

      return accounts.map(({ pubkey, account }) => {
        // Parse account data (skip 8-byte discriminator)
        const data = account.data.slice(8)
        let offset = 0

        const readPubkey = () => {
          const pk = new PublicKey(data.slice(offset, offset + 32))
          offset += 32
          return pk.toBase58()
        }
        const readString = () => {
          const len = data.readUInt32LE(offset)
          offset += 4
          const str = new TextDecoder().decode(data.slice(offset, offset + len))
          offset += len
          return str
        }
        const readU8 = () => data[offset++]
        const readBool = () => Boolean(data[offset++])
        const readI64 = () => {
          const val = data.readBigInt64LE(offset)
          offset += 8
          return Number(val)
        }

        const mint    = readPubkey()
        const creator = readPubkey()
        const title   = readString()
        const description = readString()
        const categoryIndex = readU8()
        const categories: AssetCategory[] = [
          'Farmland','GrainProduction','Livestock',
          'HarvestFutures','AgriculturalMachinery','Other',
        ]
        const category = categories[categoryIndex] ?? 'Other'
        const logoUrl = readString()
        const bonusEnabled = readBool()
        // skip optional reward_mint (1 + 32 bytes)
        offset += 33
        const registeredAt = readI64()

        return {
          mint,
          creator,
          name: title,
          symbol: title.slice(0, 6).toUpperCase().replace(/\s/g, ''),
          decimals: 6,
          description,
          category,
          logoUrl: logoUrl || undefined,
          bonusEnabled,
          registeredAt,
        } satisfies Token
      })
    },
    staleTime: 60_000,
  })
}

// ─── Fetch single token ───────────────────────────────────────────────────────

export function useToken(mint: string) {
  const { data: all, ...rest } = useAllTokens()
  const token = all?.find((t) => t.mint === mint)
  return { data: token, ...rest }
}

// ─── Register token mutation ──────────────────────────────────────────────────

export interface RegisterTokenInput {
  mintAddress: string
  title: string
  description: string
  category: AssetCategory
  logoUrl: string
  bonusEnabled: boolean
  rewardMint?: string
}

export function useRegisterToken() {
  const { connection } = useConnection()
  const wallet = useWallet()

  return useMutation({
    mutationFn: async (input: RegisterTokenInput) => {
      if (!wallet.publicKey || !wallet.sendTransaction) {
        throw new Error('Wallet not connected')
      }

      // Dynamic import to avoid SSR issues
      const { Program, AnchorProvider, BN } = await import('@coral-xyz/anchor')
      const idl = (await import('@/lib/idl/asset_registry.json')).default

      const provider = new AnchorProvider(connection, wallet as any, {
        commitment: 'confirmed',
      })
      const program = new Program(idl as any, provider)

      const mint = new PublicKey(input.mintAddress)
      const [agroAssetPDA] = getAssetPDA(mint)

      const categoryMap: Record<AssetCategory, object> = {
        Farmland:              { farmland: {} },
        GrainProduction:       { grainProduction: {} },
        Livestock:             { livestock: {} },
        HarvestFutures:        { harvestFutures: {} },
        AgriculturalMachinery: { agriculturalMachinery: {} },
        Other:                 { other: {} },
      }

      const tx = await program.methods
        .registerToken({
          title: input.title,
          description: input.description,
          category: categoryMap[input.category],
          logoUrl: input.logoUrl,
          bonusEnabled: input.bonusEnabled,
          rewardMint: input.rewardMint ? new PublicKey(input.rewardMint) : null,
        })
        .accounts({
          agroAsset: agroAssetPDA,
          mint,
          creator: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc()

      return tx
    },
    onSuccess: (sig) => {
      toast.success('Token registered!')
      console.log('tx:', sig)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })
}
