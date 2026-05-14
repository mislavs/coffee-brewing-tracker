import { useId, useMemo, useState } from 'react'
import { ChevronsUpDownIcon, PlusIcon, XIcon } from 'lucide-react'
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

type TagComboboxProps = {
  triggerId?: string
  placeholder: string
  searchPlaceholder: string
  emptyMessage: string
  createLabel: (value: string) => string
  allowCreate?: boolean
  values: string[]
  options: string[]
  onChange: (values: string[]) => void
}

function normalize(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

function includesIgnoreCase(text: string, query: string) {
  return text.toLowerCase().includes(query.toLowerCase())
}

function normalizeDistinct(values: string[]) {
  const distinct: string[] = []
  const seen = new Set<string>()

  for (const value of values) {
    const normalized = normalize(value)
    if (!normalized) {
      continue
    }

    const key = normalized.toLowerCase()
    if (seen.has(key)) {
      continue
    }

    seen.add(key)
    distinct.push(normalized)
  }

  return distinct
}

export function TagCombobox({
  triggerId,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  createLabel,
  allowCreate = true,
  values,
  options,
  onChange,
}: TagComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const generatedTriggerId = useId()
  const generatedContentId = useId()
  const resolvedTriggerId = triggerId ?? generatedTriggerId

  const normalizedValues = useMemo(
    () => values.map((value) => normalize(value)),
    [values],
  )
  const normalizedValueSet = useMemo(
    () => new Set(normalizedValues.map((value) => value.toLowerCase())),
    [normalizedValues],
  )

  const normalizedOptions = useMemo(() => normalizeDistinct(options), [options])

  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalize(query)

    return normalizedOptions
      .filter((option) => !normalizedValueSet.has(option.toLowerCase()))
      .filter((option) =>
        normalizedQuery ? includesIgnoreCase(option, normalizedQuery) : true,
      )
  }, [normalizedOptions, normalizedValueSet, query])

  const normalizedQuery = normalize(query)
  const canCreate =
    allowCreate &&
    normalizedQuery.length > 0 &&
    !normalizedValueSet.has(normalizedQuery.toLowerCase()) &&
    !filteredOptions.some(
      (option) => option.toLowerCase() === normalizedQuery.toLowerCase(),
    )

  const addValue = (nextValue: string) => {
    const normalized = normalize(nextValue)
    if (!normalized) {
      return
    }

    if (normalizedValueSet.has(normalized.toLowerCase())) {
      return
    }

    onChange([...normalizedValues, normalized])
    setQuery('')
  }

  const removeValue = (valueToRemove: string) => {
    const normalizedToRemove = normalize(valueToRemove).toLowerCase()
    onChange(
      normalizedValues.filter(
        (value) => value.toLowerCase() !== normalizedToRemove,
      ),
    )
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={resolvedTriggerId}
            type="button"
            variant="outline"
            role="combobox"
            aria-controls={generatedContentId}
            aria-expanded={open}
            className="w-full justify-between"
          >
            {normalizedValues.length > 0
              ? `${normalizedValues.length} selected`
              : placeholder}
            <ChevronsUpDownIcon className="text-muted-foreground ml-2 size-4 shrink-0 opacity-70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          id={generatedContentId}
          className="w-(--radix-popover-trigger-width) p-0"
        >
          <Command>
            <CommandInput
              value={query}
              onValueChange={setQuery}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && normalizedQuery) {
                  event.preventDefault()
                  const matchingOption = normalizedOptions.find(
                    (option) => option.toLowerCase() === normalizedQuery.toLowerCase(),
                  )

                  if (matchingOption) {
                    addValue(matchingOption)
                    return
                  }

                  if (allowCreate) {
                    addValue(normalizedQuery)
                  }
                }
              }}
              placeholder={searchPlaceholder}
            />
            <CommandList>
              {filteredOptions.length === 0 && !canCreate && (
                <CommandEmpty>{emptyMessage}</CommandEmpty>
              )}
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={(selectedValue) => addValue(selectedValue)}
                  >
                    {option}
                  </CommandItem>
                ))}
                {canCreate && (
                  <CommandItem
                    value={normalizedQuery}
                    onSelect={(selectedValue) => addValue(selectedValue)}
                  >
                    <PlusIcon className="size-4" />
                    {createLabel(normalizedQuery)}
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {normalizedValues.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {normalizedValues.map((value) => (
            <Badge key={value} variant="secondary" className="gap-1 pr-1">
              <span>{value}</span>
              <button
                type="button"
                className="inline-flex size-4 items-center justify-center rounded-sm hover:bg-black/10 dark:hover:bg-white/10"
                onClick={() => removeValue(value)}
                aria-label={`Remove ${value}`}
              >
                <XIcon className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
