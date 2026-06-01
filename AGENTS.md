# Coffee Brewing Tracker Agent Guide

This file is the short entry point for coding agents and contributors.

## Docs Structure

- `docs/architecture.md` - stable codemap, API boundaries, architecture invariants, and cross-cutting concerns.
- `docs/features.md` - shipped capabilities, planned capabilities, and user-facing workflows.
- `docs/adr/` - accepted architecture decisions and long-lived trade-offs.
- `docs/exec-plans/active/` - active implementation plans for unfinished work.
- `docs/exec-plans/completed/` - historical plans kept for context.
- `docs/exec-plans/tech-debt-tracker.md` - documentation debt and gardening checklist.
- `docs/generated/` - generated reference material; do not hand-edit generated outputs.

## Build And Test

- Backend tests: `dotnet test backend/CoffeeTracker.slnx`
- Frontend build: from `frontend`, run `npm run build`
- Frontend tests: from `frontend`, run `npm run test`
- Frontend lint: from `frontend`, run `npm run lint`

## Local Run

- Full stack: from `backend/src/CoffeeTracker.AppHost`, run `dotnet run`
- Backend details and optional AI setup live in `backend/README.md`.
- Frontend setup, scripts, and API URL behavior live in `frontend/README.md`.

## Agent Safety

- When a plan or skill file exists for the current task, read and follow it before implementation.
- Do not deviate from plan specifications without explicitly noting the deviation and getting approval.
- Do not commit secrets or local credentials. Store backend secrets with .NET User Secrets.
- For dependency rules, ownership boundaries, and architecture invariants, read `docs/architecture.md`.
- Do not edit local config unless the task explicitly asks for config changes.
- Do not hand-edit generated outputs or run artifacts such as `frontend/src/lib/api/generated/`, `node_modules/`, `dist/`, `TestResults/`, or coverage output.

## Documentation Maintenance

- Keep `docs/architecture.md` short and stable. It should be a map, not an atlas.
- Put volatile details, exact command examples, payload shapes, and step-by-step procedures in features, execution plans, generated docs, or code comments.
- Add an ADR when a decision changes ownership boundaries, dependency direction, persistence shape, external integration behavior, or agent safety rules.
- Move finished plans from `docs/exec-plans/active/` to `docs/exec-plans/completed/`.

## OpenAPI Refresh (Aspire)

1. Ensure Aspire is running.
   - If it is not running, start it with `aspire run`.
2. Use the Aspire MCP to get the API URL from resource metadata.
   - Select the active AppHost in MCP if needed.
   - Call `list_resources` and read the `api` resource `endpoint_urls` (`http` endpoint).
3. Use the URL from Aspire MCP directly.
   - If URL comes from Aspire MCP resource data, do not run manual URL verification.
4. Refresh OpenAPI spec in `frontend` using the MCP-derived URL:
   - `npm run update-api-spec -- --url=<API_SWAGGER_URL>`
   - Example: `npm run update-api-spec -- --url=http://localhost:5081/swagger/v1/swagger.json`
5. Regenerate API client in `frontend`:
   - `npm run generate-api`
6. Validate expected schema changes in:
   - `frontend/src/lib/api/generated/index.schemas.ts`
7. If sync fails (for example `fetch failed`) after following the steps above:
   - Stop immediately.
   - Do not continue with additional retries in this runbook.
   - Report the failure and captured error output.
