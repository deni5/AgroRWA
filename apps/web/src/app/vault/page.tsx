'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useVaultDeposits, useDepositLp, useRedeemLp } from '@/hooks/useVault'
import { usePools } from '@/hooks/usePools'
import { TxStatus } from '@/components/TxStatus'
import { TxState, VaultDeposit } from '@/types'

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
      const sig = await depositLp({
        lpMint: selectedLpMint,
        amount: BigInt(Math.floor(parseFloat(depositAmount) * 1e6)),
      })
      setTx({ status: 'success', signature: sig })
      setDepositAmount('')
    } catch (err: any) {
      setTx({ status: 'error', error: err.message })
    }
  }

  const handleRedeem = async (deposit: VaultDeposit) => {
    setTx({ status: 'pending' })
    try {
      const sig = await redeemLp({ deposit })
      setTx({ status: 'success', signature: sig })
    } catch (err: any) {
      setTx({ status: 'error', error: err.message })
    }
  }

  if (!publicKey) {
    return (
      <div className="max-w-lg mx-auto card text-center py-16 space-y-4">
        <p className="text-gray-400">Connect your wallet to use the vault.</p>
        <WalletMultiButton />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-100">LP Vault</h1>
        <p className="text-gray-400 mt-1">
          Lock LP tokens for 30 days and receive receipt tokens.
        </p>
      </div>

      {/* Deposit form */}
      <form onSubmit={handleDeposit} className="card space-y-4">
        <h2 className="text-lg font-semibold text-gray-100">Deposit LP Tokens</h2>

        <div>
          <label className="label">Select LP Token (Pool)</label>
          <select
            className="input"
            value={selectedLpMint}
            onChange={(e) => setSelectedLpMint(e.target.value)}
            required
          >
            <option value="">— choose a pool —</option>
            {pools?.map((p) => (
              <option key={p.lpMint} value={p.lpMint}>
                {p.tokenAMint.slice(0, 4)}…/{p.tokenBMint.slice(0, 4)}… LP
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Amount</label>
          <input
            className="input"
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
          className="btn-primary w-full py-3"
          disabled={depositing || !selectedLpMint || !depositAmount}
        >
          {depositing ? 'Depositing…' : 'Deposit & Lock'}
        </button>
      </form>

      {/* Active deposits */}
      <div>
        <h2 className="text-xl font-semibold text-gray-100 mb-4">Your Deposits</h2>

        {isLoading && (
          <div className="space-y-3 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card h-20 bg-gray-800" />
            ))}
          </div>
        )}

        {!isLoading && !deposits?.length && (
          <div className="card text-center py-8 text-gray-500">
            No active vault deposits.
          </div>
        )}

        {deposits?.map((deposit) => {
          const locked = deposit.secondsRemaining > 0
          const redeemed = deposit.redeemed

          return (
            <div key={deposit.address} className="card flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="font-medium text-gray-100">
                  {(Number(deposit.amount) / 1e6).toFixed(6)} LP
                </p>
                <p className="text-xs font-mono text-gray-500 mt-0.5">
                  {deposit.lpMint.slice(0, 8)}…
                </p>
              </div>

              <div className="text-sm text-center">
                {redeemed ? (
                  <span className="text-gray-500">Redeemed</span>
                ) : locked ? (
                  <span className="text-yellow-400">🔒 {formatCountdown(deposit.secondsRemaining)}</span>
                ) : (
                  <span className="text-agro-400">✅ Ready to redeem</span>
                )}
              </div>

              <button
                onClick={() => handleRedeem(deposit)}
                disabled={locked || redeemed || redeeming}
                className="btn-primary text-sm py-1.5 px-4 disabled:opacity-40"
              >
                {redeeming ? 'Redeeming…' : 'Redeem'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
