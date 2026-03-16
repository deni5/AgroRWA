'use client'

import { useQuery } from '@tanstack/react-query'
import { Connection } from '@solana/web3.js'
import { PythHttpClient, getPythClusterApiUrl, getPythProgramKeyForCluster } from '@pythnetwork/client'
import { SOLANA_RPC, connection } from '@/lib/solana'
import { PythPrice, PYTH_FEEDS } from '@/types'

const PYTH_CLUSTER = 'devnet'

export function usePythPrice(symbol: keyof typeof PYTH_FEEDS) {
  return useQuery<PythPrice | null>({
    queryKey: ['pyth', symbol],
    queryFn: async () => {
      try {
        const pythConn = new Connection(getPythClusterApiUrl(PYTH_CLUSTER))
        const pythClient = new PythHttpClient(pythConn, getPythProgramKeyForCluster(PYTH_CLUSTER))
        const data = await pythClient.getData()

        const product = data.products.find(
          (p) => p.symbol === symbol || p['generic_symbol'] === symbol.split('/')[0]
        )
        if (!product) return null

        const priceObj = data.productPrice.get(product.symbol)
        if (!priceObj?.price || !priceObj.confidence) return null

        return {
          price: priceObj.price,
          confidence: priceObj.confidence,
          publishTime: priceObj.validSlot ?? 0,
          symbol,
        }
      } catch {
        // Fallback mock prices for devnet testing
        const mockPrices: Record<string, number> = {
          'WHEAT/USD': 215.50,
          'CORN/USD':  175.30,
          'SOL/USD':   145.00,
          'USDC/USD':  1.00,
        }
        return {
          price: mockPrices[symbol] ?? 0,
          confidence: 0.5,
          publishTime: Date.now() / 1000,
          symbol,
        }
      }
    },
    staleTime: 10_000,
    refetchInterval: 30_000,
  })
}

export function useAllPrices() {
  const wheat = usePythPrice('WHEAT/USD')
  const corn  = usePythPrice('CORN/USD')
  const sol   = usePythPrice('SOL/USD')
  return { wheat, corn, sol }
}

/** Calculate forward token fair price with discount */
export function calcForwardPrice(
  spotPrice: number,
  daysToDelivery: number,
  emitterRatingScore: number
): number {
  // Discount: 5% base + 0.05% per day + risk premium based on rating
  const riskPremium = emitterRatingScore >= 700 ? 0 : emitterRatingScore >= 500 ? 0.03 : 0.08
  const timeDiscount = (daysToDelivery / 365) * 0.05
  const totalDiscount = 0.05 + timeDiscount + riskPremium
  return spotPrice * (1 - totalDiscount)
}
