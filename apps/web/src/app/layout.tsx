import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { WalletContextProvider } from '@/config/WalletProvider'
import { QueryProvider } from '@/config/QueryProvider'
import { Navbar } from '@/components/Navbar'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AgroRWA — Agricultural Asset Tokenization',
  description: 'Tokenize agricultural real-world assets on Solana. Verified by certified oracles.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-950 text-gray-100 min-h-screen`}>
        <QueryProvider>
          <WalletContextProvider>
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: '#1f2937',
                  color: '#f9fafb',
                  border: '1px solid #374151',
                },
              }}
            />
          </WalletContextProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
