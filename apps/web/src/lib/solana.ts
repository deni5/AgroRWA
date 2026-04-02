import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js'
 
// 1. Налаштування мережі
// Пріоритет: .env -> Devnet RPC
export const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC ?? clusterApiUrl('devnet')
export const connection = new Connection(SOLANA_RPC, 'confirmed')

// 2. Валідна заглушка (System Program ID)
// Використовується, щоб new PublicKey() не падав, якщо .env порожній
const FALLBACK_ID = '11111111111111111111111111111111'

// 3. АДРЕСИ ПРОГРАМ
// ВАЖЛИВО: IDENTITY_PROGRAM_ID жорстко прописана для усунення помилки "reading _bn"
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
export const INSURANCE_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_INSURANCE_PROGRAM_ID ?? FALLBACK_ID
)
export const ORACLE_VERIFY_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_ORACLE_VERIFY_PROGRAM_ID ?? FALLBACK_ID
)

// 4. Токени та Адміністрація (Devnet)
export const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU')
export const USDT_MINT = new PublicKey('EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS')
export const WRAPPED_SOL_MINT = new PublicKey('So11111111111111111111111111111111111111112')
export const PLATFORM_ADMIN = new PublicKey('FWm4MDuTMWKJwdawF3VtUqWuZNi4Jq7TdJYWPnU5Yt8d')

// --- PDA HELPERS (IDENTITY) ---

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

// --- PDA HELPERS (ASSETS & MARKETPLACE) ---

export function getAssetPDA(mint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('agro_asset'), mint.toBuffer()],
    REGISTRY_PROGRAM_ID
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

// --- PDA HELPERS (DEFI) ---

export function getPoolPDA(mintA: PublicKey, mintB: PublicKey): [PublicKey, number] {
  const [a, b] = mintA.toBuffer().compare(mintB.toBuffer()) < 0 ? [mintA, mintB] : [mintB, mintA]
  return PublicKey.findProgramAddressSync(
    [Buffer.from('pool'), a.toBuffer(), b.toBuffer()],
    POOL_PROGRAM_ID
  )
}

export function getVaultDepositPDA(user: PublicKey, lpMint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('vault_deposit'), user.toBuffer(), lpMint.toBuffer()],
    VAULT_PROGRAM_ID
  )
}

export function getInsuranceFundPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('fund')],
    INSURANCE_PROGRAM_ID
  )
}
