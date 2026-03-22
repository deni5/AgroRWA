"use client";
 
import Link from 'next/link';

export function Navbar() {
  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: '#020617', 
      borderBottom: '1px solid #1e293b',
      padding: '0 24px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        
        {/* Logo & Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
          <Link href="/" style={{ 
            fontSize: '18px', 
            fontWeight: '900', 
            color: '#f8fafc', 
            textDecoration: 'none',
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            Agro<span style={{ color: '#4ade80' }}>RWA</span>
          </Link>
          
          <div style={{ display: 'flex', gap: '32px' }}>
            <Link href="/marketplace" style={navLinkStyle}>MARKETPLACE</Link>
            <Link href="/create-asset" style={navLinkStyle}>LIST ASSET</Link>
            <Link href="/oracle" style={navLinkStyle}>ORACLE</Link>
            <Link href="/portfolio" style={navLinkStyle}>PORTFOLIO</Link>
          </div>
        </div>

        {/* Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ fontSize: '11px', color: '#4ade80', fontWeight: '700', letterSpacing: '0.1em' }}>
            ● Solana devnet
          </div>
          <button style={{ 
            backgroundColor: '#f8fafc', 
            color: '#020617', 
            padding: '10px 20px', 
            borderRadius: '4px', 
            fontSize: '13px', 
            fontWeight: '700', 
            border: 'none', 
            cursor: 'pointer' 
          }}>
            CONNECT WALLET
          </button>
        </div>
      </div>
    </nav>
  );
}

const navLinkStyle = {
  fontSize: '11px',
  fontWeight: '700',
  color: '#94a3b8',
  textDecoration: 'none',
  letterSpacing: '0.05em'
};
