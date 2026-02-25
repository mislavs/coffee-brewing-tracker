import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type BrewLogCardSkeletonProps = {
  className?: string
}

const detailRowWidths: Array<{ labelWidth: string; valueWidth: string }> = [
  { labelWidth: 'w-14', valueWidth: 'w-24' },
  { labelWidth: 'w-16', valueWidth: 'w-20' },
  { labelWidth: 'w-20', valueWidth: 'w-28' },
  { labelWidth: 'w-14', valueWidth: 'w-24' },
  { labelWidth: 'w-12', valueWidth: 'w-16' },
  { labelWidth: 'w-14', valueWidth: 'w-20' },
]

export function BrewLogCardSkeleton({ className }: BrewLogCardSkeletonProps) {
  return (
    <Card className={cn('h-full py-4', className)}>
      <CardHeader className="space-y-1 px-3 pt-2.5 pb-0.5">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-4 w-4/5" />
      </CardHeader>
      <CardContent className="px-4 pt-0">
        <div className="space-y-2 rounded-md border bg-muted/20 px-2.5 py-1">
          {detailRowWidths.map((widths, index) => (
            <div key={index} className="flex gap-3">
              <Skeleton className={cn('h-3', widths.labelWidth)} />
              <Skeleton className={cn('h-3', widths.valueWidth)} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
