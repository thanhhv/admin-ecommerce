import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { listOrders, getOrder, updateOrderStatus } from '@/lib/api/orders'
import type { OrderFilters, OrderStatus } from '@/lib/types/order'

export function useOrders(filters: OrderFilters) {
  return useQuery({
    queryKey: ['admin', 'orders', filters],
    queryFn: () => listOrders(filters),
    staleTime: 1000 * 60,
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['admin', 'orders', id],
    queryFn: () => getOrder(id),
    enabled: !!id,
  })
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] })
      qc.invalidateQueries({ queryKey: ['admin', 'orders', vars.id] })
      toast.success('Cập nhật trạng thái đơn hàng thành công')
    },
    onError: () => toast.error('Cập nhật trạng thái thất bại'),
  })
}
