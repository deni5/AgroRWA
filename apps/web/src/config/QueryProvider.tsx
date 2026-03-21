'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'

/**
 * Провайдер для React Query.
 * Використовуємо useState для ініціалізації клієнта, щоб він створювався 
 * лише один раз на стороні клієнта і не скидався при ре-рендері.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Налаштування для Solana-запитів
            staleTime: 30_000, // Дані вважаються свіжими 30 секунд
            retry: 2,          // Повторити запит двічі у разі помилки RPC
            refetchOnWindowFocus: false, // Не робити запит щоразу при фокусі вікна
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
