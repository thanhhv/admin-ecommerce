'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { X, Star, Upload, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { uploadImage } from '@/lib/api/products'
import { toast } from 'sonner'

interface ProductImageManagerProps {
  images: string[]
  onChange: (images: string[]) => void
}

interface UploadingFile {
  id: string
  preview: string
}

export function ProductImageManager({ images, onChange }: ProductImageManagerProps) {
  const [uploading, setUploading] = useState<UploadingFile[]>([])

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newUploading = acceptedFiles.map((file) => ({
        id: Math.random().toString(36).slice(2),
        preview: URL.createObjectURL(file),
      }))
      setUploading((prev) => [...prev, ...newUploading])

      // Collect all uploaded URLs before calling onChange once — avoids stale closure
      const uploadedUrls: string[] = []
      await Promise.allSettled(
        acceptedFiles.map(async (file, i) => {
          try {
            const url = await uploadImage(file)
            uploadedUrls.push(url)
          } catch {
            toast.error(`Tải lên thất bại: ${file.name}`)
          } finally {
            setUploading((prev) => prev.filter((u) => u.id !== newUploading[i].id))
          }
        }),
      )

      if (uploadedUrls.length > 0) {
        onChange([...images, ...uploadedUrls])
      }
    },
    [images, onChange],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true,
  })

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  const totalCount = images.length + uploading.length

  return (
    <div className="space-y-3">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-muted/30',
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {isDragActive ? 'Thả ảnh vào đây...' : 'Kéo thả nhiều ảnh hoặc nhấn để chọn'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP · Tối đa 10 ảnh</p>
      </div>

      {/* Count */}
      {totalCount > 0 && (
        <p className="text-xs text-muted-foreground">
          {images.length} ảnh{uploading.length > 0 ? ` · đang tải ${uploading.length}...` : ''}
        </p>
      )}

      {/* Image grid */}
      {(images.length > 0 || uploading.length > 0) && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {images.map((url, i) => (
            <div
              key={url}
              className="group relative aspect-square rounded-lg overflow-hidden border bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Ảnh ${i + 1}`} className="w-full h-full object-cover" />

              {i === 0 && (
                <div className="absolute bottom-1 left-1 flex items-center gap-0.5 rounded-sm bg-yellow-500/90 px-1 py-0.5">
                  <Star className="h-2.5 w-2.5 text-white" fill="white" />
                  <span className="text-[9px] font-semibold text-white leading-none">Chính</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute right-1 top-1 hidden items-center justify-center rounded-full bg-black/60 p-0.5 text-white group-hover:flex hover:bg-red-500/80 transition-colors"
                aria-label="Xóa ảnh"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          {uploading.map((item) => (
            <div
              key={item.id}
              className="relative aspect-square rounded-lg overflow-hidden border bg-muted flex items-center justify-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.preview}
                alt="Đang tải"
                className="absolute inset-0 w-full h-full object-cover opacity-40"
              />
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground relative z-10" />
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Ảnh đầu tiên sẽ được dùng làm ảnh chính hiển thị trên trang sản phẩm.
        </p>
      )}
    </div>
  )
}
