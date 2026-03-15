'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { clsx } from 'clsx'

const NAV_LINKS = [
  { href: '/tokens',   label: 'Tokens' },
  { href: '/market',   label: 'Market' },
  { href: '/swap',     label: 'Swap' },
  { href: '/vault',    label: 'Vault' },
  { href: '/portfolio',label: 'Portfolio' },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-agro-400">
            🌾 AgroRWA
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  pathname.startsWith(href)
                    ? 'bg-agro-900/60 text-agro-400'
                    : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
                )}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <WalletMultiButton />
      </div>
    </nav>
  )
}
