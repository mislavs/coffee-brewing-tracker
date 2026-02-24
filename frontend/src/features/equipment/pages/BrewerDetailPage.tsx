import type { Guid } from '@/lib/api-types'
import { Link, Navigate } from 'react-router-dom'
import { DetailField } from '@/components/DetailField'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useBrewer } from '@/features/equipment/hooks/useBrewer'
import { useEntityFormId } from '@/lib/useEntityFormId'

function BrewerDetailContent({ brewerId }: { brewerId: Guid }) {
  const { data: brewer } = useBrewer(brewerId)
  const accessories =
    (
      brewer as {
        accessories?: { id?: string | null; name?: string | null }[] | null
      }
    ).accessories ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle>{brewer.name ?? 'Unnamed brewer'}</CardTitle>
        <CardDescription>Brewer details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <DetailField label="Accessories" stacked>
          {accessories.length > 0 ? (
            <ul className="list-inside list-disc">
              {accessories.map((accessory) => (
                <li key={accessory.id ?? accessory.name ?? 'accessory'}>
                  {accessory.id ? (
                    <Link
                      to={`/equipment/accessories/${accessory.id}`}
                      className="hover:underline"
                    >
                      {accessory.name ?? 'Unnamed accessory'}
                    </Link>
                  ) : (
                    (accessory.name ?? 'Unnamed accessory')
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No accessories yet.</p>
          )}
        </DetailField>
      </CardContent>
      <CardFooter className="flex items-center gap-2">
        <Button asChild>
          <Link to={`/equipment/brewers/${brewerId}/edit`}>Edit</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/equipment?tab=brewers">Back</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export function BrewerDetailPage() {
  const entityId = useEntityFormId()
  if (entityId.mode !== 'edit') {
    return <Navigate to="/equipment" replace />
  }

  return <BrewerDetailContent brewerId={entityId.id} />
}
