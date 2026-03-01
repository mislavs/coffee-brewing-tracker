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

type EntityOption = {
  id: string
  name: string
}

type EntityMultiSelectProps = {
  options: EntityOption[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  placeholder: string
  searchPlaceholder: string
  emptyMessage: string
}

function includesIgnoreCase(text: string, query: string) {
  return text.toLowerCase().includes(query.toLowerCase())
}

export function EntityMultiSelect({
  options,
  selectedIds,
  onChange,
  placeholder,
  searchPlaceholder,
  emptyMessage,
}: EntityMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds])

  const selectedOptions = useMemo(
    () => options.filter((option) => selectedIdSet.has(option.id)),
    [options, selectedIdSet],
  )

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim()
    if (!normalizedQuery) {
      return options
    }

    return options.filter((option) =>
      includesIgnoreCase(option.name, normalizedQuery),
    )
  }, [options, query])

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
            {selectedOptions.length > 0
              ? `${selectedOptions.length} selected`
              : placeholder}
            <ChevronsUpDownIcon className="text-muted-foreground ml-2 size-4 shrink-0 opacity-70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
          <Command>
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder={searchPlaceholder}
            />
            <CommandList>
              {filteredOptions.length === 0 ? (
                <CommandEmpty>{emptyMessage}</CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredOptions.map((option) => {
                    const isSelected = selectedIdSet.has(option.id)

                    return (
                      <CommandItem
                        key={option.id}
                        value={option.name}
                        onSelect={() => toggleSelection(option.id)}
                      >
                        <CheckIcon
                          className={`size-4 ${isSelected ? 'opacity-100' : 'opacity-0'}`}
                        />
                        {option.name}
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <Badge key={option.id} variant="secondary">
              {option.name}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
