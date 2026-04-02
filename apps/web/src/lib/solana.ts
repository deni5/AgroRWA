import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js'

// 1. Налаштування мережі (Devnet за замовчуванням)
export const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC ?? clusterApiUrl('devnet')
export const connection = new Connection(SOLANA_RPC, 'confirmed')

// 2. Валідна заглушка для програм, які ще не розгорнуті (System Program)
const FALLBACK_ID = '11111111111111111111111111111111'

// 3. АДРЕСИ ПРОГРАМ
// ВАЖЛИВО: IDENTITY_PROGRAM_ID має збігатися з вашим identity.json
export const IDENTITY_PROGRAM_ID = new PublicKey('AUdYNM3A42jfaUkaSXeLJEXypgWFxKB1gP1hHLePkasv')

export const REGISTRY_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_REGISTRY_PROGRAM_ID ?? FALLBACK_ID
)
export const POOL_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_POOL_PROGRAM_ID ?? FALLBACK_ID
)
export const VAULT_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_VAULT_PROGRAM_ID ?? FALLBACK_ID
)
export const MARKETPLACE_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_MARKETPLACE_PROGRAM_ID ?? FALLBACK_ID
)

// 4. Токени та Адміністрація
export const USDC_DEVNET_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU')
export const PLATFORM_ADMIN = new PublicKey('FWm4MDuTMWKJwdawF3VtUqWuZNi4Jq7TdJYWPnU5Yt8d')

// --- PDA HELPERS ---

export function getEmitterPDA(wallet: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('emitter'), wallet.toBuffer()],
    IDENTITY_PROGRAM_ID
  )
}

export function getOraclePDA(wallet: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('oracle'), wallet.toBuffer()],
    IDENTITY_PROGRAM_ID
  )
}

export function getAssetPDA(mint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('agro_asset'), mint.toBuffer()],
    REGISTRY_PROGRAM_ID
  )
}
