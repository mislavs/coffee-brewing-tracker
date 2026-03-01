type FieldErrorTextProps = {
  message?: string
}

export function FieldErrorText({ message }: FieldErrorTextProps) {
  if (!message) {
    return null
  }

  return <p className="text-sm text-destructive">{message}</p>
}
