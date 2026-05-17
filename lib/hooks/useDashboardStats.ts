import { useQuery } from '@tanstack/react-query'
import { getStats, getRevenue } from '@/lib/api/dashboard'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: getStats,
    staleTime: 1000 * 60 * 5,
  })
}

export function useRevenueChart(days: number) {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'revenue', days],
    queryFn: () => getRevenue(days),
    staleTime: 1000 * 60 * 5,
  })
}
