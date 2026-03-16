'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { clsx } from 'clsx'

const NAV = [
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/create-asset', label: 'List Asset' },
  { href: '/oracle',       label: 'Oracle Panel' },
  { href: '/portfolio',    label: 'Portfolio' },
  { href: '/insurance',    label: 'Insurance' },
]

export function Navbar() {
  const pathname = usePathname()
  return (
    <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-lg text-green-400">🌾 AgroRWA</Link>
          <div className="hidden md:flex items-center gap-1">
            {NAV.map(({ href, label }) => (
              <Link key={href} href={href} className={clsx(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                pathname.startsWith(href)
                  ? 'bg-green-900/50 text-green-400'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
              )}>{label}</Link>
            ))}
          </div>
        </div>
        <WalletMultiButton />
      </div>
    </nav>
  )
}
