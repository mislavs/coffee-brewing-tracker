import type { ReactNode } from 'react'
import { CheckIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type WizardShellProps = {
  currentStep: number
  stepTitles: string[]
  maxReachedStep: number
  onStepSelect: (stepIndex: number) => void
  children: ReactNode
  footer: ReactNode
}

export function WizardShell({
  currentStep,
  stepTitles,
  maxReachedStep,
  onStepSelect,
  children,
  footer,
}: WizardShellProps) {
  const totalSteps = stepTitles.length
  const mobileStepIndexes = [currentStep - 1, currentStep, currentStep + 1]
    .filter((stepIndex) => stepIndex >= 0 && stepIndex < totalSteps)
  const firstMobileStepIndex = mobileStepIndexes[0] ?? 0
  const lastMobileStepIndex =
    mobileStepIndexes[mobileStepIndexes.length - 1] ?? totalSteps - 1
  const hasHiddenBefore = firstMobileStepIndex > 0
  const hasHiddenAfter = lastMobileStepIndex < totalSteps - 1

  return (
    <div className="space-y-6">
      <nav aria-label="Quick log progress" className="sm:hidden">
        <ol className="grid grid-cols-[auto_repeat(3,minmax(0,1fr))_auto] items-center gap-1">
          <li
            aria-hidden
            className="w-3 text-center text-sm font-semibold text-muted-foreground"
          >
            {hasHiddenBefore ? '<' : null}
          </li>
          {mobileStepIndexes.map((stepIndex) => {
            const isCurrent = stepIndex === currentStep
            const isReached = stepIndex <= maxReachedStep
            const isLocked = !isReached
            const stepTitle = stepTitles[stepIndex] ?? ''

            return (
              <li key={stepTitle} className="min-w-0">
                <button
                  type="button"
                  disabled={isLocked || isCurrent}
                  aria-current={isCurrent ? 'step' : undefined}
                  onClick={() => onStepSelect(stepIndex)}
                  className={cn(
                    'w-full min-w-0 rounded-full px-2 py-1.5 text-center text-xs transition-colors',
                    'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                    isCurrent &&
                      'cursor-default bg-primary text-primary-foreground shadow-sm',
                    !isCurrent &&
                      isReached &&
                      'text-muted-foreground hover:bg-muted hover:text-foreground',
                    isLocked &&
                      'cursor-not-allowed text-muted-foreground/60',
                  )}
                >
                  <span className="block truncate">{stepTitle}</span>
                </button>
              </li>
            )
          })}
          {Array.from({ length: 3 - mobileStepIndexes.length }).map((_, index) => (
            <li key={`mobile-step-placeholder-${index}`} aria-hidden />
          ))}
          <li
            aria-hidden
            className="w-3 text-center text-sm font-semibold text-muted-foreground"
          >
            {hasHiddenAfter ? '>' : null}
          </li>
        </ol>
      </nav>

      <nav
        aria-label="Quick log progress"
        className="hidden -mx-1 px-1 sm:block sm:overflow-visible sm:pb-0"
      >
        <ol className="flex min-w-[34rem] items-start sm:min-w-0">
          {stepTitles.map((stepTitle, index) => {
            const isCurrent = index === currentStep
            const isReached = index <= maxReachedStep
            const isCompleted = isReached && !isCurrent
            const isLocked = !isReached
            const isFirst = index === 0
            const isLast = index === totalSteps - 1
            const isLeftConnectorActive = !isFirst && index <= maxReachedStep
            const isRightConnectorActive = !isLast && index < maxReachedStep
            const labelId = `quick-log-step-${index}-label`

            return (
              <li
                key={stepTitle}
                className="flex min-w-0 flex-1 flex-col items-center"
              >
                <div className="flex w-full items-center">
                  <span
                    aria-hidden
                    className={cn(
                      'h-0.5 flex-1 transition-colors',
                      isFirst
                        ? 'bg-transparent'
                        : isLeftConnectorActive
                          ? 'bg-primary'
                          : 'bg-border',
                    )}
                  />

                  <button
                    type="button"
                    disabled={isLocked || isCurrent}
                    aria-labelledby={labelId}
                    aria-current={isCurrent ? 'step' : undefined}
                    onClick={() => onStepSelect(index)}
                    className={cn(
                      'relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all',
                      'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                      isCurrent &&
                        'cursor-default border-primary bg-primary text-primary-foreground shadow-sm ring-4 ring-primary/25',
                      isCompleted &&
                        'cursor-pointer border-primary bg-primary text-primary-foreground hover:bg-primary/90',
                      isLocked &&
                        'cursor-not-allowed border-border bg-background text-muted-foreground/60',
                    )}
                  >
                    {isCompleted ? (
                      <CheckIcon
                        aria-hidden
                        className="size-4"
                        strokeWidth={3}
                      />
                    ) : (
                      <span aria-hidden>{index + 1}</span>
                    )}
                  </button>

                  <span
                    aria-hidden
                    className={cn(
                      'h-0.5 flex-1 transition-colors',
                      isLast
                        ? 'bg-transparent'
                        : isRightConnectorActive
                          ? 'bg-primary'
                          : 'bg-border',
                    )}
                  />
                </div>

                <span
                  id={labelId}
                  className={cn(
                    'mt-2 max-w-full truncate px-1 pb-0.5 text-center text-xs transition-colors',
                    isCurrent && 'font-semibold text-foreground',
                    isCompleted && 'text-muted-foreground',
                    isLocked && 'text-muted-foreground/60',
                  )}
                >
                  {stepTitle}
                </span>
              </li>
            )
          })}
        </ol>
      </nav>

      <div className="space-y-4">{children}</div>

      <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
        {footer}
      </div>
    </div>
  )
}
