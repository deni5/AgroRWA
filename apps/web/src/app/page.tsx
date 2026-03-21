"use client";

import Link from 'next/link';

const TOKEN_TYPES = [
  { name: 'Forward Token',  desc: 'Future harvest rights. Price anchored to Pyth spot × discount.', color: '#4ade80' },
  { name: 'Asset Token',    desc: 'Equipment, commodity, land. Backed by oracle-appraised collateral.', color: '#60a5fa' },
  { name: 'Credit Token',   desc: '10-25% APY agricultural bonds with quarterly coupon payments.', color: '#fbbf24' },
  { name: 'Revenue Token',  desc: 'Share of farm season revenue, auto-distributed on-chain.', color: '#a78bfa' },
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
    <div style={{ backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ padding: '80px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Hero Section */}
        <section style={{ textAlign: 'center', marginBottom: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={badgeStyle}>
             SOLANA MAINNET · ORACLE-VERIFIED RWA
          </div>
          <h1 style={heroTitleStyle}>
            Agricultural Assets<br />
            <span style={{ color: '#4ade80' }}>Tokenized & Verified</span>
          </h1>
          <p style={heroSubtitleStyle}>
            Institutional-grade platform for agricultural RWA. Verified by human oracles, 
            secured by Solana, powered by transparency.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/marketplace" style={btnPrimary}>Browse Marketplace</Link>
            <Link href="/create-asset" style={btnSecondary}>List Asset</Link>
          </div>
        </section>

        {/* Token Types Grid */}
        <section style={{ marginBottom: '140px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            {TOKEN_TYPES.map((t) => (
              <div key={t.name} style={cardStyle}>
                <div style={{ width: '40px', height: '2px', backgroundColor: t.color, marginBottom: '24px' }}></div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>{t.name}</h3>
                <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.6', marginBottom: '24px' }}>{t.desc}</p>
                <Link href="/marketplace" style={{ color: t.color, textDecoration: 'none', fontWeight: '600', fontSize: '13px', letterSpacing: '0.05em' }}>VIEW MARKET</Link>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works (Minimalist) */}
        <section style={{ marginBottom: '140px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '64px', textAlign: 'center' }}>Protocol Workflow</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px' }}>
            {HOW_IT_WORKS.map((step) => (
              <div key={step.n} style={{ borderLeft: '1px solid #1e293b', paddingLeft: '24px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#4ade80', display: 'block', marginBottom: '8px' }}>STEP {step.n}</span>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>{step.title}</h3>
                <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.5' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust Signals */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', borderTop: '1px solid #1e293b', paddingTop: '64px' }}>
          <div style={trustItemStyle}>
            <h4 style={trustTitleStyle}>Human Oracle Network</h4>
            <p style={trustTextStyle}>Third-party agronomists and legal experts verify physical collateral before minting.</p>
          </div>
          <div style={trustItemStyle}>
            <h4 style={trustTitleStyle}>Insurance Pool</h4>
            <p style={trustTextStyle}>On-chain stability fund covering verified production risks and force majeure.</p>
          </div>
          <div style={trustItemStyle}>
            <h4 style={trustTitleStyle}>Pyth Integration</h4>
            <p style={trustTextStyle}>Real-time commodity price feeds ensure accurate liquidation and settlement ratios.</p>
          </div>
        </section>

      </div>
    </div>
  );
}

// Styles
const badgeStyle = { backgroundColor: 'rgba(74, 222, 128, 0.05)', color: '#4ade80', padding: '10px 20px', borderRadius: '4px', fontSize: '12px', fontWeight: '700', marginBottom: '32px', border: '1px solid rgba(74, 222, 128, 0.2)', letterSpacing: '0.1em' };
const heroTitleStyle = { fontSize: '72px', fontWeight: '900', marginBottom: '24px', lineHeight: '1', letterSpacing: '-0.04em' };
const heroSubtitleStyle = { fontSize: '20px', color: '#94a3b8', maxWidth: '600px', margin: '0 auto 48px', lineHeight: '1.6' };
const btnPrimary = { backgroundColor: '#4ade80', color: '#020617', padding: '18px 36px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '15px' };
const btnSecondary = { backgroundColor: 'transparent', color: '#f8fafc', padding: '18px 36px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', border: '1px solid #334155', fontSize: '15px' };
const cardStyle = { padding: '48px 32px', backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '4px' };
const trustItemStyle = { textAlign: 'left' as const };
const trustTitleStyle = { fontSize: '16px', fontWeight: '700', marginBottom: '12px', color: '#f8fafc' };
const trustTextStyle = { fontSize: '14px', color: '#6b7280', lineHeight: '1.6' };
