import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import * as fs from 'fs'
import * as path from 'path'

async function main() {
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)

  console.log('Deploying to:', provider.connection.rpcEndpoint)
  console.log('Deployer:', provider.wallet.publicKey.toBase58())

  // ── AgroRegistry ────────────────────────────────────────────────────────────
  const registryIdl = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../idl/agro_registry.json'), 'utf-8')
  )
  const registryProgram = new Program(registryIdl, provider)
  console.log('\n✅ AgroRegistry program ID:', registryProgram.programId.toBase58())

  // ── LiquidityPool ────────────────────────────────────────────────────────────
  const poolIdl = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../idl/liquidity_pool.json'), 'utf-8')
  )
  const poolProgram = new Program(poolIdl, provider)
  console.log('✅ LiquidityPool program ID:', poolProgram.programId.toBase58())

  // ── Vault ────────────────────────────────────────────────────────────────────
  const vaultIdl = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../idl/vault.json'), 'utf-8')
  )
  const vaultProgram = new Program(vaultIdl, provider)
  console.log('✅ Vault program ID:', vaultProgram.programId.toBase58())

  // ── Write .env.local ─────────────────────────────────────────────────────────
  const envContent = [
    `NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com`,
    `NEXT_PUBLIC_REGISTRY_PROGRAM_ID=${registryProgram.programId.toBase58()}`,
    `NEXT_PUBLIC_POOL_PROGRAM_ID=${poolProgram.programId.toBase58()}`,
    `NEXT_PUBLIC_VAULT_PROGRAM_ID=${vaultProgram.programId.toBase58()}`,
  ].join('\n')

  const envPath = path.join(__dirname, '../apps/web/.env.local')
  fs.writeFileSync(envPath, envContent)
  console.log('\n📄 Written to apps/web/.env.local')
  console.log('\n🚀 All programs deployed! Run: cd apps/web && npm run dev')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
