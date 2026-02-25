import {
  TableCell,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

type TableRowSkeletonProps = {
  columns: number
  rowCount?: number
  columnWidthClasses?: string[]
}

const fallbackWidthPattern = ['w-2/3', 'w-1/2', 'w-3/4', 'w-5/6']

export function TableRowSkeleton({
  columns,
  rowCount = 5,
  columnWidthClasses = [],
}: TableRowSkeletonProps) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <TableRow key={`skeleton-row-${rowIndex}`}>
          {Array.from({ length: columns }).map((_, columnIndex) => (
            <TableCell key={`skeleton-cell-${rowIndex}-${columnIndex}`}>
              <Skeleton
                className={`h-4 ${
                  columnWidthClasses[columnIndex] ??
                  fallbackWidthPattern[(rowIndex + columnIndex) % fallbackWidthPattern.length]
                }`}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}
