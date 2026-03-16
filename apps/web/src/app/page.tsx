import Link from 'next/link'

const TOKEN_TYPES = [
  { icon: '🌾', name: 'Forward Token',  desc: 'Future harvest rights. Price anchored to Pyth spot × discount.', color: 'border-green-700/40 bg-green-900/20' },
  { icon: '🚜', name: 'Asset Token',    desc: 'Equipment, commodity, land. Backed by oracle-appraised collateral.', color: 'border-blue-700/40 bg-blue-900/20' },
  { icon: '💳', name: 'Credit Token',   desc: '10-25% APY agricultural bonds with quarterly coupon payments.', color: 'border-amber-700/40 bg-amber-900/20' },
  { icon: '📈', name: 'Revenue Token',  desc: 'Share of farm season revenue, auto-distributed on-chain.', color: 'border-purple-700/40 bg-purple-900/20' },
]

const HOW_IT_WORKS = [
  { n: '01', title: 'Emitter KYC',         desc: 'Farmer registers, submits legal documents, gets KYC approved by platform.' },
  { n: '02', title: 'Create Asset Token',   desc: 'Mint SPL token representing the asset. Set price, amount, delivery date.' },
  { n: '03', title: 'Oracle Verification',  desc: 'Certified agro-experts, notaries and lawyers sign the asset on-chain.' },
  { n: '04', title: 'List on Marketplace',  desc: 'Once verified, asset appears on marketplace with full documentation.' },
  { n: '05', title: 'Investor Buys',        desc: 'Investor reviews docs, oracle ratings, emitter history — then buys.' },
  { n: '06', title: 'Delivery & Settlement',desc: 'Oracle confirms delivery. Tokens burn. Settlement in USDC.' },
]

export default function HomePage() {
  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="text-center py-16 space-y-6">
        <div className="inline-flex items-center gap-2 bg-green-900/30 border border-green-700/40 text-green-300 text-sm px-4 py-1.5 rounded-full">
          🔗 Solana Devnet · Oracle-Verified RWA
        </div>
        <h1 className="text-5xl font-bold text-gray-100 max-w-3xl mx-auto leading-tight">
          Agricultural Assets<br/>
          <span className="text-green-400">Tokenized &amp; Verified</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Farmers issue tokens backed by real crops, equipment and land.
          Certified oracles verify every asset. Investors trade with confidence.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/marketplace" className="btn-primary text-base px-6 py-3">Browse Assets</Link>
          <Link href="/create-asset" className="btn-secondary text-base px-6 py-3">List Your Asset</Link>
          <Link href="/kyc" className="btn-secondary text-base px-6 py-3">Register as Emitter</Link>
        </div>
      </section>

      {/* Token types */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-100 mb-6 text-center">Four Types of Agricultural Tokens</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {TOKEN_TYPES.map(({ icon, name, desc, color }) => (
            <div key={name} className={`card border ${color}`}>
              <div className="text-3xl mb-3">{icon}</div>
              <h3 className="font-semibold text-gray-100 mb-2">{name}</h3>
              <p className="text-sm text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-100 mb-8 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {HOW_IT_WORKS.map(({ n, title, desc }) => (
            <div key={n} className="card flex gap-4">
              <span className="text-3xl font-bold text-green-800 flex-shrink-0">{n}</span>
              <div>
                <h3 className="font-semibold text-gray-100 mb-1">{title}</h3>
                <p className="text-sm text-gray-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust signals */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center border-green-800/40">
          <div className="text-3xl mb-2">🔍</div>
          <h3 className="font-semibold text-gray-100 mb-1">Human Oracle Network</h3>
          <p className="text-sm text-gray-400">Agro-experts, notaries and legal advisors sign every asset. Their reputation is staked on-chain.</p>
        </div>
        <div className="card text-center border-blue-800/40">
          <div className="text-3xl mb-2">🛡️</div>
          <h3 className="font-semibold text-gray-100 mb-1">Insurance Fund</h3>
          <p className="text-sm text-gray-400">1% of every trade feeds the insurance pool. Investors can claim in case of verified force majeure.</p>
        </div>
        <div className="card text-center border-amber-800/40">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="font-semibold text-gray-100 mb-1">Pyth Price Oracle</h3>
          <p className="text-sm text-gray-400">Forward token prices anchored to live Wheat, Corn and Sunflower prices from Pyth Network.</p>
        </div>
      </section>
    </div>
  )
}
