import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { BrewLogLowStockPrompt } from '@/features/brew-log/brewLogLowStockUtils'

type BrewLogLowStockPromptDialogProps = {
  prompt: BrewLogLowStockPrompt | null
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onKeepAvailable?: () => void
  onMarkUnavailable: () => void
}

export function BrewLogLowStockPromptDialog({
  prompt,
  isPending,
  onOpenChange,
  onKeepAvailable,
  onMarkUnavailable,
}: BrewLogLowStockPromptDialogProps) {
  return (
    <AlertDialog open={Boolean(prompt)} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Mark bean as unavailable?</AlertDialogTitle>
          <AlertDialogDescription>
            {`Only ${prompt?.remainingQuantity.toFixed(1) ?? '0.0'}g remains for this bean. Do you want to mark it unavailable?`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault()
              if (isPending) {
                return
              }

              onKeepAvailable?.()
              onOpenChange(false)
            }}
          >
            Keep available
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault()
              if (isPending) {
                return
              }

              onMarkUnavailable()
            }}
          >
            {isPending ? 'Saving...' : 'Mark unavailable'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
