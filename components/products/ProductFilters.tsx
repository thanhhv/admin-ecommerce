'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-react'
import type { Category } from '@/lib/types/product'
import { cn } from '@/lib/utils'

interface ProductFiltersProps {
  categories: Category[]
}

const statusTabs = [
  { value: '', label: 'Tất cả' },
  { value: 'true', label: 'Đang bán' },
  { value: 'false', label: 'Ngừng bán' },
]

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Stable ref so updateParam doesn't need searchParams in its deps
  const searchParamsRef = useRef(searchParams)
  useEffect(() => {
    searchParamsRef.current = searchParams
  })

  const [searchValue, setSearchValue] = useState(searchParams.get('search') ?? '')

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParamsRef.current.toString())
      const current = params.get(key) ?? ''
      if (current === value) return  // no-op: prevents push when value hasn't changed
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

  useEffect(() => {
    const timer = setTimeout(() => {
      updateParam('search', searchValue)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchValue, updateParam])

  const activeStatus = searchParams.get('isActive') ?? ''
  const activeCategory = searchParams.get('categoryId') ?? ''

  return (
    <div className="space-y-3">
      {/* Status tabs */}
      <div className="flex gap-1 border-b">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => updateParam('isActive', tab.value)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeStatus === tab.value
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search + category filter */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            className="pl-9"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
        <Select
          value={activeCategory || 'all'}
          onValueChange={(v) => updateParam('categoryId', v === 'all' || !v ? '' : v)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
