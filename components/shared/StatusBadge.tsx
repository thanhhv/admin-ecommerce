import { cn } from '@/lib/utils'

type StatusVariant =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'ACTIVE'
  | 'BANNED'
  | 'PAID'
  | 'FAILED'
  | string

interface StatusBadgeProps {
  status: StatusVariant
  className?: string
}

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: 'Chờ xử lý',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  SHIPPING: {
    label: 'Đang giao',
    className: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  DELIVERED: {
    label: 'Đã giao',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  CANCELLED: {
    label: 'Đã hủy',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
  ACTIVE: {
    label: 'Hoạt động',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  BANNED: {
    label: 'Đã khóa',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
  PAID: {
    label: 'Đã thanh toán',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  FAILED: {
    label: 'Thất bại',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
  COD: {
    label: 'COD',
    className: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  BANK_TRANSFER: {
    label: 'Chuyển khoản',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
