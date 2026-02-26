import { Link, useSearchParams } from 'react-router-dom'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CardSkeleton } from '@/components/skeletons/CardSkeleton'
import { TableRowSkeleton } from '@/components/skeletons/TableRowSkeleton'
import { useAccessories } from '@/features/equipment/hooks/useAccessories'
import { useBrewers } from '@/features/equipment/hooks/useBrewers'
import { useGrinders } from '@/features/equipment/hooks/useGrinders'

type EquipmentTab = 'brewers' | 'grinders' | 'accessories'

function parseTab(value: string | null): EquipmentTab {
  if (value === 'grinders' || value === 'accessories') {
    return value
  }

  return 'brewers'
}

function BrewerList() {
  const { data: brewers = [], isPending } = useBrewers()

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Brewers</CardTitle>
          <CardDescription>Browse and manage your brewers.</CardDescription>
        </div>
        <Button asChild>
          <Link to="/equipment/brewers/new">Add Brewer</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isPending && brewers.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <CardSkeleton key={`brewer-card-skeleton-${index}`} badgeCount={0} />
            ))}
          </div>
        ) : brewers.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            No brewers yet. Add your first brewer to get started.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {brewers.map((brewer) => (
              <Card key={brewer.id ?? brewer.name ?? 'brewer'} className="h-full">
                <CardHeader>
                  <CardTitle className="text-base">
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
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function GrinderList() {
  const { data: grinders = [], isPending } = useGrinders()

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Grinders</CardTitle>
          <CardDescription>Browse and manage your grinders.</CardDescription>
        </div>
        <Button asChild>
          <Link to="/equipment/grinders/new">Add Grinder</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isPending && grinders.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <CardSkeleton key={`grinder-card-skeleton-${index}`} badgeCount={0} />
            ))}
          </div>
        ) : grinders.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            No grinders yet. Add your first grinder to get started.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {grinders.map((grinder) => (
              <Card key={grinder.id ?? grinder.name ?? 'grinder'} className="h-full">
                <CardHeader>
                  <CardTitle className="text-base">
                    {grinder.id ? (
                      <Link
                        to={`/equipment/grinders/${grinder.id}`}
                        className="hover:underline"
                      >
                        {grinder.name ?? 'Unnamed grinder'}
                      </Link>
                    ) : (
                      (grinder.name ?? 'Unnamed grinder')
                    )}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function AccessoryList() {
  const { data: accessories = [], isPending } = useAccessories()

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Accessories</CardTitle>
          <CardDescription>Browse and manage your accessories.</CardDescription>
        </div>
        <Button asChild>
          <Link to="/equipment/accessories/new">Add Accessory</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Compatible Brewers</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending && accessories.length === 0 ? (
              <TableRowSkeleton
                columns={2}
                rowCount={4}
                columnWidthClasses={['w-2/3', 'w-5/6']}
              />
            ) : accessories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-muted-foreground">
                  No accessories yet. Add your first accessory to get started.
                </TableCell>
              </TableRow>
            ) : (
              accessories.map((accessory) => {
                const brewerNames =
                  accessory.compatibleBrewers
                    ?.map((b) => b.name?.trim() ?? '')
                    .filter((n) => n.length > 0) ?? []

                return (
                  <TableRow key={accessory.id ?? accessory.name ?? 'accessory'}>
                    <TableCell className="font-medium">
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
                    </TableCell>
                    <TableCell>
                      {brewerNames.length > 0
                        ? brewerNames.join(', ')
                        : '—'}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export function EquipmentPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = parseTab(searchParams.get('tab'))

  const handleTabChange = (value: string) => {
    const nextTab = parseTab(value)

    if (nextTab === tab) {
      return
    }

    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('tab', nextTab)
    setSearchParams(nextParams, {
      flushSync: true,
    })
  }

  return (
    <Tabs value={tab} onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value="brewers">Brewers</TabsTrigger>
        <TabsTrigger value="grinders">Grinders</TabsTrigger>
        <TabsTrigger value="accessories">Accessories</TabsTrigger>
      </TabsList>
      <TabsContent value="brewers">
        <BrewerList />
      </TabsContent>
      <TabsContent value="grinders">
        <GrinderList />
      </TabsContent>
      <TabsContent value="accessories">
        <AccessoryList />
      </TabsContent>
    </Tabs>
  )
}
