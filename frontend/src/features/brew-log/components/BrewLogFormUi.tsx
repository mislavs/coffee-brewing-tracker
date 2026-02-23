type FieldErrorTextProps = {
  message?: string
}

export function FieldErrorText({ message }: FieldErrorTextProps) {
  if (!message) {
    return null
  }

  return <p className="text-sm text-destructive">{message}</p>
}

type SectionHeaderProps = {
  title: string
  description: string
}

export function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  )
}
