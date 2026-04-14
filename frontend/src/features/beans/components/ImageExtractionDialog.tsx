import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { ImageUpload } from '@/components/ImageUpload'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  toOriginTypeLabel,
  toRoastProfileLabel,
} from '@/features/beans/beanShared'
import {
  formatDecimal,
  formatPrice,
} from '@/features/beans/formatters'
import { useParseBeanImage } from '@/features/beans/hooks/useParseBeanImage'
import type { ParseBeanImageResponse } from '@/lib/api/schemas'
import { formatDate } from '@/lib/date'

type ImageExtractionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onFillForm: (result: ParseBeanImageResponse) => void
}

type ImageDialogState = 'idle' | 'processing' | 'result' | 'error'
type ExtractedField = { label: string; value: string }

function buildExtractedFields(result: ParseBeanImageResponse): ExtractedField[] {
  const fields: ExtractedField[] = []
  if (result.beanName) {
    fields.push({ label: 'Bean', value: result.beanName })
  }

  if (result.roasterName || result.roasterId) {
    fields.push({
      label: 'Roaster',
      value: result.roasterName ?? `Matched id: ${result.roasterId}`,
    })
  }

  const originTypeLabel = toOriginTypeLabel(result.originType)
  if (originTypeLabel) {
    fields.push({ label: 'Origin type', value: originTypeLabel })
  }

  if (result.originCountries?.length) {
    fields.push({
      label: 'Origin countries',
      value: result.originCountries.join(', '),
    })
  }

  if (result.variety) {
    fields.push({ label: 'Variety', value: result.variety })
  }

  if (result.processingMethod) {
    fields.push({
      label: 'Processing method',
      value: result.processingMethod,
    })
  }

  const roastProfileLabel = toRoastProfileLabel(result.roastProfile)
  if (roastProfileLabel) {
    fields.push({ label: 'Roast profile', value: roastProfileLabel })
  }

  if (result.roastDate) {
    fields.push({
      label: 'Roast date',
      value: formatDate(result.roastDate),
    })
  }

  if (result.flavorNotes?.length) {
    fields.push({
      label: 'Flavor notes',
      value: result.flavorNotes.join(', '),
    })
  }

  if (result.altitude != null) {
    fields.push({
      label: 'Altitude',
      value: `${formatDecimal(result.altitude, 0)} m`,
    })
  }

  if (result.bagWeight != null) {
    fields.push({
      label: 'Bag weight',
      value: `${formatDecimal(result.bagWeight, 0)} g`,
    })
  }

  if (result.price != null) {
    fields.push({ label: 'Price', value: formatPrice(result.price) })
  }

  return fields
}

export function ImageExtractionDialog({
  open,
  onOpenChange,
  onFillForm,
}: ImageExtractionDialogProps) {
  const [state, setState] = useState<ImageDialogState>('idle')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined)
  const [result, setResult] = useState<ParseBeanImageResponse | undefined>(undefined)
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)
  const previewUrlRef = useRef<string | undefined>(undefined)
  const { mutateAsync: parseImageAsync, reset: resetParseImage } = useParseBeanImage()

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
    }
  }, [])

  const setFile = (nextFile: File | null) => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
    }

    const nextPreviewUrl = nextFile ? URL.createObjectURL(nextFile) : undefined
    previewUrlRef.current = nextPreviewUrl
    setPreviewUrl(nextPreviewUrl)
    setSelectedFile(nextFile)
  }

  const extractedFields = useMemo(
    () => (result ? buildExtractedFields(result) : []),
    [result],
  )

  const analyze = async () => {
    if (!selectedFile) {
      return
    }

    setState('processing')
    setErrorMessage(undefined)

    try {
      const response = await parseImageAsync(selectedFile)
      if (!response) {
        setErrorMessage('No extraction result was returned.')
        setState('error')
        return
      }

      setResult(response)
      setState('result')
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to parse the selected image.',
      )
      setState('error')
    }
  }

  const resetDialog = (clearFile: boolean) => {
    setResult(undefined)
    setErrorMessage(undefined)
    if (clearFile) {
      setFile(null)
    }
    setState('idle')
    resetParseImage()
  }
  const retry = () => resetDialog(false)
  const discard = () => resetDialog(true)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Extract bean from image</DialogTitle>
          <DialogDescription>
            Upload a bean bag photo and we&apos;ll prefill form fields.
          </DialogDescription>
        </DialogHeader>

        {state === 'idle' && (
          <div className="space-y-4">
            <ImageUpload
              id="bean-image-upload"
              label="Bean image"
              previewUrl={previewUrl}
              onFileSelected={setFile}
              onRemove={() => setFile(null)}
              helperText="PNG, JPEG, or WebP. Clear label photos work best."
            />
            <div className="flex justify-end">
              <Button onClick={() => void analyze()} disabled={!selectedFile}>
                Analyze
              </Button>
            </div>
          </div>
        )}

        {state === 'processing' && (
          <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Analyzing image...</p>
          </div>
        )}

        {state === 'result' && result && (
          <div className="space-y-4">
            {extractedFields.length > 0 ? (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Extracted fields</h4>
                <ul className="space-y-1 text-sm">
                  {extractedFields.map((field) => (
                    <li key={field.label}>
                      <span className="font-medium">{field.label}:</span> {field.value}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No fields were extracted from this image.
              </p>
            )}

            {result.unmatchedReferences?.length ? (
              <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                <div className="mb-1 flex items-center gap-2 font-medium">
                  <AlertTriangle className="size-4" />
                  Unmatched references
                </div>
                <ul className="list-disc pl-5">
                  {result.unmatchedReferences.map((reference) => (
                    <li key={reference}>{reference}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}

        {state === 'error' && (
          <div className="flex flex-col items-center justify-center gap-4 py-4 text-center">
            <AlertTriangle className="size-8 text-destructive" />
            <p className="text-sm text-destructive">
              {errorMessage ?? 'Something went wrong while analyzing this image.'}
            </p>
            <Button variant="outline" onClick={retry}>
              Try again
            </Button>
          </div>
        )}

        {state === 'result' && result && (
          <DialogFooter>
            <Button variant="outline" onClick={discard}>
              Discard
            </Button>
            <Button
              onClick={() => {
                onFillForm(result)
                onOpenChange(false)
              }}
            >
              Fill form
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
