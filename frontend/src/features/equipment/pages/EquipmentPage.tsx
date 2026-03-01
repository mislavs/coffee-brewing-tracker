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

type EquipmentEntity = {
  id?: string | null
  name?: string | null
}

type EquipmentEntityCardListProps = {
  title: string
  description: string
  addLabel: string
  addHref: string
  detailHrefPrefix: string
  unnamedLabel: string
  emptyMessage: string
  itemKeyPrefix: string
  items: EquipmentEntity[]
  isPending: boolean
}

function EquipmentEntityCardList({
  title,
  description,
  addLabel,
  addHref,
  detailHrefPrefix,
  unnamedLabel,
  emptyMessage,
  itemKeyPrefix,
  items,
  isPending,
}: EquipmentEntityCardListProps) {
  const getName = (item: EquipmentEntity) => item.name ?? unnamedLabel

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Button asChild>
          <Link to={addHref}>{addLabel}</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isPending && items.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <CardSkeleton key={`${itemKeyPrefix}-card-skeleton-${index}`} badgeCount={0} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">{emptyMessage}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <Card key={item.id ?? item.name ?? itemKeyPrefix} className="h-full">
                <CardHeader>
                  <CardTitle className="text-base">
                    {item.id ? (
                      <Link to={`${detailHrefPrefix}/${item.id}`} className="hover:underline">
                        {getName(item)}
                      </Link>
                    ) : (
                      getName(item)
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

function BrewerList() {
  const { data: brewers = [], isPending } = useBrewers()

  return (
    <EquipmentEntityCardList
      title="Brewers"
      description="Browse and manage your brewers."
      addLabel="Add Brewer"
      addHref="/equipment/brewers/new"
      detailHrefPrefix="/equipment/brewers"
      unnamedLabel="Unnamed brewer"
      emptyMessage="No brewers yet. Add your first brewer to get started."
      itemKeyPrefix="brewer"
      items={brewers}
      isPending={isPending}
    />
  )
}

function GrinderList() {
  const { data: grinders = [], isPending } = useGrinders()

  return (
    <EquipmentEntityCardList
      title="Grinders"
      description="Browse and manage your grinders."
      addLabel="Add Grinder"
      addHref="/equipment/grinders/new"
      detailHrefPrefix="/equipment/grinders"
      unnamedLabel="Unnamed grinder"
      emptyMessage="No grinders yet. Add your first grinder to get started."
      itemKeyPrefix="grinder"
      items={grinders}
      isPending={isPending}
    />
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
