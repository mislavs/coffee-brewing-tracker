import type { Guid } from '@/lib/api-types'
import { Link, Navigate } from 'react-router-dom'
import { DetailField } from '@/components/DetailField'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAccessory } from '@/features/equipment/hooks/useAccessory'
import { useEntityFormId } from '@/lib/useEntityFormId'

function AccessoryDetailContent({ accessoryId }: { accessoryId: Guid }) {
  const { data: accessory } = useAccessory(accessoryId)
  const compatibleBrewers =
    (
      accessory as {
        compatibleBrewers?: { id?: string | null; name?: string | null }[] | null
      }
    ).compatibleBrewers ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle>{accessory.name ?? 'Unnamed accessory'}</CardTitle>
        <CardDescription>Accessory details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <DetailField label="Compatible Brewers" stacked>
          {compatibleBrewers.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {compatibleBrewers.map((brewer) => (
                <Badge key={brewer.id ?? brewer.name ?? 'brewer'} variant="secondary">
                  {brewer.id ? (
                    <Link
                      to={`/equipment/brewers/${brewer.id}`}
                      className="hover:underline"
                    >
                      {brewer.name ?? 'Unnamed brewer'}
                    </Link>
                  ) : (
                    (brewer.name ?? 'Unnamed brewer')
                  )}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No compatible brewers selected.</p>
          )}
        </DetailField>
      </CardContent>
      <CardFooter className="flex items-center gap-2">
        <Button asChild>
          <Link to={`/equipment/accessories/${accessoryId}/edit`}>Edit</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/equipment?tab=accessories">Back</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export function AccessoryDetailPage() {
  const entityId = useEntityFormId()
  if (entityId.mode !== 'edit') {
    return <Navigate to="/equipment" replace />
  }

  return <AccessoryDetailContent accessoryId={entityId.id} />
}
