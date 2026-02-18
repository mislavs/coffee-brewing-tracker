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
import { tryParseGuid } from '@/features/roasters/guid'
import { useRoaster } from '@/features/roasters/hooks/useRoaster'

function RoasterDetailContent({ roasterId }: { roasterId: Guid }) {
  const { data: roaster } = useRoaster(roasterId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{roaster.name ?? 'Unnamed roaster'}</CardTitle>
        <CardDescription>Roaster details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div>
          <span className="font-medium">City:</span> {roaster.city || '—'}
        </div>
        <div>
          <span className="font-medium">Country:</span> {roaster.country || '—'}
        </div>
      </CardContent>
      <CardFooter className="flex items-center gap-2">
        <Button asChild>
          <Link to={`/roasters/${roasterId}/edit`}>Edit</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/roasters">Back</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export function RoasterDetailPage() {
  const { id } = useParams<{ id: string }>()
  const roasterId = tryParseGuid(id)

  if (!roasterId) {
    return <Navigate to="/roasters" replace />
  }

  return <RoasterDetailContent roasterId={roasterId} />
}
