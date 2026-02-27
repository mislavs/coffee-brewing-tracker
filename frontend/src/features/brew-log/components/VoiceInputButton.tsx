import { Mic } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFeatures } from '@/features/brew-log/hooks/useFeatures'

type VoiceInputButtonProps = {
  onClick: () => void
  disabled?: boolean
}

export function VoiceInputButton({ onClick, disabled = false }: VoiceInputButtonProps) {
  const { data: features } = useFeatures()

  if (!features?.voiceBrewLogParsing) {
    return null
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={disabled}
    >
      <Mic className="size-4" />
      Dictate brew
    </Button>
  )
}
