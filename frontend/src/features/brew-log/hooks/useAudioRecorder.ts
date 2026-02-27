import { useCallback, useEffect, useRef, useState } from 'react'

type UseAudioRecorderResult = {
  isRecording: boolean
  isSupported: boolean
  audioBlob: Blob | undefined
  error: string | undefined
  startRecording: () => Promise<boolean>
  stopRecording: () => void
  reset: () => void
}

function getRecorderMimeType() {
  if (typeof MediaRecorder === 'undefined') {
    return undefined
  }

  return MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : undefined
}

export function useAudioRecorder(): UseAudioRecorderResult {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | undefined>(undefined)
  const [error, setError] = useState<string | undefined>(undefined)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<BlobPart[]>([])

  const isSupported =
    typeof navigator !== 'undefined' &&
    typeof MediaRecorder !== 'undefined' &&
    Boolean(navigator.mediaDevices?.getUserMedia)

  const stopStream = useCallback(() => {
    const stream = streamRef.current
    if (!stream) {
      return
    }

    for (const track of stream.getTracks()) {
      track.stop()
    }

    streamRef.current = null
  }, [])

  const reset = useCallback(() => {
    setAudioBlob(undefined)
    setError(undefined)
  }, [])

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current
    if (!recorder) {
      setIsRecording(false)
      stopStream()
      return
    }

    if (recorder.state !== 'inactive') {
      recorder.stop()
    } else {
      stopStream()
    }

    setIsRecording(false)
  }, [stopStream])

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setError('Audio recording is not supported in this browser.')
      return false
    }

    setAudioBlob(undefined)
    setError(undefined)
    chunksRef.current = []

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mimeType = getRecorderMimeType()
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream)

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      recorder.onerror = () => {
        setError('Unable to record audio.')
      }

      recorder.onstop = () => {
        const recordedBlob = new Blob(chunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        })

        if (recordedBlob.size > 0) {
          setAudioBlob(recordedBlob)
        }

        chunksRef.current = []
        stopStream()
      }

      recorderRef.current = recorder
      recorder.start()
      setIsRecording(true)
      return true
    } catch (recordingError) {
      setError(
        recordingError instanceof Error
          ? recordingError.message
          : 'Unable to access your microphone.',
      )
      stopStream()
      return false
    }
  }, [isSupported, stopStream])

  useEffect(() => {
    return () => {
      const recorder = recorderRef.current
      if (recorder && recorder.state !== 'inactive') {
        recorder.stop()
      } else {
        stopStream()
      }
    }
  }, [stopStream])

  return {
    isRecording,
    isSupported,
    audioBlob,
    error,
    startRecording,
    stopRecording,
    reset,
  }
}
