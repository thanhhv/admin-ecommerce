'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const statusTabs = [
  { value: '', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ xử lý' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'SHIPPING', label: 'Đang giao' },
  { value: 'DELIVERED', label: 'Đã giao' },
  { value: 'CANCELLED', label: 'Đã hủy' },
]

export function OrderFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const searchParamsRef = useRef(searchParams)
  useEffect(() => {
    searchParamsRef.current = searchParams
  })

  const [searchValue, setSearchValue] = useState(searchParams.get('q') ?? '')

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParamsRef.current.toString())
      const current = params.get(key) ?? ''
      if (current === value) return
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      if (key !== 'page') params.set('page', '1')
      router.replace(`${pathname}?${params.toString()}`)
    },
    [router, pathname],
  )

  // Debounce search — was previously pushing URL on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      updateParam('q', searchValue)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchValue, updateParam])

  const activeStatus = searchParams.get('status') ?? ''

  return (
    <div className="space-y-3">
      {/* Status tabs */}
      <div className="flex flex-wrap gap-1 border-b">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => updateParam('status', tab.value)}
            className={cn(
              'px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeStatus === tab.value
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search + date range + payment method */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo mã đơn, tên khách..."
            className="pl-9"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm shrink-0">Từ ngày</Label>
          <Input
            type="date"
            className="w-40"
            defaultValue={searchParams.get('from') ?? ''}
            onChange={(e) => updateParam('from', e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm shrink-0">Đến ngày</Label>
          <Input
            type="date"
            className="w-40"
            defaultValue={searchParams.get('to') ?? ''}
            onChange={(e) => updateParam('to', e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-sm shrink-0">Thanh toán</Label>
          <select
            value={searchParams.get('paymentMethod') ?? ''}
            onChange={(e) => updateParam('paymentMethod', e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Tất cả phương thức</option>
            <option value="COD">Thanh toán khi nhận hàng (COD)</option>
            <option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
          </select>
        </div>
      </div>
    </div>
  )
}
