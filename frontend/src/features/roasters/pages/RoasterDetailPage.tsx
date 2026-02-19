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
import { useRoaster } from '@/features/roasters/hooks/useRoaster'
import { tryParseGuid } from '@/lib/guid'

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
        <div className="space-y-1 pt-2">
          <p className="font-medium">Beans</p>
          {roaster.beans && roaster.beans.length > 0 ? (
            <ul className="list-inside list-disc">
              {roaster.beans.map((bean) => (
                <li key={bean.id ?? bean.name ?? 'bean'}>
                  {bean.id ? (
                    <Link to={`/beans/${bean.id}`} className="hover:underline">
                      {bean.name ?? 'Unnamed bean'}
                    </Link>
                  ) : (
                    (bean.name ?? 'Unnamed bean')
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No beans yet.</p>
          )}
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
