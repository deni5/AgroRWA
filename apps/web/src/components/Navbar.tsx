"use client";
import Link from 'next/link';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const navLink: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: '500',
  color: '#4b6354',
  textDecoration: 'none',
  letterSpacing: '-0.01em',
}

export function Navbar() {
  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: 'rgba(240, 253, 244, 0.92)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(26, 67, 40, 0.08)',
      padding: '0 32px',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>

        {/* Logo — Polkadot style */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
          <Link href="/" style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'baseline',
            gap: '2px',
          }}>
            <span style={{
              fontSize: '22px',
              fontWeight: '800',
              color: '#1a4328',
              letterSpacing: '-0.04em',
              fontFamily: "'Inter', sans-serif",
              lineHeight: 1,
            }}>
              Agro
            </span>
            <span style={{
              fontSize: '22px',
              fontWeight: '800',
              color: '#1a4328',
              letterSpacing: '-0.04em',
              fontFamily: "'Inter', sans-serif",
              lineHeight: 1,
            }}>
              RWA
            </span>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#52b788',
              display: 'inline-block',
              marginLeft: '2px',
              marginBottom: '2px',
              flexShrink: 0,
            }} />
          </Link>

          {/* Nav links */}
          <div style={{ display: 'flex', gap: '32px' }}>
            {[
              { href: '/marketplace', label: 'Marketplace' },
              { href: '/create-asset', label: 'List Asset' },
              { href: '/oracle', label: 'Oracle' },
              { href: '/portfolio', label: 'Portfolio' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={navLink}>
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            fontSize: '12px',
            color: '#2d6a4f',
            fontWeight: '600',
            backgroundColor: 'rgba(82, 183, 136, 0.12)',
            padding: '5px 12px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            letterSpacing: '0.01em',
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#52b788',
              display: 'inline-block',
            }} />
            Solana Devnet
          </div>

          <WalletMultiButton style={{
            backgroundColor: '#1a4328',
            color: '#fff',
            fontFamily: "'Inter', sans-serif",
            fontSize: '13px',
            fontWeight: '600',
            height: '40px',
            padding: '0 18px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            letterSpacing: '-0.01em',
          }} />
        </div>
      </div>
    </nav>
  );
}
