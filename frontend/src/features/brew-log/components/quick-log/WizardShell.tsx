import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type WizardShellProps = {
  title: string
  description?: string
  currentStep: number
  totalSteps: number
  stepTitles: string[]
  maxReachedStep: number
  onStepSelect: (stepIndex: number) => void
  children: ReactNode
  footer: ReactNode
}

export function WizardShell({
  title,
  description,
  currentStep,
  totalSteps,
  stepTitles,
  maxReachedStep,
  onStepSelect,
  children,
  footer,
}: WizardShellProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            Step {currentStep + 1} of {totalSteps}
          </p>
          <h2 className="text-xl font-semibold">{title}</h2>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
          {stepTitles.map((stepTitle, index) => {
            const isCurrent = index === currentStep
            const isReachable = index <= maxReachedStep

            return (
              <Button
                key={stepTitle}
                type="button"
                size="sm"
                variant={isCurrent ? 'default' : 'outline'}
                disabled={!isReachable || isCurrent}
                className={cn(
                  'max-w-full shrink-0',
                  !isReachable && 'hidden sm:inline-flex sm:opacity-60',
                )}
                onClick={() => onStepSelect(index)}
              >
                <span className="max-w-28 truncate sm:max-w-none">{stepTitle}</span>
              </Button>
            )
          })}
        </div>
      </div>

      <div className="space-y-4">{children}</div>

      <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
        {footer}
      </div>
    </div>
  )
}
