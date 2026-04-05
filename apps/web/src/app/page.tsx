"use client";
import Link from 'next/link';

const FEATURES = [
  { icon: '🌾', title: 'Forward Tokens', desc: 'Tokenize future harvests with Pyth price feeds' },
  { icon: '🔍', title: 'Oracle Verified', desc: 'Every asset verified by certified human oracles' },
  { icon: '🛡️', title: 'Insurance Fund', desc: '0.6% of every trade goes to investor protection' },
  { icon: '⚡', title: 'Solana Speed', desc: 'Sub-second settlement, near-zero fees on Solana' },
]

const STATS = [
  { value: '5', label: 'Smart Contracts' },
  { value: '4', label: 'Token Types' },
  { value: '0.6%', label: 'Insurance Rate' },
  { value: 'Devnet', label: 'Network' },
]

export default function HomePage() {
  return (
    <div style={{
      backgroundColor: '#eaf5eb',
      minHeight: '100vh',
      fontFamily: "'Inter', -apple-system, sans-serif",
      color: '#1a4328',
    }}>
      {/* Hero */}
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 24px 60px' }}>

        {/* Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <span style={{
            background: '#d8f3dc',
            color: '#2d6a4f',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            border: '1px solid rgba(45,106,79,0.15)',
          }}>
            ✦ Solana Devnet · Live
          </span>
        </div>

        {/* Heading */}
        <h1 style={{
          fontSize: 'clamp(40px, 6vw, 72px)',
          fontWeight: '700',
          lineHeight: '1.1',
          textAlign: 'center',
          letterSpacing: '-0.03em',
          marginBottom: '20px',
          fontFamily: "'Inter', sans-serif",
          color: '#1a4328',
        }}>
          Agricultural Assets<br />
          <span style={{ color: '#52b788' }}>Tokenized & Verified</span>
        </h1>

        <p style={{
          textAlign: 'center',
          fontSize: '18px',
          color: '#5a8a6a',
          marginBottom: '48px',
          lineHeight: '1.6',
          maxWidth: '540px',
          margin: '0 auto 48px',
        }}>
          Farmers issue tokens backed by real crops, equipment and land.
          Certified oracles verify every asset. Investors trade with confidence.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/marketplace" style={{
            background: '#1a4328',
            color: '#fff',
            padding: '16px 32px',
            borderRadius: '14px',
            fontWeight: '600',
            textDecoration: 'none',
            fontSize: '15px',
            transition: 'all 0.2s',
            display: 'inline-block',
          }}>
            Browse Marketplace
          </Link>
          <Link href="/create-asset" style={{
            background: '#fff',
            color: '#1a4328',
            padding: '16px 32px',
            borderRadius: '14px',
            fontWeight: '600',
            textDecoration: 'none',
            fontSize: '15px',
            border: '1.5px solid rgba(26,67,40,0.15)',
            display: 'inline-block',
          }}>
            List Your Asset
          </Link>
          <Link href="/kyc" style={{
            background: 'transparent',
            color: '#2d6a4f',
            padding: '16px 32px',
            borderRadius: '14px',
            fontWeight: '600',
            textDecoration: 'none',
            fontSize: '15px',
            border: '1.5px solid rgba(45,106,79,0.2)',
            display: 'inline-block',
          }}>
            Register as Emitter
          </Link>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginTop: '72px',
          background: '#fff',
          borderRadius: '24px',
          padding: '28px',
          border: '1px solid rgba(26,67,40,0.08)',
          boxShadow: '0 8px 32px -8px rgba(26,67,40,0.1)',
        }}>
          {STATS.map(({ value, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#1a4328', letterSpacing: '-0.02em' }}>
                {value}
              </div>
              <div style={{ fontSize: '12px', color: '#7aaa88', fontWeight: '500', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ textAlign: 'center', margin: '64px 0 48px', color: '#b7ddc0', fontSize: '18px' }}>
          ✦ ✦ ✦
        </div>

        {/* Four Token Types */}
        <h2 style={{
          textAlign: 'center',
          fontSize: '28px',
          fontWeight: '700',
          marginBottom: '32px',
          letterSpacing: '-0.02em',
        }}>
          Four Types of Agricultural Tokens
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title} style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid rgba(26,67,40,0.08)',
              boxShadow: '0 4px 16px -4px rgba(26,67,40,0.08)',
              transition: 'transform 0.2s',
            }}>
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>{icon}</div>
              <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '6px', color: '#1a4328' }}>
                {title}
              </div>
              <div style={{ fontSize: '14px', color: '#7aaa88', lineHeight: '1.5' }}>
                {desc}
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p style={{
          textAlign: 'center',
          marginTop: '64px',
          fontSize: '13px',
          color: '#9cbb9e',
        }}>
          Built on Solana · Oracle-Verified RWA · Open Source
        </p>

      </main>
    </div>
  );
}
