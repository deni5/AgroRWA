import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { WalletContextProvider } from '@/config/WalletProvider'
import { QueryProvider } from '@/config/QueryProvider'
// ВИПРАВЛЕНО: Тепер імпорт без фігурних дужок (бо це default export)
import Navbar from '@/components/Navbar' 
import { Toaster } from 'react-hot-toast'

export const dynamic = 'force-dynamic';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AgroRWA — Agricultural Asset Tokenization',
  description: 'Tokenize agricultural real-world assets on Solana. Verified by certified oracles.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* ВИПРАВЛЕНО: Змінили темну тему на наш новий світло-зелений фон */}
      <body className={`${inter.className} bg-[#eaf5eb] text-[#1a4328] min-h-screen`}>
        <QueryProvider>
          <WalletContextProvider>
            
            <Navbar /> {/* Навігація працюватиме на всіх сторінках */}
            
            <main className="max-w-7xl mx-auto px-4 py-8">
              {children}
            </main>

            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: '#ffffff', // Світлий фон для сповіщень у новому дизайні
                  color: '#1a4328',
                  border: '1px solid #c6ebc9',
                },
              }}
            />
          </WalletContextProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
