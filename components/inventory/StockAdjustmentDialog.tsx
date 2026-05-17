'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAdjustInventory } from '@/lib/hooks/useInventory'

const schema = z.object({
  quantityChange: z
    .number()
    .int('Phải là số nguyên')
    .refine((v) => v !== 0, 'Không thể bằng 0'),
  reason: z.string().min(1, 'Vui lòng chọn lý do'),
})

type FormValues = z.infer<typeof schema>

const reasons = [
  { value: 'RESTOCK', label: 'Nhập hàng' },
  { value: 'DAMAGE', label: 'Hư hỏng' },
  { value: 'RETURN', label: 'Khách hoàn trả' },
  { value: 'MANUAL', label: 'Điều chỉnh thủ công' },
  { value: 'OTHER', label: 'Khác' },
]

interface StockAdjustmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: string
  productName: string
  currentStock: number
}

export function StockAdjustmentDialog({
  open,
  onOpenChange,
  productId,
  productName,
  currentStock,
}: StockAdjustmentDialogProps) {
  const adjustInventory = useAdjustInventory()

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { quantityChange: 0, reason: '' },
  })

  const quantityChange = watch('quantityChange') || 0
  const newStock = currentStock + Number(quantityChange)

  const onSubmit = async (data: FormValues) => {
    await adjustInventory.mutateAsync({
      productId,
      quantityChange: data.quantityChange,
      reason: data.reason,
    })
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Điều chỉnh tồn kho</DialogTitle>
        </DialogHeader>

        <div className="text-sm text-muted-foreground mb-2">
          Sản phẩm: <span className="font-medium text-foreground">{productName}</span>
        </div>

        {/* Live preview */}
        <div className="rounded-lg bg-muted p-4 text-center">
          <span className="text-2xl font-bold">
            {currentStock}{' '}
            <span className="text-muted-foreground text-base">→</span>{' '}
            <span className={newStock < 0 ? 'text-destructive' : newStock <= 10 ? 'text-yellow-600' : 'text-primary'}>
              {Math.max(0, newStock)}
            </span>
          </span>
          <p className="text-xs text-muted-foreground mt-1">Tồn kho hiện tại → Sau điều chỉnh</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Số lượng thay đổi</Label>
            <Input
              type="number"
              placeholder="+10 hoặc -5"
              {...register('quantityChange', { valueAsNumber: true })}
            />
            {errors.quantityChange && (
              <p className="text-sm text-destructive">{errors.quantityChange.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Lý do *</Label>
            <Controller
              name="reason"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={(v) => field.onChange(v ?? '')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn lý do" />
                  </SelectTrigger>
                  <SelectContent>
                    {reasons.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.reason && (
              <p className="text-sm text-destructive">{errors.reason.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={adjustInventory.isPending}>
              {adjustInventory.isPending ? 'Đang lưu...' : 'Xác nhận'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
