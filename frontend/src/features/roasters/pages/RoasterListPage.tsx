import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useRoasters } from '@/features/roasters/hooks/useRoasters'

export function RoasterListPage() {
  const { data: roasters } = useRoasters()

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Roasters</CardTitle>
          <CardDescription>
            Browse and manage your coffee roasters.
          </CardDescription>
        </div>
        <Button asChild>
          <Link to="/roasters/new">Add Roaster</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Country</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roasters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-muted-foreground">
                  No roasters yet. Add your first roaster to get started.
                </TableCell>
              </TableRow>
            ) : (
              roasters.map((roaster) => (
                <TableRow
                  key={
                    roaster.id ??
                    `${roaster.name ?? 'roaster'}-${roaster.city ?? ''}-${roaster.country ?? ''}`
                  }
                >
                  <TableCell className="font-medium">
                    {roaster.id ? (
                      <Link to={`/roasters/${roaster.id}`} className="hover:underline">
                        {roaster.name ?? 'Unnamed roaster'}
                      </Link>
                    ) : (
                      (roaster.name ?? 'Unnamed roaster')
                    )}
                  </TableCell>
                  <TableCell>{roaster.city || '—'}</TableCell>
                  <TableCell>{roaster.country || '—'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
