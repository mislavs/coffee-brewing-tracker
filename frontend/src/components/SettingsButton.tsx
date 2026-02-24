import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { useSettings } from '@/hooks/useSettings'

export function SettingsButton() {
  const { settings, updateSettings } = useSettings()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Open display settings"
          title="Display settings"
        >
          <Settings className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-4">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">Display Settings</p>
            <p className="text-muted-foreground text-xs">
              Choose what appears in the global dashboard header.
            </p>
          </div>
          <label htmlFor="show-dashboard-stats" className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">Show dashboard stats</p>
              <p className="text-muted-foreground text-xs">
                Display brew and bean summary stats above each page.
              </p>
            </div>
            <Switch
              id="show-dashboard-stats"
              checked={settings.showDashboardStats}
              onCheckedChange={(checked) => {
                updateSettings({ showDashboardStats: checked })
              }}
              aria-label="Toggle dashboard stats visibility"
            />
          </label>
        </div>
      </PopoverContent>
    </Popover>
  )
}
