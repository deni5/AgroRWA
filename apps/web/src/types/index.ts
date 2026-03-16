// ─── Token types ──────────────────────────────────────────────────────────────

export type TokenType = 'Forward' | 'Asset' | 'Credit' | 'Revenue'

export type AssetCategory =
  | 'Grain' | 'Oilseeds' | 'Livestock'
  | 'Land' | 'Equipment' | 'Storage' | 'Other'

export type LifecycleStatus =
  | 'Pending' | 'Verified' | 'Listed' | 'PartialSold'
  | 'FullySold' | 'Delivered' | 'Settled'
  | 'Disputed' | 'Frozen' | 'Cancelled'

export type PaymentCurrency = 'USDC' | 'USDT' | 'SOL'

export type KycStatus = 'Pending' | 'Approved' | 'Rejected' | 'Suspended'

export type OracleRole = 'AgroExpert' | 'Notary' | 'LegalAdvisor' | 'Auditor'

export type ListingType = 'Primary' | 'Secondary'

export type ListingStatus = 'Active' | 'Filled' | 'Cancelled' | 'Expired'

// ─── On-chain account types ───────────────────────────────────────────────────

export interface EmitterProfile {
  address: string
  wallet: string
  legalName: string
  edrpou: string
  country: string
  region: string
  docsIpfs: string[]
  kycStatus: KycStatus
  kycReviewer?: string
  kycReviewedAt?: number
  ratingScore: number        // 0-1000
  ratingLabel: string        // AAA, AA, A, B, C
  depositBps: number         // required deposit in bps
  totalIssued: number
  totalFulfilled: number
  totalDefaults: number
  registeredAt: number
}

export interface OracleProfile {
  address: string
  wallet: string
  name: string
  role: OracleRole
  credentialsIpfs: string
  stakeAmount: bigint
  isActive: boolean
  reputationScore: number    // 0-1000
  verifiedCount: number
  disputeCount: number
  registeredAt: number
}

export interface AssetRecord {
  address: string
  mint: string
  emitter: string
  tokenType: TokenType
  title: string
  description: string
  category: AssetCategory
  locationGps: string
  characteristics: Record<string, string>
  totalSupply: bigint
  unit: string
  pricePerUnit: bigint       // USDC 6 decimals
  currency: PaymentCurrency
  deliveryDate: number
  docsIpfs: string[]
  lifecycleStatus: LifecycleStatus
  verificationCount: number
  requiredVerifications: number
  createdAt: number
}

export interface Listing {
  address: string
  assetMint: string
  emitter: string
  escrowVault: string
  amount: bigint
  amountRemaining: bigint
  pricePerUnit: bigint
  currency: PaymentCurrency
  minLot: bigint
  listingType: ListingType
  status: ListingStatus
  createdAt: number
  expiresAt?: number
  // enriched
  asset?: AssetRecord
  emitterProfile?: EmitterProfile
}

export interface TradeRecord {
  address: string
  listing: string
  assetMint: string
  seller: string
  buyer: string
  amount: bigint
  pricePerUnit: bigint
  totalPayment: bigint
  platformFee: bigint
  insuranceFee: bigint
  oracleFee: bigint
  tradedAt: number
}

export interface VerifyRequest {
  address: string
  assetMint: string
  emitter: string
  oracle: string
  status: 'Requested' | 'Signed' | 'Rejected'
  verdict?: 'Approved' | 'Rejected' | 'ConditionallyApproved'
  oracleReportIpfs: string
  requestedAt: number
  signedAt?: number
}

export interface InsuranceFund {
  totalBalance: bigint
  totalPaidOut: bigint
  activeClaims: number
}

// ─── UI types ─────────────────────────────────────────────────────────────────

export type TxStatus = 'idle' | 'pending' | 'success' | 'error'

export interface TxState {
  status: TxStatus
  signature?: string
  error?: string
}

export interface PythPrice {
  price: number
  confidence: number
  publishTime: number
  symbol: string
}

// ─── Pyth feed IDs (devnet) ───────────────────────────────────────────────────

export const PYTH_FEEDS = {
  'WHEAT/USD':  '0xc2b4290b5f7f87710a2a8c4cff2f257da13c33c6d7d42e8b22cec6faa74df46f',
  'CORN/USD':   '0xc9d8b075a5c69303365ae23633d4e085199bf5c520a3b90fed1322a0342ffc33',
  'SOL/USD':    '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
  'USDC/USD':   '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
} as const
