'use client'

import { DollarSign, ShoppingCart, Package, AlertTriangle } from 'lucide-react'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { RecentOrdersTable } from '@/components/dashboard/RecentOrdersTable'
import { LowStockAlert } from '@/components/dashboard/LowStockAlert'
import { PageHeader } from '@/components/shared/PageHeader'
import { useDashboardStats } from '@/lib/hooks/useDashboardStats'
import { formatCurrency } from '@/lib/utils/formatCurrency'

export default function DashboardPage() {
  const { data, isLoading } = useDashboardStats()

  return (
    <div className="space-y-6">
      <PageHeader title="Tổng quan" description="Xem tổng quan hoạt động của cửa hàng" />

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Doanh thu tháng này"
          value={isLoading ? '...' : formatCurrency(data?.totalRevenueThisMonth ?? 0)}
          change={data?.revenueChangePercent}
          icon={DollarSign}
        />
        <StatsCard
          title="Đơn hàng hôm nay"
          value={isLoading ? '...' : (data?.ordersToday ?? 0)}
          icon={ShoppingCart}
          description="Số đơn hàng mới nhận hôm nay"
        />
        <StatsCard
          title="Sản phẩm đang bán"
          value={isLoading ? '...' : (data?.totalActiveProducts ?? 0)}
          icon={Package}
          description="Sản phẩm đang hiển thị"
        />
        <StatsCard
          title="Cảnh báo tồn kho"
          value={isLoading ? '...' : (data?.lowStockAlerts ?? 0)}
          icon={AlertTriangle}
          description="Sản phẩm sắp hết hàng"
        />
      </div>

      {/* Revenue chart */}
      <RevenueChart />

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentOrdersTable orders={data?.recentOrders ?? []} />
        </div>
        <div>
          <LowStockAlert products={data?.lowStockProducts ?? []} alertCount={data?.lowStockAlerts ?? 0} />
        </div>
      </div>
    </div>
  )
}
