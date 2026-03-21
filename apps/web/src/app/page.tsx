import Link from 'next/link';

const TOKEN_TYPES = [
  { icon: '🌾', name: 'Forward Token',  desc: 'Future harvest rights. Price anchored to Pyth spot × discount.', color: '#1a4328', bgColor: '#f0fdf4' },
  { icon: '🚜', name: 'Asset Token',    desc: 'Equipment, commodity, land. Backed by oracle-appraised collateral.', color: '#1e3a8a', bgColor: '#eff6ff' },
  { icon: '💳', name: 'Credit Token',   desc: '10-25% APY agricultural bonds with quarterly coupon payments.', color: '#92400e', bgColor: '#fffbeb' },
  { icon: '📈', name: 'Revenue Token',  desc: 'Share of farm season revenue, auto-distributed on-chain.', color: '#581c87', bgColor: '#faf5ff' },
];

const HOW_IT_WORKS = [
  { n: '01', title: 'Emitter KYC', desc: 'Farmer registers, submits documents, gets approved.' },
  { n: '02', title: 'Create Asset', desc: 'Mint SPL token representing the real-world asset.' },
  { n: '03', title: 'Verification', desc: 'Certified oracles and lawyers sign the asset on-chain.' },
  { n: '04', title: 'Marketplace', desc: 'Asset appears for sale with full documentation.' },
  { n: '05', title: 'Investor Buys', desc: 'Review docs, ratings, history — then invest.' },
  { n: '06', title: 'Settlement', desc: 'Oracle confirms delivery. Tokens burn for USDC.' },
];

export default function HomePage() {
  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif', color: '#1a4328' }}>
      
      {/* Hero Section */}
      <section style={{ textAlign: 'center', marginBottom: '80px', padding: '60px 20px', backgroundColor: '#f0f7f4', borderRadius: '32px' }}>
        <div style={{ display: 'inline-block', padding: '6px 16px', backgroundColor: '#dcfce7', borderRadius: '20px', fontSize: '14px', fontWeight: '600', marginBottom: '24px', border: '1px solid #bbf7d0' }}>
          🔗 Solana Devnet · Oracle-Verified RWA
        </div>
        <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '24px', lineHeight: '1.1', color: '#1a4328' }}>
          Agricultural Assets<br />
          <span style={{ color: '#22c55e' }}>Tokenized & Verified</span>
        </h1>
        <p style={{ fontSize: '19px', color: '#4b5563', maxWidth: '700px', margin: '0 auto 40px', lineHeight: '1.6' }}>
          Farmers issue tokens backed by real crops, equipment and land. Certified oracles verify every asset. Investors trade with confidence.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/marketplace" style={btnPrimary}>Browse Assets</Link>
          <Link href="/create-asset" style={btnSecondary}>List Your Asset</Link>
          <Link href="/kyc" style={btnSecondary}>Register as Emitter</Link>
        </div>
      </section>

      {/* Token Types Grid */}
      <section style={{ marginBottom: '100px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px', textAlign: 'center' }}>Four Types of Agricultural Tokens</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {TOKEN_TYPES.map((t) => (
            <div key={t.name} style={{ padding: '32px', borderRadius: '24px', backgroundColor: '#ffffff', border: `1px solid ${t.bgColor}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>{t.icon}</div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px', color: t.color }}>{t.name}</h3>
              <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: '1.5' }}>{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works List */}
      <section style={{ marginBottom: '100px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '40px', textAlign: 'center' }}>How It Works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          {HOW_IT_WORKS.map((step) => (
            <div key={step.n} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '32px', fontWeight: '900', color: '#dcfce7' }}>{step.n}</span>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>{step.title}</h3>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Signals */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        <div style={trustCard}><div style={{fontSize:'30px'}}>🔍</div><h4 style={trustTitle}>Human Oracle Network</h4><p style={trustText}>Agro-experts and legal advisors sign every asset on-chain.</p></div>
        <div style={trustCard}><div style={{fontSize:'30px'}}>🛡️</div><h4 style={trustTitle}>Insurance Fund</h4><p style={trustText}>1% of trades feed the pool to cover verified force majeure.</p></div>
        <div style={trustCard}><div style={{fontSize:'30px'}}>📊</div><h4 style={trustTitle}>Pyth Price Oracle</h4><p style={trustText}>Real-time price feeds for Wheat, Corn and Sunflower.</p></div>
      </section>
    </div>
  );
}

// Button & Card Styles
const btnPrimary = { backgroundColor: '#166534', color: '#fff', padding: '14px 28px', borderRadius: '14px', fontWeight: '600', textDecoration: 'none' };
const btnSecondary = { backgroundColor: '#fff', color: '#166534', padding: '14px 28px', borderRadius: '14px', fontWeight: '600', textDecoration: 'none', border: '1px solid #dcfce7' };
const trustCard = { padding: '30px', borderRadius: '24px', border: '1px solid #f3f4f6', textAlign: 'center' as const };
const trustTitle = { fontSize: '17px', fontWeight: '700', margin: '12px 0 8px' };
const trustText = { fontSize: '14px', color: '#6b7280', lineHeight: '1.4' };
