'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingCart,
  Warehouse,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Leaf,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/lib/stores/authStore'
import { logout as logoutApi } from '@/lib/api/auth'
import { toast } from 'sonner'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/products', label: 'Sản phẩm', icon: Package },
  { href: '/categories', label: 'Danh mục', icon: Tag },
  { href: '/orders', label: 'Đơn hàng', icon: ShoppingCart },
  { href: '/inventory', label: 'Kho hàng', icon: Warehouse },
  { href: '/users', label: 'Người dùng', icon: Users },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { admin, logout } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)

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
    <aside
      className={cn(
        'relative flex h-full flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
      style={{ backgroundColor: 'var(--sidebar-bg)', color: 'var(--sidebar-text)' }}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-2 px-4 py-5 border-b border-white/10')}>
        <Leaf className="h-6 w-6 shrink-0 text-green-400" />
        {!collapsed && (
          <span className="font-bold text-lg tracking-wide">Thế giới cây xanh</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-white/10 text-sidebar-text'
              )}
              style={{ color: isActive ? undefined : 'var(--sidebar-text)' }}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User info + logout */}
      <div className="border-t border-white/10 p-3">
        {!collapsed && admin && (
          <div className="mb-2 px-2">
            <p className="text-xs font-medium truncate">{admin.name}</p>
            <p className="text-xs opacity-60 truncate">{admin.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-white/10 transition-colors'
          )}
          style={{ color: 'var(--sidebar-text)' }}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Đăng xuất</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-6 h-6 w-6 rounded-full border bg-background text-foreground shadow-sm"
        onClick={() => setCollapsed((c) => !c)}
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>
    </aside>
  )
}
