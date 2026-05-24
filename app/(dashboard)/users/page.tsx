'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { type ColumnDef } from '@tanstack/react-table'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTable } from '@/components/shared/DataTable'
import { PageHeader } from '@/components/shared/PageHeader'
import { Pagination } from '@/components/shared/Pagination'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useUsers, useBanUser, useUnbanUser } from '@/lib/hooks/useUsers'
import { formatDate } from '@/lib/utils/formatDate'
import type { User } from '@/lib/types/user'
import { cn } from '@/lib/utils'

function UsersContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [banTarget, setBanTarget] = useState<User | null>(null)
  const [unbanTarget, setUnbanTarget] = useState<User | null>(null)
  const [banReason, setBanReason] = useState('')

  const statusTabs = [
    { value: '', label: 'Tất cả' },
    { value: 'ACTIVE', label: 'Hoạt động' },
    { value: 'BANNED', label: 'Đã khóa' },
  ]

  const activeStatus = searchParams.get('status') ?? ''

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.set('page', '1')
    router.push(`?${params.toString()}`)
  }

  const filters = {
    page: Number(searchParams.get('page') ?? 1),
    limit: 20,
    q: searchParams.get('q') ?? undefined,
    status: searchParams.get('status') ?? undefined,
  }

  const { data, isLoading } = useUsers(filters)
  const banUser = useBanUser()
  const unbanUser = useUnbanUser()

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'name',
      header: 'Người dùng',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
            {row.original.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Điện thoại',
      cell: ({ row }) => row.original.phone ?? '—',
    },
    {
      accessorKey: 'createdAt',
      header: 'Ngày đăng ký',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      accessorKey: 'ordersCount',
      header: 'Số đơn',
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => (
        <div className="flex gap-1">
          {row.original.status === 'ACTIVE' ? (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setBanTarget(row.original)}
            >
              Khóa
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUnbanTarget(row.original)}
            >
              Mở khóa
            </Button>
          )}
        </div>
      ),
    },
  ]

  const users = data?.users ?? []
  const pagination = data?.pagination

  return (
    <div className="space-y-4">
      <PageHeader title="Người dùng" description="Quản lý tài khoản người dùng" />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1 border-b">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => updateParam('status', tab.value)}
              className={cn(
                'px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeStatus === tab.value
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên, email..."
            className="pl-9 w-64"
            defaultValue={searchParams.get('q') ?? ''}
            onChange={(e) => updateParam('q', e.target.value)}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        emptyMessage="Không có người dùng nào"
      />

      {pagination && (
        <div className="flex justify-end">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(p) => {
              const params = new URLSearchParams(searchParams.toString())
              params.set('page', String(p))
              router.push(`?${params.toString()}`)
            }}
          />
        </div>
      )}

      {/* Ban dialog */}
      <ConfirmDialog
        open={!!banTarget}
        onOpenChange={(open) => {
          if (!open) {
            setBanTarget(null)
            setBanReason('')
          }
        }}
        title={`Khóa tài khoản: ${banTarget?.name}`}
        description="Người dùng sẽ không thể đăng nhập sau khi bị khóa."
        confirmLabel="Khóa tài khoản"
        destructive
        isPending={banUser.isPending}
        onConfirm={() => {
          if (banTarget) {
            banUser.mutate({ id: banTarget.id, reason: banReason || 'Vi phạm điều khoản' })
            setBanTarget(null)
            setBanReason('')
          }
        }}
      >
        <div className="mt-3">
          <label className="text-sm font-medium block mb-1">
            Lý do khóa tài khoản
          </label>
          <textarea
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            placeholder="Nhập lý do..."
            className="w-full rounded-lg border px-3 py-2 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </ConfirmDialog>

      {/* Unban dialog */}
      <ConfirmDialog
        open={!!unbanTarget}
        onOpenChange={(open) => !open && setUnbanTarget(null)}
        title={`Mở khóa tài khoản: ${unbanTarget?.name}`}
        description="Người dùng sẽ có thể đăng nhập lại sau khi được mở khóa."
        confirmLabel="Mở khóa"
        isPending={unbanUser.isPending}
        onConfirm={() => {
          if (unbanTarget) {
            unbanUser.mutate(unbanTarget.id)
            setUnbanTarget(null)
          }
        }}
      />
    </div>
  )
}

export default function UsersPage() {
  return (
    <Suspense>
      <UsersContent />
    </Suspense>
  )
}
