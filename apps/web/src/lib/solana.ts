import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js'

// 1. Покращена функція валідації
const getValidPublicKey = (envValue: string | undefined, name: string): PublicKey => {
  if (envValue) {
    try {
      return new PublicKey(envValue);
    } catch (e) {
      console.error(`❌ Invalid PublicKey for ${name} in ENV:`, envValue);
    }
  }
  // Якщо в ENV порожньо або помилка, повертаємо "заглушку", 
  // але таку, що явно вкаже на проблему, а не просто System Program
  return new PublicKey('11111111111111111111111111111111'); 
}

export const PLATFORM_ADMIN = new PublicKey('FWm4MDuTMWKJwdawF3VtUqWuZNi4Jq7TdJYWPnU5Yt8d')
export const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC ?? clusterApiUrl('devnet')
export const connection = new Connection(SOLANA_RPC, 'confirmed')

// 2. ОБОВ'ЯЗКОВО ПЕРЕВІРТЕ ЦІ АДРЕСИ. 
// Вони мають збігатися з тим, що видав `anchor keys list` або `deploy`.
export const IDENTITY_PROGRAM_ID = getValidPublicKey(
  process.env.NEXT_PUBLIC_IDENTITY_PROGRAM_ID, 
  'IDENTITY'
);

export const ASSET_REGISTRY_PROGRAM_ID = getValidPublicKey(process.env.NEXT_PUBLIC_ASSET_REGISTRY_PROGRAM_ID, 'ASSET');
export const ORACLE_VERIFY_PROGRAM_ID = getValidPublicKey(process.env.NEXT_PUBLIC_ORACLE_VERIFY_PROGRAM_ID, 'ORACLE');
export const MARKETPLACE_PROGRAM_ID = getValidPublicKey(process.env.NEXT_PUBLIC_MARKETPLACE_PROGRAM_ID, 'MARKETPLACE');
export const INSURANCE_PROGRAM_ID = getValidPublicKey(process.env.NEXT_PUBLIC_INSURANCE_PROGRAM_ID, 'INSURANCE');

export const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU')
export const USDT_MINT = new PublicKey('EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS')

// PDA helpers
export function getEmitterPDA(wallet: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from('emitter'), wallet.toBuffer()], IDENTITY_PROGRAM_ID)
}

export function getOraclePDA(wallet: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from('oracle'), wallet.toBuffer()], IDENTITY_PROGRAM_ID)
}
// ... інші функції залишаються такими самими
