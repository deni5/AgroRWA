'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, SystemProgram } from '@solana/web3.js'
// ФІКС: Змінено імпорт на правильний файл
import { REGISTRY_PROGRAM_ID, getAssetPDA } from '@/lib/solana'
import { Token, AssetCategory } from '@/types'
import toast from 'react-hot-toast'

// ─── Fetch all registered assets ─────────────────────────────────────────────

export function useAllTokens() {
  const { connection } = useConnection()

  return useQuery<Token[]>({
    queryKey: ['tokens', 'all'],
    queryFn: async () => {
      // Отримуємо всі акаунти, що належать програмі реєстру
      const accounts = await connection.getProgramAccounts(REGISTRY_PROGRAM_ID)

      return accounts.map(({ pubkey, account }) => {
        // Парсимо дані акаунта (пропускаємо 8-байтний дискримінатор Anchor)
        const data = Buffer.from(account.data)
        let offset = 8

        const readPubkey = () => {
          const pk = new PublicKey(data.slice(offset, offset + 32))
          offset += 32
          return pk.toBase58()
        }
        
        const readString = () => {
          const len = data.readUInt32LE(offset)
          offset += 4
          const str = data.slice(offset, offset + len).toString('utf8')
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
        
        // Пропускаємо опціональний reward_mint (поле Option в Rust: 1 байт прапорець + 32 байти адреса)
        const hasRewardMint = readBool()
        if (hasRewardMint) {
          offset += 32
        }
        
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

      // Динамічний імпорт для уникнення проблем з SSR
      const { Program, AnchorProvider } = await import('@coral-xyz/anchor')
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
