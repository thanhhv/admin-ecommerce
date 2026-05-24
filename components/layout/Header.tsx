'use client'

import { usePathname, useRouter } from 'next/navigation'
import { LogOut, UserCircle } from 'lucide-react'
import { NotificationDropdown } from './NotificationDropdown'
import { useAuthStore } from '@/lib/stores/authStore'
import { logout as logoutApi } from '@/lib/api/auth'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const breadcrumbMap: Record<string, string> = {
  '/': 'Tổng quan',
  '/products': 'Sản phẩm',
  '/products/new': 'Thêm sản phẩm',
  '/categories': 'Danh mục',
  '/orders': 'Đơn hàng',
  '/inventory': 'Kho hàng',
  '/users': 'Người dùng',
}

const segmentLabelMap: Record<string, string> = {
  products: 'Sản phẩm',
  orders: 'Đơn hàng',
  categories: 'Danh mục',
  inventory: 'Kho hàng',
  users: 'Người dùng',
}

const uuidDetailLabelMap: Record<string, string> = {
  products: 'Chi tiết sản phẩm',
  orders: 'Chi tiết đơn hàng',
}

function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)
}

function getBreadcrumb(pathname: string): string[] {
  const parts = pathname.split('/').filter(Boolean)
  const crumbs: string[] = ['Trang chủ']

  let current = ''
  let prevSegment = ''
  for (const part of parts) {
    current += `/${part}`
    const label = breadcrumbMap[current]
    if (label) {
      crumbs.push(label)
    } else if (isUUID(part)) {
      const detail = uuidDetailLabelMap[prevSegment] ?? 'Chi tiết'
      crumbs.push(detail)
    } else {
      crumbs.push(segmentLabelMap[part] ?? part)
    }
    prevSegment = part
  }

  return crumbs
}

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { admin, logout } = useAuthStore()
  const breadcrumbs = getBreadcrumb(pathname)

  const handleLogout = async () => {
    try {
      await logoutApi()
    } catch {
      // ignore
    }
    logout()
    router.push('/login')
    toast.success('Đã đăng xuất')
  }

  return (
    <header
      className={cn(
        'flex h-14 items-center justify-between border-b bg-background px-6',
        className
      )}
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span>/</span>}
            <span className={cn(i === breadcrumbs.length - 1 ? 'font-medium text-foreground' : '')}>
              {crumb}
            </span>
          </span>
        ))}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <NotificationDropdown />

        {admin && (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted transition-colors outline-none">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold shrink-0">
                {admin.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium hidden md:block max-w-[120px] truncate">
                {admin.name}
              </span>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 p-1.5">
              {/* Admin info header */}
              <div className="flex items-center gap-3 px-2 py-2.5 mb-1">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold shrink-0">
                  {admin.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{admin.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{admin.email}</p>
                </div>
              </div>

              <DropdownMenuSeparator className="mx-1 mt-1" />

              <DropdownMenuItem
                variant="destructive"
                className="gap-2.5 px-2 py-2 cursor-pointer rounded-md mt-0.5"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  )
}
