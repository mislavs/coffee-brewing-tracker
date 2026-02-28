import { useCallback, useEffect, useRef, useState } from 'react'

type UseAudioRecorderResult = {
  isRecording: boolean
  isSupported: boolean
  audioLevel: number
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
  const [audioLevel, setAudioLevel] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | undefined>(undefined)
  const [error, setError] = useState<string | undefined>(undefined)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const levelAnimationFrameRef = useRef<number | null>(null)

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

  const stopAudioAnalysis = useCallback(() => {
    if (typeof window !== 'undefined' && levelAnimationFrameRef.current != null) {
      window.cancelAnimationFrame(levelAnimationFrameRef.current)
    }
    levelAnimationFrameRef.current = null

    sourceRef.current?.disconnect()
    sourceRef.current = null
    analyserRef.current = null

    const audioContext = audioContextRef.current
    audioContextRef.current = null
    if (audioContext && audioContext.state !== 'closed') {
      void audioContext.close()
    }

    setAudioLevel(0)
  }, [])

  const startAudioAnalysis = useCallback(
    (stream: MediaStream) => {
      if (typeof window === 'undefined' || typeof window.AudioContext === 'undefined') {
        return
      }

      stopAudioAnalysis()

      const audioContext = new window.AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()

      analyser.fftSize = 256
      source.connect(analyser)

      const data = new Uint8Array(analyser.frequencyBinCount)

      audioContextRef.current = audioContext
      sourceRef.current = source
      analyserRef.current = analyser

      const updateAudioLevel = () => {
        analyser.getByteTimeDomainData(data)

        let sumSquares = 0
        for (const sample of data) {
          const normalizedSample = sample / 128 - 1
          sumSquares += normalizedSample * normalizedSample
        }

        const rms = Math.sqrt(sumSquares / data.length)
        setAudioLevel(Math.min(1, rms * 4))

        levelAnimationFrameRef.current = window.requestAnimationFrame(updateAudioLevel)
      }

      updateAudioLevel()
    },
    [stopAudioAnalysis],
  )

  const reset = useCallback(() => {
    setAudioBlob(undefined)
    setError(undefined)
    setAudioLevel(0)
  }, [])

  const stopRecording = useCallback(() => {
    const recorder = recorderRef.current
    if (!recorder) {
      setIsRecording(false)
      stopStream()
      stopAudioAnalysis()
      return
    }

    if (recorder.state !== 'inactive') {
      recorder.stop()
    } else {
      stopStream()
      stopAudioAnalysis()
    }

    setIsRecording(false)
    stopAudioAnalysis()
  }, [stopAudioAnalysis, stopStream])

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
      startAudioAnalysis(stream)

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
        setIsRecording(false)
        stopAudioAnalysis()
      }

      recorder.onstop = () => {
        const recordedBlob = new Blob(chunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        })

        if (recordedBlob.size > 0) {
          setAudioBlob(recordedBlob)
        }

        chunksRef.current = []
        stopAudioAnalysis()
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
      stopAudioAnalysis()
      stopStream()
      return false
    }
  }, [isSupported, startAudioAnalysis, stopAudioAnalysis, stopStream])

  useEffect(() => {
    return () => {
      const recorder = recorderRef.current
      if (recorder && recorder.state !== 'inactive') {
        recorder.stop()
      } else {
        stopStream()
      }
      stopAudioAnalysis()
    }
  }, [stopAudioAnalysis, stopStream])

  return {
    isRecording,
    isSupported,
    audioLevel,
    audioBlob,
    error,
    startRecording,
    stopRecording,
    reset,
  }
}
