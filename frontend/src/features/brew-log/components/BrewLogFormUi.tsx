export { FieldErrorText } from '@/components/FieldErrorText'

type SectionHeaderProps = {
  title: string
}

export function SectionHeader({ title }: SectionHeaderProps) {
  return <h3 className="text-base font-semibold">{title}</h3>
}
