"use client"; 

import Link from 'next/link';

export function Navbar() {
  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: '#020617', // Глибокий темний фон
      borderBottom: '1px solid rgba(74, 222, 128, 0.2)', // Тонка зелена лінія
      padding: '0 20px'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        
        {/* Ліва частина: Логотип та Навігація */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          <Link href="/" style={{ 
            fontSize: '22px', 
            fontWeight: '800', 
            color: '#f8fafc', 
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🌾 <span style={{ color: '#4ade80' }}>Agro</span>RWA
          </Link>
          
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link href="/marketplace" style={navLinkStyle}>Marketplace</Link>
            <Link href="/create-asset" style={navLinkStyle}>List Asset</Link>
            <Link href="/oracle" style={navLinkStyle}>Oracle Panel</Link>
            <Link href="/portfolio" style={navLinkStyle}>Portfolio</Link>
            <Link href="/insurance" style={navLinkStyle}>Insurance</Link>
          </div>
        </div>

        {/* Права частина: Мережа та Гаманець */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            fontSize: '12px', 
            color: '#4ade80', 
            backgroundColor: 'rgba(74, 222, 128, 0.1)', 
            padding: '4px 12px', 
            borderRadius: '100px', 
            border: '1px solid rgba(74, 222, 128, 0.2)',
            fontWeight: '600'
          }}>
            SOLANA Devnet
          </div>
          
          <button style={{ 
            backgroundColor: '#166534', 
            color: '#ffffff', 
            padding: '10px 20px', 
            borderRadius: '12px', 
            fontSize: '14px', 
            fontWeight: '600', 
            border: 'none', 
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}>
            Select Wallet
          </button>
        </div>

      </div>
    </nav>
  );
}

// Базовий стиль для посилань
const navLinkStyle = {
  fontSize: '14px',
  fontWeight: '500',
  color: '#94a3b8',
  textDecoration: 'none',
};
