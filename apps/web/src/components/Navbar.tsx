"use client";

import Link from 'next/link';
import dynamic from 'next/dynamic';

// Динамічний імпорт кнопки з вимкненим SSR (це вирішить проблему Vercel Error 500)
const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => mod.WalletMultiButton),
  { ssr: false }
);

export default function Header() {
  return (
    <header className="flex items-center justify-between p-4 mb-8 bg-white/50 backdrop-blur-md rounded-2xl mx-4 mt-4 shadow-sm">
      <div className="flex items-center space-x-8">
        {/* Логотип */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl">🌾</span>
          <span className="text-xl font-bold text-[#1a4328]">AgroRWA</span>
        </Link>

        {/* Навігація */}
        <nav className="hidden md:flex space-x-6 text-[#2d6a4f] font-medium">
          <Link href="/marketplace" className="hover:text-[#1a4328] transition-colors">Marketplace</Link>
          <Link href="/create-asset" className="hover:text-[#1a4328] transition-colors">List Asset</Link>
          <Link href="/oracle" className="hover:text-[#1a4328] transition-colors">Oracle Panel</Link>
          <Link href="/portfolio" className="hover:text-[#1a4328] transition-colors">Portfolio</Link>
          <Link href="/insurance" className="hover:text-[#1a4328] transition-colors">Insurance</Link>
        </nav>
      </div>

      {/* Гаманець */}
      <div className="flex items-center space-x-4">
        <div className="text-sm text-right hidden sm:block">
          <p className="font-semibold text-[#1a4328]">SOLANA Devnet</p>
          <p className="text-xs text-gray-500">Oracle-Verified RWA 🔗</p>
        </div>
        {/* Кнопка адаптера Solana */}
        <div className="bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden">
           <WalletMultiButton style={{ backgroundColor: '#1a4328', borderRadius: '0.75rem' }} />
        </div>
      </div>
    </header>
  );
}
