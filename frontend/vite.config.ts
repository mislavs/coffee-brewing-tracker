import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    'import.meta.env.OTEL_EXPORTER_OTLP_ENDPOINT': JSON.stringify(
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? '',
    ),
    'import.meta.env.OTEL_EXPORTER_OTLP_HEADERS': JSON.stringify(
      process.env.OTEL_EXPORTER_OTLP_HEADERS ?? '',
    ),
    'import.meta.env.OTEL_RESOURCE_ATTRIBUTES': JSON.stringify(
      process.env.OTEL_RESOURCE_ATTRIBUTES ?? '',
    ),
    'import.meta.env.OTEL_SERVICE_NAME': JSON.stringify(
      process.env.OTEL_SERVICE_NAME ?? '',
    ),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
})
