import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { listUsers, banUser, unbanUser } from '@/lib/api/users'
import type { UserFilters } from '@/lib/types/user'

export function useUsers(filters: UserFilters) {
  return useQuery({
    queryKey: ['admin', 'users', filters],
    queryFn: () => listUsers(filters),
    staleTime: 1000 * 60,
  })
}

export function useBanUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => banUser(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success('Đã khóa tài khoản người dùng')
    },
    onError: () => toast.error('Khóa tài khoản thất bại'),
  })
}

export function useUnbanUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => unbanUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success('Đã mở khóa tài khoản người dùng')
    },
    onError: () => toast.error('Mở khóa tài khoản thất bại'),
  })
}
