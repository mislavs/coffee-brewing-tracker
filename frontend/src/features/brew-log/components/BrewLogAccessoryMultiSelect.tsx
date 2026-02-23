import { useMemo, useState } from 'react'
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useAccessories } from '@/features/equipment/hooks/useAccessories'
import { toIdNameOptions } from '@/features/brew-log/components/brewLogFormShared'

type BrewLogAccessoryMultiSelectProps = {
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

function includesIgnoreCase(text: string, query: string) {
  return text.toLowerCase().includes(query.toLowerCase())
}

export function BrewLogAccessoryMultiSelect({
  selectedIds,
  onChange,
}: BrewLogAccessoryMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const { data: accessories = [] } = useAccessories()

  const accessoryOptions = useMemo(
    () => toIdNameOptions(accessories, 'Unnamed accessory'),
    [accessories],
  )
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds])

  const selectedAccessories = useMemo(
    () => accessoryOptions.filter((accessory) => selectedIdSet.has(accessory.id)),
    [accessoryOptions, selectedIdSet],
  )

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim()

    if (!normalizedQuery) {
      return accessoryOptions
    }

    return accessoryOptions.filter((accessory) =>
      includesIgnoreCase(accessory.name, normalizedQuery),
    )
  }, [accessoryOptions, query])

  const toggleSelection = (id: string) => {
    if (selectedIdSet.has(id)) {
      onChange(selectedIds.filter((existingId) => existingId !== id))
      return
    }

    onChange([...selectedIds, id])
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            className="w-full justify-between"
          >
            {selectedAccessories.length > 0
              ? `${selectedAccessories.length} selected`
              : 'Select accessories'}
            <ChevronsUpDownIcon className="text-muted-foreground ml-2 size-4 shrink-0 opacity-70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
          <Command>
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder="Search accessories..."
            />
            <CommandList>
              {filteredOptions.length === 0 ? (
                <CommandEmpty>No accessories found.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredOptions.map((accessory) => {
                    const isSelected = selectedIdSet.has(accessory.id)

                    return (
                      <CommandItem
                        key={accessory.id}
                        value={accessory.name}
                        onSelect={() => toggleSelection(accessory.id)}
                      >
                        <CheckIcon
                          className={`size-4 ${isSelected ? 'opacity-100' : 'opacity-0'}`}
                        />
                        {accessory.name}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedAccessories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedAccessories.map((accessory) => (
            <Badge key={accessory.id} variant="secondary">
              {accessory.name}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
