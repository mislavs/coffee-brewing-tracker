# Architecture

## Bird's Eye View

Coffee Brewing Tracker is a full-stack coffee journal. A React SPA talks to an ASP.NET Core API under `/api/*`; the API persists data in PostgreSQL through EF Core and can use optional AI providers for bean-image parsing and voice brew-log parsing. Local development is orchestrated by .NET Aspire, while production is a single ASP.NET container that serves both the API and the built SPA.

## Code Map

### `backend/src/CoffeeTracker.AppHost`

Owns the local Aspire graph. It starts PostgreSQL, runs the migration service, starts the API after migrations, and runs the Vite frontend with `VITE_API_URL` pointed at the API resource.

### `backend/src/CoffeeTracker.Api`

Owns the HTTP boundary. Endpoint groups map `/api/*` routes to application commands and queries, configure Swagger in development, expose health endpoints through service defaults, handle exceptions as ProblemDetails, and serve the built SPA in production.

### `backend/src/CoffeeTracker.Application`

Owns use cases. Feature folders contain MediatR commands, queries, validators, DTOs, and workflow logic for beans, roasters, equipment, recipes, brew logs, stats, and feature availability.

### `backend/src/CoffeeTracker.Domain`

Owns domain entities, enums, and domain exceptions. This layer is intentionally isolated from Application and Infrastructure dependencies.

### `backend/src/CoffeeTracker.Infrastructure`

Owns persistence and external adapters. It registers `ApplicationDbContext`, EF Core/PostgreSQL configuration, AI feature availability, speech transcription, and structured extraction services.

### `backend/src/CoffeeTracker.MigrationService`

Owns local migration execution in the Aspire graph. It applies EF Core migrations before the API starts during local development.

### `backend/src/CoffeeTracker.ServiceDefaults`

Owns shared .NET Aspire defaults such as OpenTelemetry, health endpoints, and service discovery wiring.

### `backend/tests`

Owns backend test coverage. Architecture tests enforce domain dependency rules, while API, Application, Domain, and Infrastructure tests cover their respective behavior.

### `frontend/src/features`

Owns user-facing feature areas. Each feature keeps its pages, hooks, schemas, query keys, and local components close to the domain behavior it supports.

### `frontend/src/components`

Owns shared UI building blocks, layouts, and shadcn/ui-derived components that are reused across feature areas.

### `frontend/src/hooks`

Owns cross-feature React hooks such as theme, dashboard, and settings behavior.

### `frontend/src/lib`

Owns frontend infrastructure: API client setup, route registration, runtime configuration, form helpers, telemetry, and generated API bindings.

### `frontend/src/lib/api/generated`

Contains Orval-generated API client code from `frontend/openapi.json`. Do not hand-edit this directory.

## Architecture Invariants

### Domain Purity

`CoffeeTracker.Domain` must not reference `CoffeeTracker.Application` or `CoffeeTracker.Infrastructure`. This keeps the core model independent and is enforced by architecture tests.

### Thin HTTP Boundary

`CoffeeTracker.Api` should remain a transport layer. Request parsing, response mapping, endpoint registration, and HTTP concerns belong there; business workflow belongs in Application features.

### Generated API Client

The backend Swagger document is the source of truth for frontend API types. Frontend code should use the configured API client and generated bindings instead of duplicating request and response shapes by hand.

### Migration Ownership

Local development runs migrations through `CoffeeTracker.MigrationService` before the API starts. In production, the API applies pending migrations at startup, which assumes a single running app container.

### Optional AI

AI-assisted features must degrade cleanly when dependencies or credentials are missing. Feature availability is exposed through the API so the frontend can hide unavailable capabilities.

### Deployment Unit

The production image serves the ASP.NET API and the built React SPA from one container. PostgreSQL is an external dependency.

### Intentional Absences

The app currently has no authentication, multi-tenancy, or separate BFF layer. Add those only with an explicit design decision.

## API Boundaries

### Frontend To API

The SPA calls JSON REST endpoints under `/api/*` and uses multipart requests for uploads such as images or audio. Runtime API URL resolution is handled by `window.__APP_CONFIG__.apiUrl`, `VITE_API_URL`, then a localhost fallback.

### Application To Infrastructure

Application handlers use infrastructure services and the EF Core DbContext through dependency injection. This is an intentional pragmatic boundary rather than a strict ports-and-adapters design.

### External Integrations

External AI dependencies are isolated in Infrastructure. Whisper/ffmpeg support local transcription, and OpenRouter-compatible chat extraction supports structured parsing.

## Cross-Cutting Concerns

### Persistence

EF Core migrations and `ApplicationDbContext` live in Infrastructure. PostgreSQL is the application database in local and production environments.

### Observability

Serilog handles request and application logging. ServiceDefaults wires OpenTelemetry and default health endpoints for Aspire resources.

### Validation And Errors

FluentValidation validates application inputs. The API maps failures and unexpected exceptions to ProblemDetails responses.

### Frontend State

TanStack Query owns server-state fetching and cache invalidation. Feature hooks should keep query keys and API calls local to their feature area when possible.

### Configuration

Backend non-sensitive settings live in appsettings files and secrets belong in .NET User Secrets or deployment secret storage. Frontend runtime API configuration is loaded from `/config.js` before falling back to Vite environment values.
