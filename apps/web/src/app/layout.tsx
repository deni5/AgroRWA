import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SolanaProvider } from '../providers/SolanaProvider'
import { QueryProvider } from '@/config/QueryProvider'
import { Navbar } from '@/components/Navbar'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'], weight: ['400','500','600','700','800'] })

export const metadata: Metadata = {
  title: 'AgroRWA — Agricultural Asset Tokenization',
  description: 'Tokenize agricultural real-world assets on Solana.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <SolanaProvider>
            <Navbar />
            <main style={{
              maxWidth: '1100px',
              margin: '0 auto',
              padding: '40px 32px 80px',
            }}>
              {children}
            </main>
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: '#ffffff',
                  color: '#1a4328',
                  border: '1px solid rgba(26,67,40,0.12)',
                  borderRadius: '12px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                },
              }}
            />
          </SolanaProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
