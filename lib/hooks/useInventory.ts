import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { listInventory, adjustInventory, getInventoryHistory } from '@/lib/api/inventory'
import type { InventoryFilters } from '@/lib/api/inventory'

export function useInventory(filters: InventoryFilters) {
  return useQuery({
    queryKey: ['admin', 'inventory', filters],
    queryFn: () => listInventory(filters),
    staleTime: 1000 * 60,
  })
}

export function useInventoryHistory(productId: string) {
  return useQuery({
    queryKey: ['admin', 'inventory', productId, 'history'],
    queryFn: () => getInventoryHistory(productId),
    enabled: !!productId,
  })
}

export function useAdjustInventory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      productId,
      quantityChange,
      reason,
    }: {
      productId: string
      quantityChange: number
      reason: string
    }) => adjustInventory(productId, { quantityChange, reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'inventory'] })
      toast.success('Điều chỉnh tồn kho thành công')
    },
    onError: () => toast.error('Điều chỉnh tồn kho thất bại'),
  })
}
