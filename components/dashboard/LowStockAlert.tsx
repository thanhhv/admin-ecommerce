import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface LowStockProduct {
  id: string
  name: string
  slug: string
  stock: number
}

interface LowStockAlertProps {
  products: LowStockProduct[]
  alertCount: number
}

export function LowStockAlert({ products, alertCount }: LowStockAlertProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-3">
        <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
        <CardTitle>Sản phẩm sắp hết hàng ({alertCount})</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Không có sản phẩm sắp hết hàng
          </p>
        ) : (
          <div className="space-y-1">
            {products.slice(0, 8).map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-muted transition-colors group"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                    {p.name}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    #{p.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <span
                  className={cn(
                    'text-sm font-semibold shrink-0 ml-3 tabular-nums',
                    p.stock === 0
                      ? 'text-red-600'
                      : p.stock <= 3
                        ? 'text-red-500'
                        : 'text-yellow-600'
                  )}
                >
                  {p.stock === 0 ? 'Hết hàng' : `Còn ${p.stock}`}
                </span>
              </Link>
            ))}
            {alertCount > 8 && (
              <Link
                href="/inventory?lowStock=true"
                className="mt-1 block text-center text-xs text-primary hover:underline py-1"
              >
                Xem thêm {alertCount - 8} sản phẩm →
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
