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
  { labelWidth: 'w-28', valueWidth: 'w-32' },
  { labelWidth: 'w-20', valueWidth: 'w-28' },
  { labelWidth: 'w-14', valueWidth: 'w-24' },
  { labelWidth: 'w-20', valueWidth: 'w-16' },
  { labelWidth: 'w-14', valueWidth: 'w-20' },
]

export function BrewLogCardSkeleton({ className }: BrewLogCardSkeletonProps) {
  return (
    <Card className={cn('h-full gap-3 py-3', className)}>
      <CardHeader className="space-y-1 px-4 pt-1.5 pb-0">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-28" />
      </CardHeader>
      <CardContent className="px-4 pt-0">
        <div className="space-y-1.5">
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
