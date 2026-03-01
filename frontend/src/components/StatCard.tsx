type StatCardProps = {
  label: string
  value: string
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="bg-muted/20 space-y-1 rounded-md border p-3">
      <p className="text-muted-foreground text-xs uppercase">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}
