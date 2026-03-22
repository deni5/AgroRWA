"use client";

import Link from 'next/link';
// Імпортуємо реальну кнопку гаманця
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function Navbar() {
  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: '#f0fdf4', // Світло-зелений фон (як у CoW Swap)
      borderBottom: '1px solid rgba(26, 67, 40, 0.1)',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          <Link href="/" style={{ 
            fontSize: '20px', 
            fontWeight: '900', 
            color: '#1a4328', // Темно-зелений логотип
            textDecoration: 'none',
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center'
          }}>
            AGRO<span style={{ color: '#22c55e' }}>RWA</span>
          </Link>
          
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link href="/marketplace" style={navLinkStyle}>Marketplace</Link>
            <Link href="/create-asset" style={navLinkStyle}>List Asset</Link>
            <Link href="/oracle" style={navLinkStyle}>Oracle</Link>
            <Link href="/portfolio" style={navLinkStyle}>Portfolio</Link>
          </div>
        </div>

        {/* Action Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Статус мережі в стилі CoW Swap */}
          <div style={{ 
            fontSize: '12px', 
            color: '#1a4328', 
            fontWeight: '600', 
            backgroundColor: 'rgba(34, 197, 94, 0.1)', 
            padding: '6px 12px', 
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ color: '#22c55e' }}>●</span> Solana Devnet
          </div>

          {/* Реальна робоча кнопка гаманця */}
          <div className="wallet-button-wrapper">
            <WalletMultiButton />
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Стилізація стандартної кнопки Solana під наш дизайн */
        .wallet-button-wrapper .wallet-adapter-button {
          background-color: #1a4328 !important;
          color: white !important;
          font-family: inherit !important;
          font-size: 13px !important;
          font-weight: 700 !important;
          height: 42px !important;
          padding: 0 20px !important;
          border-radius: 12px !important;
          transition: all 0.2s ease !important;
        }
        .wallet-button-wrapper .wallet-adapter-button:hover {
          background-color: #2d6a4f !important;
          transform: translateY(-1px) !important;
        }
      `}</style>
    </nav>
  );
}

const navLinkStyle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#4b6354', // Приглушений зелений для посилань
  textDecoration: 'none',
  transition: 'color 0.2s'
};
