import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js'

// Основні налаштування мережі
export const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC ?? clusterApiUrl('devnet')
export const connection = new Connection(SOLANA_RPC, 'confirmed')

// Адреса адміністратора платформи
export const PLATFORM_ADMIN = new PublicKey('FWm4MDuTMWKJwdawF3VtUqWuZNi4Jq7TdJYWPnU5Yt8d')

// --- АДРЕСИ ПРОГРАМ (IDENTITY ТЕПЕР ЖОРСТКО ПРОПИСАНА) ---
export const IDENTITY_PROGRAM_ID = new PublicKey('AUdYNM3A42jfaUkaSXeLJEXypgWFxKB1gP1hHLePkasv')

// Інші програми (поки залишаємо системними, якщо немає реальних ID)
const FALLBACK_ID = new PublicKey('11111111111111111111111111111111')
export const ASSET_REGISTRY_PROGRAM_ID = FALLBACK_ID
export const ORACLE_VERIFY_PROGRAM_ID = FALLBACK_ID
export const MARKETPLACE_PROGRAM_ID = FALLBACK_ID
export const INSURANCE_PROGRAM_ID = FALLBACK_ID

// Токени (Devnet USDC/USDT)
export const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU')
export const USDT_MINT = new PublicKey('EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS')

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
    [Buffer.from('asset'), mint.toBuffer()],
    ASSET_REGISTRY_PROGRAM_ID
  )
}

export function getVerifyPDA(assetMint: PublicKey, oracle: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('verify'), assetMint.toBuffer(), oracle.toBuffer()],
    ORACLE_VERIFY_PROGRAM_ID
  )
}

export function getListingPDA(assetMint: PublicKey, emitter: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('listing'), assetMint.toBuffer(), emitter.toBuffer()],
    MARKETPLACE_PROGRAM_ID
  )
}

export function getInsuranceFundPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('fund')],
    INSURANCE_PROGRAM_ID
  )
}
