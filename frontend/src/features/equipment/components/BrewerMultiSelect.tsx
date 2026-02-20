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
import { useBrewers } from '@/features/equipment/hooks/useBrewers'

type BrewerMultiSelectProps = {
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

function includesIgnoreCase(text: string, query: string) {
  return text.toLowerCase().includes(query.toLowerCase())
}

export function BrewerMultiSelect({
  selectedIds,
  onChange,
}: BrewerMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const { data: brewers = [] } = useBrewers()

  const brewerOptions = useMemo(
    () =>
      brewers
        .map((brewer) =>
          brewer.id
            ? {
                id: brewer.id,
                name: brewer.name ?? 'Unnamed brewer',
              }
            : null,
        )
        .filter((brewer): brewer is { id: string; name: string } => Boolean(brewer)),
    [brewers],
  )

  const selectedBrewers = useMemo(
    () => brewerOptions.filter((brewer) => selectedIds.includes(brewer.id)),
    [brewerOptions, selectedIds],
  )

  const filteredOptions = useMemo(
    () =>
      brewerOptions.filter((brewer) =>
        query.trim() ? includesIgnoreCase(brewer.name, query.trim()) : true,
      ),
    [brewerOptions, query],
  )

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
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
            {selectedBrewers.length > 0
              ? `${selectedBrewers.length} selected`
              : 'Select compatible brewers'}
            <ChevronsUpDownIcon className="text-muted-foreground ml-2 size-4 shrink-0 opacity-70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
          <Command>
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder="Search brewers..."
            />
            <CommandList>
              {filteredOptions.length === 0 ? (
                <CommandEmpty>No brewers found.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredOptions.map((brewer) => {
                    const isSelected = selectedIds.includes(brewer.id)

                    return (
                      <CommandItem
                        key={brewer.id}
                        value={brewer.name}
                        onSelect={() => toggleSelection(brewer.id)}
                      >
                        <CheckIcon
                          className={`size-4 ${isSelected ? 'opacity-100' : 'opacity-0'}`}
                        />
                        {brewer.name}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedBrewers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedBrewers.map((brewer) => (
            <Badge key={brewer.id} variant="secondary">
              {brewer.name}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
