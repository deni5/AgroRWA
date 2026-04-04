/**
 * Admin KYC Approve script
 * Запуск: node approve_kyc.js
 */

const {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  clusterApiUrl,
} = require('@solana/web3.js')
const fs = require('fs')
const os = require('os')
const { createHash } = require('crypto')

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')

// Адмін wallet (основний)
const secretKey = JSON.parse(fs.readFileSync(`${os.homedir()}/.config/solana/id.json`))
const admin = Keypair.fromSecretKey(Uint8Array.from(secretKey))

const IDENTITY_PROGRAM_ID = new PublicKey('Ht3HSrZqmja6tePjE1xipHuSPGBpv6JATktSSxacy5Mn')
const EMITTER_WALLET = new PublicKey('xBJwibCHjcX7SjJ2RQ1yaaanDiXxzgEQDdzWK4HJGP9')

// PDA для emitter profile
const [emitterPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from('emitter'), EMITTER_WALLET.toBuffer()],
  IDENTITY_PROGRAM_ID
)

// Discriminator для review_kyc
function discriminator(name) {
  return createHash('sha256').update(`global:${name}`).digest().slice(0, 8)
}

function encodeString(s) {
  const bytes = Buffer.from(s, 'utf-8')
  const len = Buffer.alloc(4)
  len.writeUInt32LE(bytes.length, 0)
  return Buffer.concat([len, bytes])
}

async function approveKyc() {
  console.log('🔑 Admin:', admin.publicKey.toBase58())
  console.log('👤 Emitter wallet:', EMITTER_WALLET.toBase58())
  console.log('📋 Emitter PDA:', emitterPDA.toBase58())

  const disc = discriminator('review_kyc')

  // approved = true (1 byte), note = "Approved by admin"
  const approvedBuf = Buffer.alloc(1)
  approvedBuf.writeUInt8(1, 0) // true

  const data = Buffer.concat([
    disc,
    approvedBuf,
    encodeString('Approved by AgroRWA admin'),
  ])

  const ix = new TransactionInstruction({
    programId: IDENTITY_PROGRAM_ID,
    keys: [
      { pubkey: emitterPDA,        isSigner: false, isWritable: true },
      { pubkey: admin.publicKey,   isSigner: true,  isWritable: false },
    ],
    data,
  })

  const tx = new Transaction().add(ix)
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
  tx.recentBlockhash = blockhash
  tx.feePayer = admin.publicKey
  tx.sign(admin)

  const sig = await connection.sendRawTransaction(tx.serialize())
  await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight })

  console.log('✅ KYC Approved!')
  console.log(`   TX: https://explorer.solana.com/tx/${sig}?cluster=devnet`)
}

approveKyc().catch(e => console.error('❌', e.message))
