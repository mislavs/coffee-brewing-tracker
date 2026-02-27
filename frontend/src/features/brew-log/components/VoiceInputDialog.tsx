import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Loader2, Mic, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAudioRecorder } from '@/features/brew-log/hooks/useAudioRecorder'
import { useParseVoiceBrewLog } from '@/features/brew-log/hooks/useParseVoiceBrewLog'
import type { ParseVoiceBrewLogResponse } from '@/lib/api/schemas'

type VoiceInputDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onFillForm: (result: ParseVoiceBrewLogResponse) => void
}

type VoiceDialogState = 'idle' | 'recording' | 'processing' | 'result' | 'error'

export function VoiceInputDialog({
  open,
  onOpenChange,
  onFillForm,
}: VoiceInputDialogProps) {
  const [state, setState] = useState<VoiceDialogState>('idle')
  const [result, setResult] = useState<ParseVoiceBrewLogResponse | undefined>(
    undefined,
  )
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)

  const {
    isRecording,
    isSupported,
    audioBlob,
    error: recorderError,
    startRecording,
    stopRecording,
    reset: resetRecorder,
  } = useAudioRecorder()
  const { mutateAsync: parseVoiceAsync, reset: resetParseVoice } =
    useParseVoiceBrewLog()

  useEffect(() => {
    if (!open) {
      if (isRecording) {
        stopRecording()
      }

      resetRecorder()
      setState('idle')
      setResult(undefined)
      setErrorMessage(undefined)
      resetParseVoice()
    }
  }, [open])

  useEffect(() => {
    if (!recorderError) {
      return
    }

    setErrorMessage(recorderError)
    setState('error')
  }, [recorderError])

  useEffect(() => {
    if (!audioBlob) {
      return
    }

    let cancelled = false

    const parseAudio = async () => {
      setState('processing')
      setErrorMessage(undefined)

      try {
        const response = await parseVoiceAsync(audioBlob)
        if (cancelled || !response) {
          return
        }

        setResult(response)
        setState('result')
      } catch (error) {
        if (cancelled) {
          return
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Unable to parse your brew description.',
        )
        setState('error')
      }
    }

    void parseAudio()

    return () => {
      cancelled = true
    }
  }, [audioBlob])

  const matchedFields = useMemo(() => {
    if (!result) {
      return []
    }

    const fields: Array<{ label: string; value: string }> = []
    if (result.beanName) fields.push({ label: 'Bean', value: result.beanName })
    if (result.brewerName)
      fields.push({ label: 'Brewer', value: result.brewerName })
    if (result.grinderName)
      fields.push({ label: 'Grinder', value: result.grinderName })
    if (result.recipeName)
      fields.push({ label: 'Recipe', value: result.recipeName })
    if (result.accessoryNames?.length) {
      fields.push({
        label: 'Accessories',
        value: result.accessoryNames.join(', '),
      })
    }
    if (result.dose != null) fields.push({ label: 'Dose', value: `${result.dose} g` })
    if (result.waterAmount != null) {
      fields.push({ label: 'Water', value: `${result.waterAmount} ml` })
    }
    if (result.waterTemperature != null) {
      fields.push({
        label: 'Temperature',
        value: `${result.waterTemperature} C`,
      })
    }
    if (result.grindSize)
      fields.push({ label: 'Grind size', value: result.grindSize })
    if (result.brewTimeSeconds != null) {
      const minutes = Math.floor(result.brewTimeSeconds / 60)
      const seconds = result.brewTimeSeconds % 60
      fields.push({
        label: 'Brew time',
        value: `${minutes}:${seconds.toString().padStart(2, '0')}`,
      })
    }
    if (result.rating != null)
      fields.push({ label: 'Rating', value: `${result.rating}/5` })
    if (result.notes) fields.push({ label: 'Notes', value: result.notes })
    if (result.adjustmentIdeas) {
      fields.push({
        label: 'Adjustment ideas',
        value: result.adjustmentIdeas,
      })
    }

    return fields
  }, [result])

  const start = async () => {
    const recordingStarted = await startRecording()
    if (recordingStarted) {
      setState('recording')
    }
  }

  const stop = () => {
    stopRecording()
  }

  const retry = () => {
    resetRecorder()
    setErrorMessage(undefined)
    setResult(undefined)
    setState('idle')
    resetParseVoice()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Voice brew log</DialogTitle>
          <DialogDescription>
            Describe your brew and we&apos;ll fill the form for you.
          </DialogDescription>
        </DialogHeader>

        {state === 'idle' && (
          <div className="flex flex-col items-center justify-center gap-4 py-4 text-center">
            <div className="rounded-full bg-muted p-4">
              <Mic className="size-8" />
            </div>
            <p className="text-sm text-muted-foreground">
              Tap to start recording your brew description.
            </p>
            <Button onClick={() => void start()} disabled={!isSupported}>
              Start recording
            </Button>
            {!isSupported && (
              <p className="text-xs text-destructive">
                Audio recording is not supported in this browser.
              </p>
            )}
          </div>
        )}

        {state === 'recording' && (
          <div className="flex flex-col items-center justify-center gap-4 py-4 text-center">
            <div className="rounded-full bg-red-100 p-4 text-red-700 animate-pulse">
              <Mic className="size-8" />
            </div>
            <p className="text-sm font-medium">Listening...</p>
            <Button variant="destructive" onClick={stop}>
              <Square className="mr-2 size-4" />
              Stop
            </Button>
          </div>
        )}

        {state === 'processing' && (
          <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Processing your brew description...
            </p>
          </div>
        )}

        {state === 'result' && result && (
          <div className="space-y-4">
            <blockquote className="border-l-2 pl-3 text-sm text-muted-foreground">
              {result.transcript?.trim() || 'No transcript returned.'}
            </blockquote>

            {matchedFields.length > 0 ? (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Matched fields</h4>
                <ul className="space-y-1 text-sm">
                  {matchedFields.map((field) => (
                    <li key={field.label}>
                      <span className="font-medium">{field.label}:</span> {field.value}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No fields were matched from this recording.
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
              {errorMessage ?? 'Something went wrong while parsing audio.'}
            </p>
            <Button variant="outline" onClick={retry}>
              Try again
            </Button>
          </div>
        )}

        {state === 'result' && result && (
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false)
              }}
            >
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
