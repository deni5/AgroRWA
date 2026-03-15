export type AssetCategory =
  | 'Farmland'
  | 'GrainProduction'
  | 'Livestock'
  | 'HarvestFutures'
  | 'AgriculturalMachinery'
  | 'Other'

export interface Token {
  mint: string
  symbol: string
  name: string
  decimals: number
  logoUrl?: string
  category?: AssetCategory
  creator?: string
  description?: string
  bonusEnabled?: boolean
  rewardMint?: string
  registeredAt?: number
}

export interface Pool {
  address: string
  tokenAMint: string
  tokenBMint: string
  tokenASymbol?: string
  tokenBSymbol?: string
  reserveA: bigint
  reserveB: bigint
  lpMint: string
  lpSupply: bigint
  feeBps: number
  creator: string
  createdAt: number
}

export interface PoolWithPrice extends Pool {
  price: number
  liquidity: number
}

export interface VaultDeposit {
  address: string
  user: string
  lpMint: string
  amount: bigint
  unlockTime: number
  redeemed: boolean
  /** seconds remaining until unlock (0 if unlocked) */
  secondsRemaining: number
}

export interface SwapQuote {
  amountIn: bigint
  amountOut: bigint
  priceImpact: number
  fee: bigint
  minAmountOut: bigint
}

export type TxStatus = 'idle' | 'pending' | 'success' | 'error'

export interface TxState {
  status: TxStatus
  signature?: string
  error?: string
}
