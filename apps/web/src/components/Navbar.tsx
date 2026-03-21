import Link from 'next/link';

export function Navbar() {
  return (
    <nav style={navStyle}>
      <div style={containerStyle}>
        
        {/* Логотип та Навігація */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          <Link href="/" style={logoStyle}>
              <span style={{ color: '#4ade80' }}>Agro</span>RWA
          </Link>
          
          <div style={menuItemsStyle}>
            <Link href="/marketplace" style={navLinkStyle}>Marketplace</Link>
            <Link href="/create-asset" style={navLinkStyle}>List Asset</Link>
            <Link href="/oracle" style={navLinkStyle}>Oracle Panel</Link>
            <Link href="/portfolio" style={navLinkStyle}>Portfolio</Link>
            <Link href="/insurance" style={navLinkStyle}>Insurance</Link>
          </div>
        </div>

        {/* Кнопка гаманця */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={networkBadgeStyle}>SOLANA Devnet</div>
          <button style={walletBtnStyle}>Select Wallet</button>
        </div>

      </div>
    </nav>
  );
}

// СТИЛІ ДЛЯ NAVBAR
const navStyle = {
  position: 'sticky' as const,
  top: 0,
  zIndex: 100,
  backgroundColor: 'rgba(2, 6, 23, 0.85)', // Темний з прозорістю
  backdropFilter: 'blur(12px)',           // Ефект скла
  borderBottom: '1px solid rgba(74, 222, 128, 0.15)',
  padding: '0 20px',
};

const containerStyle = {
  maxWidth: '1280px',
  margin: '0 auto',
  height: '72px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const logoStyle = {
  fontSize: '22px',
  fontWeight: '800',
  color: '#f8fafc',
  textDecoration: 'none',
  letterSpacing: '-0.02em',
};

const menuItemsStyle = {
  display: 'flex',
  gap: '24px',
};

const navLinkStyle = {
  fontSize: '14px',
  fontWeight: '500',
  color: '#94a3b8',
  textDecoration: 'none',
  transition: 'color 0.2s',
};

const networkBadgeStyle = {
  fontSize: '12px',
  color: '#4ade80',
  backgroundColor: 'rgba(74, 222, 128, 0.1)',
  padding: '4px 12px',
  borderRadius: '100px',
  border: '1px solid rgba(74, 222, 128, 0.2)',
};

const walletBtnStyle = {
  backgroundColor: '#166534',
  color: '#ffffff',
  padding: '10px 20px',
  borderRadius: '12px',
  fontSize: '14px',
  fontWeight: '600',
  border: 'none',
  cursor: 'pointer',
};
