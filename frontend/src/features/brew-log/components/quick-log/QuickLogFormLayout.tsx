import type { ReactNode } from 'react'
import { FieldErrorText } from '@/features/brew-log/components/BrewLogFormUi'
import { cn } from '@/lib/utils'

type QuickLogFieldGridProps = {
  children: ReactNode
  className?: string
}

export function QuickLogFieldGrid({
  children,
  className,
}: QuickLogFieldGridProps) {
  return <div className={cn('grid gap-4 sm:grid-cols-2', className)}>{children}</div>
}

type QuickLogFieldProps = {
  label: string
  htmlFor?: string
  error?: string
  className?: string
  children: ReactNode
}

export function QuickLogField({
  label,
  htmlFor,
  error,
  className,
  children,
}: QuickLogFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
      <FieldErrorText message={error} />
    </div>
  )
}

type QuickLogDisplayFieldProps = {
  label: string
  className?: string
  children: ReactNode
}

export function QuickLogDisplayField({
  label,
  className,
  children,
}: QuickLogDisplayFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  )
}
