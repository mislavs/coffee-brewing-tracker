/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_OTEL_CONSOLE_EXPORT?: string
  readonly OTEL_EXPORTER_OTLP_ENDPOINT: string
  readonly OTEL_EXPORTER_OTLP_HEADERS: string
  readonly OTEL_RESOURCE_ATTRIBUTES: string
  readonly OTEL_SERVICE_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  __APP_CONFIG__?: {
    apiUrl?: string
  }
}
