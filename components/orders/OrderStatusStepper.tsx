import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/lib/types/order'
import { Check } from 'lucide-react'

const steps: { status: OrderStatus; label: string }[] = [
  { status: 'PENDING', label: 'Chờ xử lý' },
  { status: 'CONFIRMED', label: 'Đã xác nhận' },
  { status: 'SHIPPING', label: 'Đang giao' },
  { status: 'DELIVERED', label: 'Đã giao' },
]

interface OrderStatusStepperProps {
  currentStatus: OrderStatus
}

export function OrderStatusStepper({ currentStatus }: OrderStatusStepperProps) {
  if (currentStatus === 'CANCELLED') {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center rounded-full border border-red-200 bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
          Đã hủy đơn
        </span>
      </div>
    )
  }

  const currentIndex = steps.findIndex((s) => s.status === currentStatus)

  return (
    <div className="flex items-center gap-2">
      {steps.map((step, i) => {
        const isDone = i < currentIndex
        const isCurrent = i === currentIndex

        return (
          <div key={step.status} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors',
                  isDone
                    ? 'border-primary bg-primary text-primary-foreground'
                    : isCurrent
                      ? 'border-primary text-primary bg-primary/10'
                      : 'border-muted-foreground/30 text-muted-foreground bg-background'
                )}
              >
                {isDone ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={cn(
                  'text-xs font-medium whitespace-nowrap',
                  isCurrent ? 'text-primary' : isDone ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'mb-4 h-0.5 w-16 flex-1',
                  i < currentIndex ? 'bg-primary' : 'bg-muted-foreground/20'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
