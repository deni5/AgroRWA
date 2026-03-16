'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useState } from 'react'
import { TxStatus } from '@/components/TxStatus'
import type { TxState } from '@/types'

export default function InsurancePage() {
  const { publicKey } = useWallet()
  const [claimForm, setClaimForm] = useState({ assetMint: '', amount: '', reason: 'NonDelivery', evidence: '' })
  const [tx, setTx] = useState<TxState>({ status: 'idle' })

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-100">Insurance Fund</h1>
        <p className="text-gray-400 mt-1">Protection for investors through a transparent on-chain fund.</p>
      </div>

      {/* Fund stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-400">—</p>
          <p className="text-sm text-gray-500 mt-1">Fund Balance (USDC)</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-blue-400">—</p>
          <p className="text-sm text-gray-500 mt-1">Total Paid Out</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-amber-400">—</p>
          <p className="text-sm text-gray-500 mt-1">Active Claims</p>
        </div>
      </div>

      {/* How the fund works */}
      <div className="card space-y-3">
        <h2 className="font-semibold text-gray-100">How the Insurance Fund Works</h2>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="bg-gray-800/60 rounded-lg p-3">
            <p className="font-medium text-green-400 mb-1">Sources</p>
            <p className="text-gray-400">0.5% of every trade + 20% of oracle fees</p>
          </div>
          <div className="bg-gray-800/60 rounded-lg p-3">
            <p className="font-medium text-blue-400 mb-1">Coverage</p>
            <p className="text-gray-400">Force majeure, emitter fraud, quality mismatch, non-delivery</p>
          </div>
          <div className="bg-gray-800/60 rounded-lg p-3">
            <p className="font-medium text-amber-400 mb-1">Max Payout</p>
            <p className="text-gray-400">Up to 80% of claim amount, subject to fund balance</p>
          </div>
        </div>
      </div>

      {/* Claim form */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-100">Submit a Claim</h2>

        {!publicKey ? (
          <div className="text-center py-6 space-y-3">
            <p className="text-gray-400 text-sm">Connect wallet to submit a claim.</p>
            <WalletMultiButton />
          </div>
        ) : (
          <>
            <div>
              <label className="label">Asset Mint Address *</label>
              <input className="input font-mono text-sm" placeholder="Asset mint pubkey"
                value={claimForm.assetMint}
                onChange={(e) => setClaimForm(p => ({ ...p, assetMint: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Claim Amount (USDC) *</label>
                <input className="input" type="number" min="1" placeholder="1000"
                  value={claimForm.amount}
                  onChange={(e) => setClaimForm(p => ({ ...p, amount: e.target.value }))} />
              </div>
              <div>
                <label className="label">Reason *</label>
                <select className="input" value={claimForm.reason}
                  onChange={(e) => setClaimForm(p => ({ ...p, reason: e.target.value }))}>
                  <option value="NonDelivery">Non-Delivery</option>
                  <option value="QualityMismatch">Quality Mismatch</option>
                  <option value="EmitterFraud">Emitter Fraud</option>
                  <option value="ForceMajeure">Force Majeure</option>
                  <option value="OracleMisconduct">Oracle Misconduct</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">Evidence (IPFS hash) *</label>
              <input className="input font-mono text-sm" placeholder="QmXxx... — photos, reports, correspondence"
                value={claimForm.evidence}
                onChange={(e) => setClaimForm(p => ({ ...p, evidence: e.target.value }))} />
            </div>

            <TxStatus tx={tx} />

            <button className="btn-primary w-full py-3"
              onClick={() => setTx({ status: 'error', error: 'Deploy contracts first to enable claims' })}>
              Submit Claim
            </button>
          </>
        )}
      </div>

      {/* Claims history */}
      <div className="card">
        <h2 className="font-semibold text-gray-100 mb-4">Your Claims</h2>
        <div className="text-center py-8 text-gray-500 text-sm">No claims submitted.</div>
      </div>
    </div>
  )
}
