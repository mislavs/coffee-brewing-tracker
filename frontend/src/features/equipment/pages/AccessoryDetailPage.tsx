import type { Guid } from '@microsoft/kiota-abstractions'
import { Link, Navigate, useParams } from 'react-router-dom'
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
import { tryParseGuid } from '@/lib/guid'

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
      <CardContent className="space-y-3 text-sm">
        <div className="space-y-2">
          <p className="font-medium">Compatible brewers</p>
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
        </div>
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
  const { id } = useParams<{ id: string }>()
  const accessoryId = tryParseGuid(id)

  if (!accessoryId) {
    return <Navigate to="/equipment" replace />
  }

  return <AccessoryDetailContent accessoryId={accessoryId} />
}
