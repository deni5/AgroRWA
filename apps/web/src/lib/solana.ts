import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js'

/**
 * БЕЗПЕЧНА ІНІЦІАЛІЗАЦІЯ PUBLIC KEY
 * Це критично для Next.js / Vercel. 
 * Якщо рядок з .env порожній або містить не-Base58 символи (як "0", "O", "I"), 
 * використовується системний ID як безпечний fallback, щоб білд не падав.
 */
const getValidOrFallback = (envValue: string | undefined, fallback: string): PublicKey => {
  try {
    return new PublicKey(envValue || fallback);
  } catch (error) {
    // Якщо env порожній або битий, повертаємо fallback (має бути валідним Base58)
    return new PublicKey(fallback);
  }
}

// Константа для валідного fallback (System Program ID)
const SYSTEM_PROGRAM_ID = '11111111111111111111111111111111';

export const PLATFORM_ADMIN = new PublicKey('FWm4MDuTMWKJwdawF3VtUqWuZNi4Jq7TdJYWPnU5Yt8d')

export const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC ?? clusterApiUrl('devnet')
export const connection = new Connection(SOLANA_RPC, 'confirmed')

// Program IDs — Оновіть ці змінні у налаштуваннях Vercel (Environment Variables)
export const IDENTITY_PROGRAM_ID = getValidOrFallback(
  process.env.NEXT_PUBLIC_IDENTITY_PROGRAM_ID, 
  SYSTEM_PROGRAM_ID
)

export const ASSET_REGISTRY_PROGRAM_ID = getValidOrFallback(
  process.env.NEXT_PUBLIC_ASSET_REGISTRY_PROGRAM_ID, 
  SYSTEM_PROGRAM_ID
)

export const ORACLE_VERIFY_PROGRAM_ID = getValidOrFallback(
  process.env.NEXT_PUBLIC_ORACLE_VERIFY_PROGRAM_ID, 
  SYSTEM_PROGRAM_ID
)

export const MARKETPLACE_PROGRAM_ID = getValidOrFallback(
  process.env.NEXT_PUBLIC_MARKETPLACE_PROGRAM_ID, 
  SYSTEM_PROGRAM_ID
)

export const INSURANCE_PROGRAM_ID = getValidOrFallback(
  process.env.NEXT_PUBLIC_INSURANCE_PROGRAM_ID, 
  SYSTEM_PROGRAM_ID
)

// Well-known devnet token mints
export const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU')
export const USDT_MINT = new PublicKey('EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS')

// ─── PDA helpers ──────────────────────────────────────────────────────────────

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
