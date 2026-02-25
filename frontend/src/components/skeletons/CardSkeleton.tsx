import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type CardSkeletonProps = {
  className?: string
  badgeCount?: number
}

const badgeWidths = ['w-16', 'w-20', 'w-24']

export function CardSkeleton({ className, badgeCount = 2 }: CardSkeletonProps) {
  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="space-y-3">
        <Skeleton className="h-28 w-full rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-3 w-2/5" />
        </div>
      </CardHeader>
      <CardContent className="flex gap-2">
        {Array.from({ length: badgeCount }).map((_, index) => (
          <Skeleton
            key={`card-badge-skeleton-${index}`}
            className={cn('h-5 rounded-full', badgeWidths[index % badgeWidths.length])}
          />
        ))}
      </CardContent>
    </Card>
  )
}
