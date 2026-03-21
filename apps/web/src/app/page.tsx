"use client";

import Link from 'next/link'; 

const TOKEN_TYPES = [
  { icon: '', name: 'Forward Token',  desc: 'Future harvest rights. Price anchored to Pyth spot × discount.', color: '#4ade80' },
  { icon: '', name: 'Asset Token',    desc: 'Equipment, commodity, land. Backed by oracle-appraised collateral.', color: '#60a5fa' },
  { icon: '', name: 'Credit Token',   desc: '10-25% APY agricultural bonds with quarterly coupon payments.', color: '#fbbf24' },
  { icon: '', name: 'Revenue Token',  desc: 'Share of farm season revenue, auto-distributed on-chain.', color: '#a78bfa' },
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
    <div style={{ backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc', fontFamily: 'sans-serif' }}>
      <div style={{ padding: '60px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Hero Section */}
        <section style={{ textAlign: 'center', marginBottom: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ 
            backgroundColor: 'rgba(74, 222, 128, 0.1)', 
            color: '#4ade80', 
            padding: '8px 20px', 
            borderRadius: '100px', 
            fontSize: '14px', 
            fontWeight: '600', 
            marginBottom: '32px', 
            border: '1px solid rgba(74, 222, 128, 0.2)' 
          }}>
             Solana Devnet · Oracle-Verified RWA
          </div>
          <h1 style={{ fontSize: '64px', fontWeight: '800', marginBottom: '24px', lineHeight: '1.1', letterSpacing: '-0.02em' }}>
            Agricultural Assets<br />
            <span style={{ color: '#4ade80' }}>Tokenized & Verified</span>
          </h1>
          <p style={{ fontSize: '20px', color: '#94a3b8', maxWidth: '750px', margin: '0 auto 48px', lineHeight: '1.6' }}>
            Farmers issue tokens backed by real crops, equipment and land. Certified oracles verify every asset. Investors trade with confidence.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/marketplace" style={btnPrimary}>Browse Assets</Link>
            <Link href="/create-asset" style={btnSecondary}>List Your Asset</Link>
            <Link href="/kyc" style={btnSecondary}>Register as Emitter</Link>
          </div>
        </section>

        {/* Token Types Grid */}
        <section style={{ marginBottom: '120px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '48px', textAlign: 'center' }}>Four Types of Agricultural Tokens</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            {TOKEN_TYPES.map((t) => (
              <div key={t.name} style={{ 
                padding: '40px', 
                borderRadius: '28px', 
                backgroundColor: '#0f172a', 
                border: `1px solid rgba(255,255,255,0.05)`,
                transition: 'transform 0.2s'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '24px' }}>{t.icon}</div>
                <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '12px', color: t.color }}>{t.name}</h3>
                <p style={{ fontSize: '15px', color: '#94a3b8', lineHeight: '1.6' }}>{t.desc}</p>
                <Link href="/marketplace" style={{ color: t.color, textDecoration: 'none', display: 'block', marginTop: '20px', fontWeight: '600', fontSize: '14px' }}>Explore Markets →</Link>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section style={{ marginBottom: '120px', backgroundColor: '#0f172a', padding: '60px', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '60px', textAlign: 'center' }}>How It Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
            {HOW_IT_WORKS.map((step) => (
              <div key={step.n} style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '36px', fontWeight: '900', color: 'rgba(74, 222, 128, 0.2)', lineHeight: '1' }}>{step.n}</span>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#f8fafc' }}>{step.title}</h3>
                  <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.5' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Trust Signals */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <div style={trustCard}><div style={{fontSize:'32px'}}>🔍</div><h4 style={trustTitle}>Human Oracle Network</h4><p style={trustText}>Agro-experts and legal advisors sign every asset on-chain.</p></div>
          <div style={trustCard}><div style={{fontSize:'32px'}}>🛡️</div><h4 style={trustTitle}>Insurance Fund</h4><p style={trustText}>1% of trades feed the pool to cover verified force majeure.</p></div>
          <div style={trustCard}><div style={{fontSize:'32px'}}>📊</div><h4 style={trustTitle}>Pyth Price Oracle</h4><p style={trustText}>Real-time price feeds for Wheat, Corn and Sunflower.</p></div>
        </section>

      </div>
    </div>
  );
}

// Styles
const btnPrimary = { backgroundColor: '#4ade80', color: '#020617', padding: '16px 32px', borderRadius: '16px', fontWeight: '700', textDecoration: 'none', fontSize: '16px' };
const btnSecondary = { backgroundColor: 'rgba(30, 41, 59, 0.5)', color: '#f8fafc', padding: '16px 32px', borderRadius: '16px', fontWeight: '600', textDecoration: 'none', border: '1px solid #334155', fontSize: '16px' };
const trustCard = { padding: '40px', borderRadius: '32px', backgroundColor: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' as const };
const trustTitle = { fontSize: '18px', fontWeight: '700', margin: '16px 0 10px', color: '#f8fafc' };
const trustText = { fontSize: '14px', color: '#94a3b8', lineHeight: '1.5' };
