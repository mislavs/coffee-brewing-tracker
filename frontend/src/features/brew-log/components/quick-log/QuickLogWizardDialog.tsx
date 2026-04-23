import { useState, type ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import type { Guid } from '@/lib/api-types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useSetBeanAvailability } from '@/features/beans/hooks/useSetBeanAvailability'
import {
  brewLogFormSchema,
  normalizeBrewLogFormValues,
  type BrewLogFormInput,
  type BrewLogFormValues,
} from '@/features/brew-log/brewLogFormSchema'
import {
  BrewLogLowStockPromptDialog,
} from '@/features/brew-log/brewLogLowStock'
import { getBrewLogLowStockPrompt } from '@/features/brew-log/brewLogLowStockUtils'
import { createInitialBrewLogValues } from '@/features/brew-log/brewLogFormDefaults'
import { FieldErrorText } from '@/features/brew-log/components/BrewLogFormUi'
import { AccessoriesStep } from '@/features/brew-log/components/quick-log/AccessoriesStep'
import { BeanStep } from '@/features/brew-log/components/quick-log/BeanStep'
import { BrewerStep } from '@/features/brew-log/components/quick-log/BrewerStep'
import { BrewParametersStep } from '@/features/brew-log/components/quick-log/BrewParametersStep'
import { BrewTimeStep } from '@/features/brew-log/components/quick-log/BrewTimeStep'
import { GrinderStep } from '@/features/brew-log/components/quick-log/GrinderStep'
import { NotesStep } from '@/features/brew-log/components/quick-log/NotesStep'
import { RatingStep } from '@/features/brew-log/components/quick-log/RatingStep'
import { RecipeStep } from '@/features/brew-log/components/quick-log/RecipeStep'
import { WizardShell } from '@/features/brew-log/components/quick-log/WizardShell'
import { useResetRecipeOnBrewerChange } from '@/features/brew-log/components/useResetRecipeOnBrewerChange'
import { useCreateBrewLog } from '@/features/brew-log/hooks/useCreateBrewLog'
import { applyBrewLogFormServerErrors } from '@/features/brew-log/mapApiValidationErrors'
import {
  extractValidationPayload,
  normalizeApiFieldName,
} from '@/lib/mapApiValidationErrors'

type QuickLogWizardDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type StepDefinition = {
  title: string
  fields: Array<keyof BrewLogFormValues>
  skippable: boolean
  autoAdvance: boolean
  validationAliases?: string[]
  render: () => ReactNode
}

function buildValidationFieldToStepIndex(stepDefinitions: StepDefinition[]) {
  const validationFieldToStepIndex: Record<string, number> = {}

  stepDefinitions.forEach((stepDefinition, stepIndex) => {
    stepDefinition.fields.forEach((fieldName) => {
      validationFieldToStepIndex[fieldName] = stepIndex
    })

    stepDefinition.validationAliases?.forEach((fieldName) => {
      validationFieldToStepIndex[fieldName] = stepIndex
    })
  })

  return validationFieldToStepIndex
}

export function QuickLogWizardDialog({
  open,
  onOpenChange,
}: QuickLogWizardDialogProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [maxReachedStep, setMaxReachedStep] = useState(0)
  const [lowStockPrompt, setLowStockPrompt] = useState<{
    beanId: Guid
    remainingQuantity: number
  } | null>(null)
  const form = useForm<BrewLogFormInput, undefined, BrewLogFormValues>({
    resolver: zodResolver(brewLogFormSchema),
    defaultValues: createInitialBrewLogValues(),
  })
  const watchedBrewerId = useWatch({ control: form.control, name: 'brewerId' }) ?? ''
  const { mutateAsync, isPending } = useCreateBrewLog()
  const { mutateAsync: setBeanAvailability, isPending: isSettingAvailability } =
    useSetBeanAvailability()
  const isBusy = isPending || isSettingAvailability

  useResetRecipeOnBrewerChange(form, watchedBrewerId, '')

  const clearRootServerError = () => {
    form.clearErrors('root.serverError' as never)
  }

  const goToStep = (stepIndex: number) => {
    if (stepIndex < 0 || stepIndex > maxReachedStep) {
      return
    }

    clearRootServerError()
    setCurrentStep(stepIndex)
  }

  const goNext = (nextStepIndex?: number) => {
    const targetStep = nextStepIndex ?? Math.min(currentStep + 1, stepDefinitions.length - 1)
    setMaxReachedStep((previous) => Math.max(previous, targetStep))
    setCurrentStep(targetStep)
  }

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isBusy) {
      return
    }

    onOpenChange(nextOpen)
  }

  const closeWizard = () => {
    setLowStockPrompt(null)
    onOpenChange(false)
  }

  const handleValidationErrorJump = (error: unknown) => {
    const payload = extractValidationPayload(error)
    const fields = Object.keys(payload?.errors ?? {})

    for (const fieldName of fields) {
      const normalizedFieldName = normalizeApiFieldName(fieldName)
      const stepIndex = validationFieldToStepIndex[normalizedFieldName]

      if (stepIndex !== undefined) {
        setCurrentStep(stepIndex)
        setMaxReachedStep((previous) => Math.max(previous, stepIndex))
        return
      }
    }
  }

  const handleAutoAdvanceField = (
    fieldName: keyof BrewLogFormValues,
    value: string | number | string[] | undefined,
  ) => {
    form.clearErrors(fieldName)
    clearRootServerError()
    form.setValue(fieldName as never, value as never, {
      shouldDirty: true,
      shouldValidate: true,
    })
    goNext()
  }

  const handleBrewerSelect = (brewerId: string) => {
    form.clearErrors(['brewerId', 'recipeId'])
    clearRootServerError()
    form.setValue('brewerId', brewerId, {
      shouldDirty: true,
      shouldValidate: true,
    })
    setMaxReachedStep(2)
    setCurrentStep(2)
  }

  const handleRatingSelect = (rating: number | undefined) => {
    form.clearErrors('rating')
    clearRootServerError()
    form.setValue('rating', rating, {
      shouldDirty: true,
      shouldValidate: true,
    })

    if (typeof rating === 'number') {
      goNext()
    }
  }

  const stepDefinitions: StepDefinition[] = [
    {
      title: 'Bean',
      fields: ['beanId'],
      skippable: false,
      autoAdvance: true,
      render: () => (
        <BeanStep
          form={form}
          disabled={isBusy}
          onSelect={(beanId) => handleAutoAdvanceField('beanId', beanId)}
        />
      ),
    },
    {
      title: 'Brewer',
      fields: ['brewerId'],
      skippable: false,
      autoAdvance: true,
      render: () => (
        <BrewerStep
          form={form}
          disabled={isBusy}
          onSelect={handleBrewerSelect}
        />
      ),
    },
    {
      title: 'Recipe',
      fields: ['recipeId'],
      skippable: false,
      autoAdvance: true,
      render: () => (
        <RecipeStep
          form={form}
          disabled={isBusy}
          onSelect={(recipeId) => handleAutoAdvanceField('recipeId', recipeId)}
        />
      ),
    },
    {
      title: 'Grinder',
      fields: ['grinderId'],
      skippable: false,
      autoAdvance: true,
      render: () => (
        <GrinderStep
          form={form}
          disabled={isBusy}
          onSelect={(grinderId) => handleAutoAdvanceField('grinderId', grinderId)}
        />
      ),
    },
    {
      title: 'Accessories',
      fields: ['accessoryIds'],
      skippable: true,
      autoAdvance: false,
      render: () => <AccessoriesStep form={form} disabled={isBusy} />,
    },
    {
      title: 'Parameters',
      fields: ['dose', 'waterAmount', 'waterTemperature', 'grindSize'],
      skippable: false,
      autoAdvance: false,
      render: () => <BrewParametersStep form={form} disabled={isBusy} />,
    },
    {
      title: 'Brew time',
      fields: ['brewTimeMinutes', 'brewTimeSeconds'],
      skippable: true,
      autoAdvance: false,
      render: () => <BrewTimeStep form={form} disabled={isBusy} />,
    },
    {
      title: 'Rating',
      fields: ['rating'],
      skippable: true,
      autoAdvance: true,
      render: () => (
        <RatingStep
          form={form}
          disabled={isBusy}
          onSelect={handleRatingSelect}
        />
      ),
    },
    {
      title: 'Notes',
      fields: ['tastingNotes', 'adjustmentIdeas'],
      validationAliases: ['notes'],
      skippable: true,
      autoAdvance: false,
      render: () => <NotesStep form={form} disabled={isBusy} />,
    },
  ]
  const stepTitles = stepDefinitions.map((stepDefinition) => stepDefinition.title)
  const currentStepDefinition = stepDefinitions[currentStep]
  const isLastStep = currentStep === stepDefinitions.length - 1
  const validationFieldToStepIndex = buildValidationFieldToStepIndex(stepDefinitions)

  const handleNext = async () => {
    clearRootServerError()
    const isValid = await form.trigger(currentStepDefinition.fields)
    if (!isValid) {
      return
    }

    goNext()
  }

  const handleSubmit = form.handleSubmit(async (values) => {
    clearRootServerError()

    try {
      const request = normalizeBrewLogFormValues(values)
      const response = await mutateAsync(request)
      const lowStockPrompt = getBrewLogLowStockPrompt(request, response)

      if (lowStockPrompt) {
        setLowStockPrompt(lowStockPrompt)
        return
      }

      closeWizard()
    } catch (error) {
      applyBrewLogFormServerErrors(error, form.setError)
      handleValidationErrorJump(error)
    }
  })

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogContent
          className="top-[5vh] max-h-[90vh] translate-y-0 overflow-y-auto sm:max-w-3xl"
          showCloseButton={!isBusy}
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle>Quick Log</DialogTitle>
          </DialogHeader>

          <WizardShell
            currentStep={currentStep}
            stepTitles={stepTitles}
            maxReachedStep={maxReachedStep}
            onStepSelect={goToStep}
            footer={
              <>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={currentStep === 0 || isBusy}
                    onClick={() => setCurrentStep((previous) => Math.max(previous - 1, 0))}
                  >
                    Back
                  </Button>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  {currentStepDefinition.skippable && !isLastStep ? (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isBusy}
                      onClick={() => goNext()}
                    >
                      Skip
                    </Button>
                  ) : null}

                  {!isLastStep && !currentStepDefinition.autoAdvance ? (
                    <Button type="button" disabled={isBusy} onClick={() => void handleNext()}>
                      Next
                    </Button>
                  ) : null}

                  {isLastStep ? (
                    <Button
                      type="button"
                      disabled={isBusy}
                      onClick={() => void handleSubmit()}
                    >
                      {isPending ? 'Saving...' : 'Log brew'}
                    </Button>
                  ) : null}
                </div>
              </>
            }
          >
            {currentStepDefinition.render()}
            <FieldErrorText message={form.formState.errors.root?.serverError?.message} />
          </WizardShell>
        </DialogContent>
      </Dialog>

      <BrewLogLowStockPromptDialog
        prompt={lowStockPrompt}
        isPending={isSettingAvailability}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !isSettingAvailability) {
            closeWizard()
          }
        }}
        onMarkUnavailable={() => {
          if (!lowStockPrompt || isSettingAvailability) {
            return
          }

          void (async () => {
            await setBeanAvailability({
              id: lowStockPrompt.beanId,
              isAvailable: false,
            })
            closeWizard()
          })()
        }}
      />
    </>
  )
}
