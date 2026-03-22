import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css' // ПОВЕРТАЄМО СТИЛІ
import { SolanaProvider } from '../providers/SolanaProvider' // Ваш новий провайдер
import { QueryProvider } from '@/config/QueryProvider' // ПОВЕРТАЄМО ДЛЯ ХУКІВ
import { Navbar } from '@/components/Navbar'
import { Toaster } from 'react-hot-toast' // ПОВЕРТАЄМО ДЛЯ ПОВІДОМЛЕНЬ

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AgroRWA — Agricultural Asset Tokenization',
  description: 'Tokenize agricultural real-world assets on Solana.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Додаємо класи назад, щоб фон і шрифти були як треба */}
      <body className={`${inter.className} bg-gray-950 text-gray-100 min-h-screen`}>
        <QueryProvider>
          <SolanaProvider>
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 py-8">
              {children}
            </main>
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
          </SolanaProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
