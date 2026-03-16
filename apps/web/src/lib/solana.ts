import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js'

export const PLATFORM_ADMIN = new PublicKey('FWm4MDuTMWKJwdawF3VtUqWuZNi4Jq7TdJYWPnU5Yt8d')

export const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC ?? clusterApiUrl('devnet')
export const connection  = new Connection(SOLANA_RPC, 'confirmed')

// Program IDs — update after anchor deploy
export const IDENTITY_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_IDENTITY_PROGRAM_ID ?? 'AgroID111111111111111111111111111111111111111'
)
export const ASSET_REGISTRY_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_ASSET_REGISTRY_PROGRAM_ID ?? 'AgroAsset11111111111111111111111111111111111'
)
export const ORACLE_VERIFY_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_ORACLE_VERIFY_PROGRAM_ID ?? 'AgroOracle1111111111111111111111111111111111'
)
export const MARKETPLACE_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_MARKETPLACE_PROGRAM_ID ?? 'AgroMkt1111111111111111111111111111111111111'
)
export const INSURANCE_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_INSURANCE_PROGRAM_ID ?? 'AgroIns1111111111111111111111111111111111111'
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
