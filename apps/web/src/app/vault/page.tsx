'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useVaultDeposits, useDepositLp, useRedeemLp } from '@/hooks/useVault'
import { usePools } from '@/hooks/usePools'
import { TxStatus } from '@/components/TxStatus'
import { TxState } from '@/types'

// Допоміжна функція для відліку часу
function formatCountdown(seconds: number) {
  if (seconds <= 0) return 'Unlocked'
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (d > 0) return `${d}d ${h}h remaining`
  if (h > 0) return `${h}h ${m}m remaining`
  return `${m}m remaining`
}

export default function VaultPage() {
  const { publicKey } = useWallet()
  
  // Отримуємо дані. Вказуємо початкове значення як порожній масив.
  const { data: deposits, isLoading } = useVaultDeposits()
  const { data: pools } = usePools()
  
  const { mutateAsync: depositLp, isPending: depositing } = useDepositLp()
  const { mutateAsync: redeemLp, isPending: redeeming } = useRedeemLp()

  const [selectedLpMint, setSelectedLpMint] = useState('')
  const [depositAmount, setDepositAmount] = useState('')
  const [tx, setTx] = useState<TxState>({ status: 'idle' })

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTx({ status: 'pending' })
    try {
      const amountRaw = Math.floor(parseFloat(depositAmount) * 1e6)
      const sig = await depositLp({
        lpMint: selectedLpMint,
        amount: BigInt(amountRaw),
      })
      setTx({ status: 'success', signature: sig })
      setDepositAmount('')
    } catch (err: any) {
      console.error(err)
      setTx({ status: 'error', error: err.message })
    }
  }

  const handleRedeem = async (deposit: any) => {
    setTx({ status: 'pending' })
    try {
      const sig = await redeemLp({ deposit })
      setTx({ status: 'success', signature: sig })
    } catch (err: any) {
      console.error(err)
      setTx({ status: 'error', error: err.message })
    }
  }

  if (!publicKey) {
    return (
      <div className="max-w-lg mx-auto card text-center py-16 space-y-4">
        <p className="text-gray-400">Connect your wallet to use the vault.</p>
        <div className="flex justify-center">
          <WalletMultiButton />
        </div>
      </div>
    )
  }

  // Визначаємо, чи маємо ми масив для безпечної перевірки довжини
  const hasDeposits = Array.isArray(deposits) && deposits.length > 0;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-100">LP Vault</h1>
        <p className="text-gray-400 mt-1">
          Lock LP tokens for 30 days and receive receipt tokens.
        </p>
      </div>

      <form onSubmit={handleDeposit} className="card space-y-4 bg-gray-900/50 p-6 rounded-xl border border-gray-800">
        <h2 className="text-lg font-semibold text-gray-100">Deposit LP Tokens</h2>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Select LP Token (Pool)</label>
          <select
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 focus:ring-2 focus:ring-agro-500 outline-none"
            value={selectedLpMint}
            onChange={(e) => setSelectedLpMint(e.target.value)}
            required
          >
            <option value="">— choose a pool —</option>
            {Array.isArray(pools) && pools.map((p: any) => (
              <option key={p.lpMint} value={p.lpMint}>
                {p.tokenAMint.slice(0, 4)}…/{p.tokenBMint.slice(0, 4)}… LP
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Amount</label>
          <input
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 focus:ring-2 focus:ring-agro-500 outline-none"
            type="number"
            min="0"
            step="0.000001"
            placeholder="0.00"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            required
          />
        </div>

        <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg px-4 py-3 text-sm text-yellow-300">
          🔒 LP tokens will be locked for <strong>30 days</strong>. You will receive receipt tokens 1:1 that you can redeem after the lock period.
        </div>

        <TxStatus tx={tx} />

        <button
          type="submit"
          className="w-full bg-agro-600 hover:bg-agro-500 disabled:bg-gray-700 text-white font-bold py-3 rounded-lg transition-colors"
          disabled={depositing || !selectedLpMint || !depositAmount}
        >
          {depositing ? 'Depositing…' : 'Deposit & Lock'}
        </button>
      </form>

      <div>
        <h2 className="text-xl font-semibold text-gray-100 mb-4">Your Deposits</h2>

        {isLoading && (
          <div className="space-y-3 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card h-20 bg-gray-800/50 rounded-lg" />
            ))}
          </div>
        )}

        {/* Безпечна перевірка: не завантажується і депозитів точно немає (або не масив) */}
        {!isLoading && !hasDeposits && (
          <div className="card text-center py-12 bg-gray-900/30 border border-dashed border-gray-800 rounded-xl text-gray-500">
            No active vault deposits.
          </div>
        )}

        <div className="space-y-3">
          {hasDeposits && deposits.map((deposit: any) => {
            const locked = deposit.secondsRemaining > 0
            const redeemed = deposit.redeemed

            return (
              <div key={deposit.address} className="card bg-gray-900/40 border border-gray-800 p-4 flex items-center justify-between flex-wrap gap-3 rounded-lg">
                <div>
                  <p className="font-medium text-gray-100">
                    {(Number(deposit.amount) / 1e6).toFixed(6)} LP
                  </p>
                  <p className="text-xs font-mono text-gray-500 mt-0.5">
                    {deposit.lpMint.slice(0, 8)}…
                  </p>
                </div>

                <div className="text-sm">
                  {redeemed ? (
                    <span className="text-gray-500">Redeemed</span>
                  ) : locked ? (
                    <span className="text-yellow-400 font-medium">🔒 {formatCountdown(deposit.secondsRemaining)}</span>
                  ) : (
                    <span className="text-green-400 font-medium">✅ Ready to redeem</span>
                  )}
                </div>

                <button
                  onClick={() => handleRedeem(deposit)}
                  disabled={locked || redeemed || redeeming}
                  className="bg-agro-600 hover:bg-agro-500 disabled:opacity-30 disabled:hover:bg-agro-600 text-white text-sm py-1.5 px-6 rounded-md transition-all"
                >
                  {redeeming ? 'Redeeming…' : 'Redeem'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
