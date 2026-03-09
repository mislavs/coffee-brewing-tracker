import { ZoneContextManager } from '@opentelemetry/context-zone'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web'
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions'

function parseDelimitedValues(value: string): Record<string, string> {
  if (!value.trim()) {
    return {}
  }

  return Object.fromEntries(
    value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((pair) => {
        const separatorIndex = pair.indexOf('=')
        if (separatorIndex === -1) {
          return [pair, '']
        }

        return [
          pair.slice(0, separatorIndex).trim(),
          pair.slice(separatorIndex + 1).trim(),
        ]
      }),
  )
}

export function initializeTelemetry(
  otlpEndpoint: string,
  headers = '',
  resourceAttributes = '',
  serviceName = '',
) {
  const trimmedEndpoint = otlpEndpoint.trim()
  if (!trimmedEndpoint) {
    return
  }

  const exporter = new OTLPTraceExporter({
    url: `${trimmedEndpoint}/v1/traces`,
    headers: parseDelimitedValues(headers),
  })

  const attributes = parseDelimitedValues(resourceAttributes)
  attributes[ATTR_SERVICE_NAME] = serviceName.trim() || 'frontend'
  const spanProcessors = [new SimpleSpanProcessor(exporter)]
  // Keep OTLP export enabled, but only mirror spans to the browser console
  // when explicitly requested during local debugging.
  if (import.meta.env.DEV && import.meta.env.VITE_OTEL_CONSOLE_EXPORT === 'true') {
    spanProcessors.unshift(new SimpleSpanProcessor(new ConsoleSpanExporter()))
  }

  const provider = new WebTracerProvider({
    resource: resourceFromAttributes(attributes),
    spanProcessors,
  })

  provider.register({
    contextManager: new ZoneContextManager(),
  })

  registerInstrumentations({
    instrumentations: [new DocumentLoadInstrumentation()],
  })
}
