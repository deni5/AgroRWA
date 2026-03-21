'use client'

import { useState, useMemo } from 'react'
// Додайте ваші імпорти для хуків свапу тут

export default function SwapPage() {
  const [amountIn, setAmountIn] = useState('')

  // ВИПРАВЛЕНО: Замість 0n використовуємо BigInt(0)
  const amountInBig = useMemo(() => {
    const n = parseFloat(amountIn)
    if (!n || n <= 0) return BigInt(0) // Замінено 0n на BigInt(0)
    
    // Використовуємо Math.floor, щоб уникнути дробів перед перетворенням у BigInt
    return BigInt(Math.floor(n * 1e6))
  }, [amountIn])

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-100">Swap Assets</h1>
        <p className="text-gray-400 text-sm">Convert between stablecoins and agro-tokens</p>
      </div>

      <div className="card space-y-4">
        <div>
          <label className="label text-xs uppercase tracking-wider">You Pay</label>
          <div className="flex gap-2">
            <input
              type="number"
              className="input text-lg font-medium"
              placeholder="0.00"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
            />
            <div className="bg-gray-700 px-4 py-2 rounded-lg flex items-center font-bold">
              USDC
            </div>
          </div>
        </div>

        <div className="flex justify-center -my-2 relative z-10">
          <button className="bg-gray-800 border border-gray-700 p-2 rounded-full hover:bg-gray-700 transition-colors">
            ↓
          </button>
        </div>

        <div>
          <label className="label text-xs uppercase tracking-wider">You Receive</label>
          <div className="flex gap-2">
            <input
              type="text"
              className="input text-lg font-medium bg-gray-800/50"
              placeholder="0.00"
              readOnly
              value={(Number(amountInBig) / 1e6).toFixed(2)}
            />
            <div className="bg-agro-600 px-4 py-2 rounded-lg flex items-center font-bold">
              CROW
            </div>
          </div>
        </div>

        <button 
          className="btn-primary w-full py-4 text-lg font-bold shadow-lg shadow-green-900/20"
          onClick={() => console.log('Swapping:', amountInBig.toString())}
        >
          Swap Now
        </button>
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          Exchange rate: 1 USDC ≈ 1 CROW
        </p>
      </div>
    </div>
  )
}
