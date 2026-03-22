import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js'

export const SOLANA_RPC =
  process.env.NEXT_PUBLIC_SOLANA_RPC ?? clusterApiUrl('devnet')

export const connection = new Connection(SOLANA_RPC, 'confirmed')

// Використовуємо валідну Base58 заглушку (System Program ID)
const FALLBACK_ID = '11111111111111111111111111111111'

// Program IDs (тепер з валідними fallback-значеннями)
export const REGISTRY_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_REGISTRY_PROGRAM_ID ?? FALLBACK_ID
)

export const POOL_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_POOL_PROGRAM_ID ?? FALLBACK_ID
)

export const VAULT_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_VAULT_PROGRAM_ID ?? FALLBACK_ID
)

// Ця змінна також потрібна, якщо вона використовується в useMarketplace.ts
export const MARKETPLACE_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_MARKETPLACE_PROGRAM_ID ?? FALLBACK_ID
)

// Well-known devnet mints
export const WRAPPED_SOL_MINT = new PublicKey('So11111111111111111111111111111111111111112')
export const USDC_DEVNET_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU')

// PDA helpers (залишаються без змін)
export function getAssetPDA(mint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('agro_asset'), mint.toBuffer()],
    REGISTRY_PROGRAM_ID
  )
}

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
