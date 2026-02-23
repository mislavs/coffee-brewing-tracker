import { useRef, useState } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ImageUploadProps = {
  id: string
  label: string
  previewUrl?: string | null
  onFileSelected: (file: File | null) => void
  onRemove: () => void
  accept?: string
  disabled?: boolean
  helperText?: string
}

export function ImageUpload({
  id,
  label,
  previewUrl,
  onFileSelected,
  onRemove,
  accept = 'image/png,image/jpeg,image/webp,image/svg+xml',
  disabled = false,
  helperText = 'PNG, JPEG, WebP, or SVG. Max 512 KB.',
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const chooseFile = () => {
    if (disabled) {
      return
    }

    inputRef.current?.click()
  }

  const handleFile = (file: File | null) => {
    onFileSelected(file)
  }

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div
        className={cn(
          'space-y-3 rounded-md border border-dashed p-4 transition-colors',
          isDragging && 'border-primary bg-muted/40',
          disabled && 'opacity-70',
        )}
        onDragOver={(event) => {
          event.preventDefault()
          if (!disabled) {
            setIsDragging(true)
          }
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)

          if (disabled) {
            return
          }

          const nextFile = event.dataTransfer.files.item(0)
          handleFile(nextFile)
        }}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Selected logo preview"
            className="h-36 w-full rounded-md border object-contain"
          />
        ) : (
          <div className="text-muted-foreground flex h-36 w-full flex-col items-center justify-center gap-2 rounded-md border bg-muted/20 text-sm">
            <ImagePlus className="size-5" />
            <span>No image selected</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={chooseFile} disabled={disabled}>
            {previewUrl ? 'Change image' : 'Choose image'}
          </Button>
          {previewUrl ? (
            <Button
              type="button"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={onRemove}
              disabled={disabled}
            >
              <Trash2 className="mr-1 size-4" />
              Remove
            </Button>
          ) : null}
        </div>

        <p className="text-muted-foreground text-xs">{helperText}</p>
      </div>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled}
        onChange={(event) => {
          const nextFile = event.target.files?.item(0) ?? null
          handleFile(nextFile)
          event.currentTarget.value = ''
        }}
      />
    </div>
  )
}
