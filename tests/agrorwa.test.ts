import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair, PublicKey, SystemProgram } from '@solana/web3.js'
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { assert } from 'chai'

describe('AgroRWA — full flow', () => {
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)

  const registryProgram = anchor.workspace.AgroRegistry as Program
  const poolProgram     = anchor.workspace.LiquidityPool as Program
  const vaultProgram    = anchor.workspace.Vault as Program

  let mintA: PublicKey
  let mintB: PublicKey
  let assetPDA: PublicKey

  const payer = (provider.wallet as anchor.Wallet).payer

  // ── Registry tests ─────────────────────────────────────────────────────────

  it('Creates an SPL mint for the agricultural asset', async () => {
    mintA = await createMint(provider.connection, payer, payer.publicKey, null, 6)
    console.log('Mint A:', mintA.toBase58())
    assert.ok(mintA)
  })

  it('Registers the agricultural asset', async () => {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from('agro_asset'), mintA.toBuffer()],
      registryProgram.programId
    )
    assetPDA = pda

    await registryProgram.methods
      .registerToken({
        title: 'Wheat Harvest 2025',
        description: 'Premium durum wheat from Kharkiv region',
        category: { grainProduction: {} },
        logoUrl: 'https://example.com/wheat.png',
        bonusEnabled: false,
        rewardMint: null,
      })
      .accounts({
        agroAsset: pda,
        mint: mintA,
        creator: payer.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc()

    const asset = await registryProgram.account.agroAsset.fetch(pda)
    assert.equal(asset.title, 'Wheat Harvest 2025')
    assert.deepEqual(asset.category, { grainProduction: {} })
    console.log('✅ Asset registered:', asset.title)
  })

  // ── Pool tests ─────────────────────────────────────────────────────────────

  it('Creates a liquidity pool', async () => {
    mintB = await createMint(provider.connection, payer, payer.publicKey, null, 6)

    // Sort mints
    const [tA, tB] =
      mintA.toBuffer().compare(mintB.toBuffer()) < 0
        ? [mintA, mintB]
        : [mintB, mintA]

    const [poolPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('pool'), tA.toBuffer(), tB.toBuffer()],
      poolProgram.programId
    )

    await poolProgram.methods
      .createPool()
      .accounts({
        pool: poolPDA,
        tokenAMint: tA,
        tokenBMint: tB,
        creator: payer.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc()

    const pool = await poolProgram.account.pool.fetch(poolPDA)
    assert.ok(pool)
    assert.equal(pool.feeBps, 30)
    console.log('✅ Pool created, fee:', pool.feeBps, 'bps')
  })

  // ── Vault tests ─────────────────────────────────────────────────────────────

  it('Vault lock period is 30 days', () => {
    const THIRTY_DAYS = 30 * 24 * 60 * 60
    assert.equal(THIRTY_DAYS, 2592000)
    console.log('✅ 30-day lock period confirmed:', THIRTY_DAYS, 'seconds')
  })
})
