import Link from 'next/link'

const QUICK_ACTIONS = [
  { href: '/tokens',         label: 'Browse Tokens',    icon: '🌾', desc: 'Explore registered agricultural assets' },
  { href: '/register-token', label: 'Register Asset',   icon: '📋', desc: 'Tokenize your agricultural asset' },
  { href: '/create-pool',    label: 'Create Pool',      icon: '💧', desc: 'Launch a new liquidity pool' },
  { href: '/swap',           label: 'Swap',             icon: '🔄', desc: 'Trade agricultural tokens' },
  { href: '/vault',          label: 'Vault',            icon: '🔐', desc: 'Lock LP tokens and earn rewards' },
  { href: '/market',         label: 'Market',           icon: '📊', desc: 'View all trading pairs and prices' },
]

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center py-16 space-y-6">
        <div className="inline-flex items-center gap-2 bg-agro-900/40 border border-agro-700/40 text-agro-300 text-sm px-4 py-1.5 rounded-full">
          🌿 Running on Solana Devnet
        </div>
        <h1 className="text-5xl font-bold text-gray-100 leading-tight max-w-3xl mx-auto">
          Tokenize Agricultural
          <span className="text-agro-400"> Real-World Assets</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          AgroRWA enables farmers to issue SPL tokens backed by crops and future harvests.
          Investors trade verified tokens through a transparent, decentralized marketplace.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/tokens" className="btn-primary text-base px-6 py-3">
            Explore Tokens
          </Link>
          <Link href="/register-token" className="btn-secondary text-base px-6 py-3">
            Register Asset
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Assets Registered', value: '—' },
          { label: 'Active Pools',      value: '—' },
          { label: 'Total Liquidity',   value: '—' },
          { label: 'Network',           value: 'Devnet' },
        ].map(({ label, value }) => (
          <div key={label} className="card text-center">
            <p className="text-2xl font-bold text-agro-400">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-100 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map(({ href, label, icon, desc }) => (
            <Link
              key={href}
              href={href}
              className="card hover:border-agro-700 transition-all hover:bg-gray-800/60 group"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl">{icon}</span>
                <div>
                  <p className="font-semibold text-gray-100 group-hover:text-agro-400 transition-colors">
                    {label}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Asset categories */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-100 mb-6">Supported Asset Categories</h2>
        <div className="flex flex-wrap gap-3">
          {['Farmland', 'Grain Production', 'Livestock', 'Harvest Futures', 'Agricultural Machinery', 'Other'].map(
            (cat) => (
              <span key={cat} className="badge bg-gray-800 text-gray-300 px-3 py-1.5 text-sm border border-gray-700">
                {cat}
              </span>
            )
          )}
        </div>
      </section>
    </div>
  )
}
