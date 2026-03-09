import { useEffect, useMemo, useRef, useState } from 'react'
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
  const shouldParseAudioRef = useRef(true)
  const wasOpenRef = useRef(false)
  const [result, setResult] = useState<ParseVoiceBrewLogResponse | undefined>(
    undefined,
  )
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)

  const {
    isRecording,
    isSupported,
    audioLevel,
    audioBlob,
    error: recorderError,
    startRecording,
    stopRecording,
    reset: resetRecorder,
  } = useAudioRecorder()
  const { mutateAsync: parseVoiceAsync, reset: resetParseVoice } =
    useParseVoiceBrewLog()

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      shouldParseAudioRef.current = true
      queueMicrotask(() => {
        setState('idle')
        setResult(undefined)
        setErrorMessage(undefined)
      })
      resetRecorder()
      resetParseVoice()
    }

    if (!open && wasOpenRef.current) {
      if (isRecording) {
        stopRecording()
      }

      resetRecorder()
      queueMicrotask(() => {
        setResult(undefined)
        setErrorMessage(undefined)
      })
      resetParseVoice()
    }

    wasOpenRef.current = open
  }, [isRecording, open, resetParseVoice, resetRecorder, stopRecording])

  useEffect(() => {
    if (!open || !audioBlob) {
      return
    }

    if (!shouldParseAudioRef.current) {
      resetRecorder()
      shouldParseAudioRef.current = true
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
  }, [audioBlob, open, parseVoiceAsync, resetRecorder])

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
    if (result.grindSize != null) {
      fields.push({ label: 'Grind size', value: `${result.grindSize}` })
    }
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
    shouldParseAudioRef.current = true
    const recordingStarted = await startRecording()
    if (recordingStarted) {
      setState('recording')
    }
  }

  const stop = () => {
    shouldParseAudioRef.current = true
    stopRecording()
  }

  const cancel = () => {
    shouldParseAudioRef.current = false
    stopRecording()
    onOpenChange(false)
  }

  const viewState: VoiceDialogState = recorderError ? 'error' : state
  const currentErrorMessage = recorderError ?? errorMessage

  const isSpeaking = audioLevel > 0.05
  const micBubbleScale = isSpeaking
    ? 1 + Math.min(0.14, Math.max(0, audioLevel - 0.05) * 0.3)
    : 1

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

        {viewState === 'idle' && (
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

        {viewState === 'recording' && (
          <div className="flex flex-col items-center justify-center gap-4 py-4 text-center">
            <div className="relative flex size-16 items-center justify-center">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 transition-opacity duration-700 ease-out"
                style={{ opacity: isSpeaking ? 1 : 0 }}
              >
                <>
                  <span
                    className="pointer-events-none absolute inset-0 rounded-full border-2 border-red-400/70 bg-transparent"
                    style={{
                      animation: 'ripple 2.4s cubic-bezier(0.22, 1, 0.36, 1) infinite',
                    }}
                  />
                  <span
                    className="pointer-events-none absolute inset-0 rounded-full border-2 border-red-400/70 bg-transparent"
                    style={{
                      animation:
                        'ripple 2.4s cubic-bezier(0.22, 1, 0.36, 1) 0.8s infinite',
                    }}
                  />
                  <span
                    className="pointer-events-none absolute inset-0 rounded-full border-2 border-red-400/70 bg-transparent"
                    style={{
                      animation:
                        'ripple 2.4s cubic-bezier(0.22, 1, 0.36, 1) 1.6s infinite',
                    }}
                  />
                </>
              </div>
              <div
                className="relative z-10 rounded-full bg-red-100 p-4 text-red-700 transition-transform duration-150 ease-out"
                style={{
                  transform: `scale(${micBubbleScale})`,
                  willChange: 'transform',
                }}
              >
                <Mic className="size-8" />
              </div>
            </div>
            <p className="text-sm font-medium">Listening...</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={cancel}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={stop}>
                <Square className="mr-2 size-4" />
                Stop
              </Button>
            </div>
          </div>
        )}

        {viewState === 'processing' && (
          <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Processing your brew description...
            </p>
          </div>
        )}

        {viewState === 'result' && result && (
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

        {viewState === 'error' && (
          <div className="flex flex-col items-center justify-center gap-4 py-4 text-center">
            <AlertTriangle className="size-8 text-destructive" />
            <p className="text-sm text-destructive">
              {currentErrorMessage ?? 'Something went wrong while parsing audio.'}
            </p>
            <Button variant="outline" onClick={retry}>
              Try again
            </Button>
          </div>
        )}

        {viewState === 'result' && result && (
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
