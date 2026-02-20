import type { Guid } from '@microsoft/kiota-abstractions'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useGrinder } from '@/features/equipment/hooks/useGrinder'
import { tryParseGuid } from '@/lib/guid'

function GrinderDetailContent({ grinderId }: { grinderId: Guid }) {
  const { data: grinder } = useGrinder(grinderId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{grinder.name ?? 'Unnamed grinder'}</CardTitle>
        <CardDescription>Grinder details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div>
          <span className="font-medium">Name:</span> {grinder.name ?? '—'}
        </div>
      </CardContent>
      <CardFooter className="flex items-center gap-2">
        <Button asChild>
          <Link to={`/equipment/grinders/${grinderId}/edit`}>Edit</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/equipment?tab=grinders">Back</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export function GrinderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const grinderId = tryParseGuid(id)

  if (!grinderId) {
    return <Navigate to="/equipment" replace />
  }

  return <GrinderDetailContent grinderId={grinderId} />
}
