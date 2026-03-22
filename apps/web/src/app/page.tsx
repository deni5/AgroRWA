"use client";

import Link from 'next/link';

export default function HomePage() {
  // Виносимо стилі всередину, щоб уникнути проблем з серіалізацією об'єктів
  const btnPrimary = { backgroundColor: '#4ade80', color: '#020617', padding: '18px 36px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' as const, fontSize: '15px' };
  const btnSecondary = { backgroundColor: 'transparent', color: '#f8fafc', padding: '18px 36px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' as const, border: '1px solid #334155', fontSize: '15px' };

  return (
    <div style={{ backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      <main style={{ padding: '80px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        
        <section style={{ textAlign: 'center', marginBottom: '120px' }}>
          <h1 style={{ fontSize: '72px', fontWeight: '900', lineHeight: '1' }}>
            Agricultural Assets<br />
            <span style={{ color: '#4ade80' }}>Tokenized & Verified</span>
          </h1>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '48px' }}>
            <Link href="/marketplace" style={btnPrimary}>Browse Marketplace</Link>
            <Link href="/create-asset" style={btnSecondary}>List Asset</Link>
          </div>
        </section>

        {/* Додайте інші секції сюди, але тримайте масиви (TOKEN_TYPES) всередині компонента або в окремому файлі .ts */}
      </main>
    </div>
  );
}
