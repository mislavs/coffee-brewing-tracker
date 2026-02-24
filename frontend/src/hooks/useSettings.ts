import {
  createElement,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const SETTINGS_STORAGE_KEY = 'coffee-tracker-settings'

export type AppSettings = {
  showDashboardStats: boolean
}

const DEFAULT_SETTINGS: AppSettings = {
  showDashboardStats: true,
}

type SettingsContextValue = {
  settings: AppSettings
  updateSettings: (nextSettings: Partial<AppSettings>) => void
}

function getInitialSettings(): AppSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS
  }

  const rawSettings = window.localStorage.getItem(SETTINGS_STORAGE_KEY)
  if (!rawSettings) {
    return DEFAULT_SETTINGS
  }

  try {
    const parsedSettings = JSON.parse(rawSettings) as Partial<AppSettings>
    return {
      ...DEFAULT_SETTINGS,
      ...parsedSettings,
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

function persistSettings(settings: AppSettings) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(getInitialSettings)

  const updateSettings = useCallback((nextSettings: Partial<AppSettings>) => {
    setSettings((currentSettings) => {
      const updatedSettings = {
        ...currentSettings,
        ...nextSettings,
      }
      persistSettings(updatedSettings)
      return updatedSettings
    })
  }, [])

  const value = useMemo(
    () => ({
      settings,
      updateSettings,
    }),
    [settings, updateSettings],
  )

  return createElement(SettingsContext.Provider, { value }, children)
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider')
  }

  return context
}
