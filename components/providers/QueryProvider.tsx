'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 2,    // 2 min fresh window
            gcTime: 1000 * 60 * 10,       // 10 min cache retention
            refetchOnWindowFocus: false,  // don't refetch on tab/devtools switch
            refetchOnMount: false,        // use cached data when navigating back
            retry: 1,
          },
        },
      })
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
