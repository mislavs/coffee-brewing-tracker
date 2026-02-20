---
name: Coffee Tracker Delivery Plan
overview: Iterative delivery plan for a full-stack Coffee Brewing Tracker (ASP.NET Clean Architecture backend + React SPA frontend + .NET Aspire orchestration), sliced into 10 vertical steps that each leave the app buildable, runnable, and tested.
todos:
  - id: step-1-backend-bootstrap
    content: "Step 1: Backend Bootstrap -- scaffold CoffeeTracker.x Clean Architecture solution, DI, middleware, DbContext, test harness, architecture test, CORS"
    status: completed
  - id: step-2-frontend-bootstrap
    content: "Step 2: Frontend Bootstrap -- Vite + React + TypeScript scaffold, shadcn/ui, routing shell, dark mode, Kiota API client generation, layout with nav"
    status: completed
  - id: step-3-aspire
    content: "Step 3: Aspire AppHost -- CoffeeTracker.AppHost + ServiceDefaults, orchestrates PostgreSQL, backend API, and frontend dev server"
    status: completed
  - id: step-4-roasters
    content: "Step 4: Roaster Library (F1) -- backend create/read/update + frontend list/detail/create/edit pages"
    status: completed
  - id: step-5-beans
    content: "Step 5: Flavor Notes + Bean Library (F2) -- backend create/read/update with M2M + frontend pages with roaster picker, flavor note tags, search"
    status: completed
  - id: step-6-equipment
    content: "Step 6: Equipment Registry (F3) -- Brewer/Grinder/Accessory backend CRUD + frontend tabbed UI with brewer association"
    status: completed
  - id: step-7-recipes
    content: "Step 7: Recipe Library (F4) -- backend CRUD with brewer filter + frontend pages with method filter"
    status: pending
  - id: step-8-brewlog
    content: "Step 8: Brew Log + Rating (F5/F8) -- backend CRUD with all FKs + frontend log form, emoji rating, brew history, grinder stats"
    status: pending
  - id: step-9-remaining-qty
    content: "Step 9: Auto Remaining Bean Quantity (F6) -- backend compute-on-read + frontend bean detail progress bar"
    status: pending
  - id: step-10-repeat-brew
    content: "Step 10: Repeat Brew (F7) -- backend repeat template endpoint + frontend repeat button with pre-filled form"
    status: pending
isProject: false
---

# Coffee Brewing Tracker -- Iterative Delivery Plan

## Assumptions

- **Full-stack app** -- ASP.NET Core backend API + React SPA frontend + .NET Aspire AppHost, all in one repository.
- **Backend**: .NET Clean Architecture (`CoffeeTracker.Domain`, `.Infrastructure`, `.Application`, `.Api`) with CQRS via MediatR, PostgreSQL via EF Core (Npgsql).
- **Frontend**: React + Vite + TypeScript, `shadcn/ui` + Tailwind CSS, `@tanstack/react-query` (Suspense mode), `react-hook-form` + `zod`, `react-router-dom`. Microsoft Kiota-generated typed TypeScript API client.
- **Orchestration**: .NET Aspire AppHost manages PostgreSQL (container), backend API, and frontend dev server as a single `dotnet run` experience.
- **Product prefix**: `CoffeeTracker` (e.g. `CoffeeTracker.slnx`, `CoffeeTracker.Api`, `CoffeeTracker.AppHost`).
- **Repo layout**: `backend/` for .NET projects (including AppHost and ServiceDefaults), `frontend/` for the React SPA, `docs/` for spec.
- No authentication or multi-tenancy -- single-user app.
- Docker available for Testcontainers (integration tests) and Aspire's PostgreSQL container resource.
- Grinder derived statistics depend on BrewLog data and will be computed in the Brew Log step, not initial Grinder CRUD.

---

## Step 1 -- Backend Bootstrap

- **Goal**: Scaffold the full Clean Architecture .NET solution so it builds, runs, and has a passing architecture test and integration-test harness. Configure CORS.
- **Scope**:
  - Create `CoffeeTracker.slnx` with four backend projects (`CoffeeTracker.Domain`, `CoffeeTracker.Infrastructure`, `CoffeeTracker.Application`, `CoffeeTracker.Api`) and five test projects per the `dotnet-backend` skill scaffold.
  - Add NuGet packages: MediatR, FluentValidation, EF Core + Npgsql, Swashbuckle, xUnit, FluentAssertions, NSubstitute, AutoFixture, NetArchTest.Rules, Testcontainers.PostgreSql, Respawn.
  - Wire up `Program.cs` with DI extensions (`AddApplication`, `AddInfrastructure`), Swagger, `ExceptionHandlerMiddleware`, and CORS policy allowing all origins.
  - Create empty `ApplicationDbContext` in Infrastructure.
  - Add `ValidationBehavior` pipeline behavior.
  - Add domain exceptions (`NotFoundException`, `ConflictException`).
  - Add `IntegrationTestFactory`, `IntegrationTestsCollection`, `IntegrationTest` base class.
  - Add `DependencyTests` architecture test.
  - Add `.gitignore` for .NET + Node.
- **Tests**: Architecture dependency test (`Domain_Should_Not_Reference_Infrastructure`). Integration test harness verified by a build.
- **Verification**: `dotnet build` succeeds. `dotnet test` passes the architecture test. `dotnet run --project backend/CoffeeTracker.Api` starts and Swagger UI loads at `/swagger`.
- **Exit Criteria**: Solution builds, all tests green, API serves Swagger, CORS configured.

---

## Step 2 -- Frontend Bootstrap

- **Goal**: Scaffold the React SPA with routing shell, design system, dark mode, and API client generation pipeline so the frontend builds, runs, and renders an app shell.
- **Scope**:
  - **Scaffold**: `npm create vite@latest frontend -- --template react-ts` in the repo root. Install core dependencies:
    - `react-router-dom`, `@tanstack/react-query`, `react-hook-form`, `zod`, `@hookform/resolvers`
    - `tailwindcss`, `@tailwindcss/vite`
    - `shadcn/ui` CLI init -- scaffold `Button`, `Input`, `Card`, `Dialog`, `Toast`/`Sonner`, `Select`, `DropdownMenu`, `Skeleton`, `Table` into `components/ui/`
  - **Folder structure** per the SPA skill:
    - `src/components/ui/` (shadcn primitives), `src/components/` (layout, nav, error boundary), `src/hooks/`, `src/lib/` (config, API client), `src/features/`
  - **Routing shell**: `react-router-dom` with a layout route providing sidebar/nav and a content area. Placeholder routes for `/roasters`, `/beans`, `/equipment`, `/recipes`, `/brew-log`. Each renders a "Coming soon" placeholder.
  - **Theme**: `darkMode: 'class'` on `<html>`, OS-preference default with manual toggle in nav. CSS variables for theme tokens.
  - **API client generation**:
    - Install Microsoft Kiota CLI (`dotnet tool install --global Microsoft.OpenApi.Kiota`).
    - Install Kiota runtime packages: `@microsoft/kiota-abstractions`, `@microsoft/kiota-http-fetchlibrary`, `@microsoft/kiota-serialization-json`, `@microsoft/kiota-serialization-text`, `@microsoft/kiota-serialization-form`, `@microsoft/kiota-serialization-multipart`, `@microsoft/kiota-authentication-anonymous`.
    - Commit `frontend/openapi.json` as the checked-in OpenAPI contract. Gitignore `frontend/src/lib/api/generated/`.
    - Two npm scripts:
      - `update-api-spec` -- runs a cross-platform Node script (`node ./scripts/update-api-spec.mjs`) that downloads Swagger JSON and writes `frontend/openapi.json`. URL resolution order: CLI `--url`, `COFFEE_TRACKER_OPENAPI_URL`, `${VITE_API_URL}/swagger/v1/swagger.json`, then fallback `http://localhost:5000/swagger/v1/swagger.json`.
      - `generate-api` -- runs `kiota generate -l typescript -d ./openapi.json -o src/lib/api/generated -n CoffeeTrackerClient`. Reads from the local checked-in spec. Does not require backend running.
    - CI pipeline runs `npm run generate-api` before `npm run build` so the client is created from the committed spec.
    - Configure `lib/config.ts` to export `VITE_API_URL` (defaults to `http://localhost:5000`) and provide a configured Kiota client instance.
  - **Error handling**: Route-level React error boundary. Toast provider (Sonner) wired up.
  - **Suspense**: Route-level `<Suspense>` with a generic skeleton fallback.
  - **Environment**: `.env` with `VITE_API_URL=http://localhost:5000`, `.env.local` gitignored.
  - **Linting**: ESLint + Prettier configured.
- **Tests**: None (per SPA skill -- no automated frontend tests initially).
- **Verification**: `npm run generate-api` produces a typed client from the committed `openapi.json`. `npm run build` succeeds. `npm run dev` renders the app shell with nav, dark mode toggle, and placeholder routes.
- **Exit Criteria**: Frontend builds, dev server runs, nav renders all route links, dark mode toggles, API client generation pipeline works.

---

## Step 3 -- Aspire AppHost

- **Goal**: Add a .NET Aspire AppHost that orchestrates PostgreSQL, the backend API, and the frontend dev server so the entire stack starts with a single `dotnet run`.
- **Scope**:
  - Create `CoffeeTracker.ServiceDefaults` project in `backend/`. Add to solution. Wire up standard Aspire service defaults (OpenTelemetry, health checks, service discovery). Reference from `CoffeeTracker.Api`.
  - Create `CoffeeTracker.AppHost` project in `backend/`. Add to solution. Reference `CoffeeTracker.Api` project.
  - Configure AppHost `Program.cs`:
    - `AddPostgres("postgres").AddDatabase("coffeetrackerdb")` -- PostgreSQL as a container resource.
    - `AddProject<CoffeeTracker.Api>("api")` -- reference the API project, pass the database connection as a resource reference.
    - `AddViteApp("frontend", "../../frontend")` -- launch the Vite dev server, configure the HTTP endpoint reference, and inject `VITE_API_URL` from the API resource endpoint so frontend calls do not depend on a hard-coded port.
  - Update `CoffeeTracker.Api` `Program.cs` to call `builder.AddServiceDefaults()` and `app.MapDefaultEndpoints()`.
  - Update `CoffeeTracker.Infrastructure` `AddInfrastructure` to use `AddNpgsqlDbContext` (Aspire-style) or keep `UseNpgsql` with the connection string from configuration (Aspire injects `ConnectionStrings:coffeetrackerdb` automatically).
  - Ensure integration tests still work independently via Testcontainers (they do not use the AppHost).
- **Tests**: Existing architecture and integration tests still pass. No new tests needed -- Aspire orchestration is verified by running the AppHost.
- **Verification**: `dotnet run --project backend/CoffeeTracker.AppHost` starts the Aspire dashboard, PostgreSQL container, backend API, and frontend dev server. Aspire dashboard shows all three resources as healthy. Swagger UI accessible via the API's endpoint. Frontend dev server accessible and shows the app shell.
- **Exit Criteria**: Single `dotnet run` launches everything. All resources healthy in Aspire dashboard. Existing tests unaffected.

---

## Step 4 -- Roaster Library (F1)

- **Goal**: First full vertical slice -- Roaster create/read/update from database to UI -- proving both stacks work end-to-end together.
- **Scope**:
  - **Backend**:
    - **Domain**: `Roaster` entity (Id, Name, City, Country).
    - **Infrastructure**: `RoasterConfiguration`, `DbSet<Roaster>`, initial EF migration.
    - **Application** `Features/Roasters/`: `CreateRoaster`, `UpdateRoaster` commands with validators. `GetRoasterById`, `GetRoastersList` queries with DTOs.
    - **Api**: `Contracts/CreateRoasterRequest`, `Contracts/UpdateRoasterRequest`. `Endpoints/RoasterEndpoints` (GET list, GET by id, POST, PUT).
  - **Frontend** `features/roasters/`:
    - Regenerate API client (`npm run update-api-spec && npm run generate-api`).
    - `RoasterListPage` -- table of roasters with name/city/country columns. Links to detail. "Add Roaster" button.
    - `RoasterDetailPage` -- displays roaster info. Edit/back buttons.
    - `RoasterFormPage` -- shared create/edit form using `react-hook-form` + `zod`. Roaster name required, city/country optional. `useMutation` for submit. Toast on success. ProblemDetails field-error mapping.
    - Routes: `/roasters`, `/roasters/:id`, `/roasters/new`, `/roasters/:id/edit`.
    - Feature hooks: `useRoasters`, `useRoaster`, `useCreateRoaster`, `useUpdateRoaster`.
- **Tests**:
  - Backend unit: `CreateRoasterValidatorTests`, `UpdateRoasterValidatorTests`.
  - Backend integration: `CreateRoasterHandlerTests`, `UpdateRoasterHandlerTests`, `GetRoasterByIdHandlerTests`, `GetRoastersListHandlerTests`.
- **Verification**: `dotnet build && dotnet test`. Frontend: `npm run build`. Run via Aspire AppHost and manually create a roaster in the UI, see it in the list, click into detail, edit it.
- **Exit Criteria**: Roaster create/read/update flows work in both API and UI. All backend tests green.
- **Implementation Summary (2026-02-18)**:
  - Added complete backend Roaster vertical slice (Domain entity, EF configuration + migration, CQRS commands/queries/validators, API contracts/endpoints).
  - Added backend unit/integration tests for Roaster validation and handlers; `dotnet build` and `dotnet test` pass.
  - Added frontend Roaster feature (typed Kiota client regen, hooks, list/detail/form pages, route wiring) and `npm run build` passes.
  - Aspire smoke test execution attempted; AppHost startup fails in this environment with repeated DCP connection-refused errors (`127.0.0.1:57288`) before resources become available.

---

## Step 5 -- Flavor Notes and Bean Library (F2)

- **Goal**: Implement Bean Library with Roaster FK, FlavorNote many-to-many, PricePerKg, and full UI for browsing/managing beans.
- **Scope**:
  - **Backend**:
    - **Domain**: `FlavorNote` (Id, Name). `Bean` (all spec properties except `RemainingQuantity`). `OriginType` enum. `RoastProfile` enum. `PricePerKg` derived property.
    - **Infrastructure**: `FlavorNoteConfiguration`, `BeanConfiguration` with join table. DbSets. EF migration.
    - **Application** `Features/Beans/`: `CreateBean`, `UpdateBean` commands. `GetBeanById`, `GetBeansList` (with name search) queries. `Features/FlavorNotes/`: `GetFlavorNotesList` query.
    - **Application** `Features/Roasters/`: update `GetRoasterById` to include associated bean summaries for roaster detail navigation.
    - **Api**: Bean create/read/update endpoints, FlavorNote list endpoint, roaster detail contract includes associated beans.
  - **Frontend** `features/beans/`:
    - Regenerate API client.
    - `BeanListPage` -- searchable table showing name, roaster, roast profile, bag weight, price per kg. Links to detail.
    - `BeanDetailPage` -- full bean info with flavor note chips, roaster link, price per kg.
    - `BeanFormPage` -- form with roaster dropdown (fetched from API) plus inline "Create roaster" flow (dialog or inline section that calls the existing roaster create endpoint and selects the new roaster on success), flavor note multi-select/tag input (autocomplete from `GetFlavorNotesList`, allows creating new), enum selects for OriginType and RoastProfile, origin countries as tag input.
    - Update `RoasterDetailPage` to show associated beans with links into bean detail pages.
    - Routes: `/beans`, `/beans/:id`, `/beans/new`, `/beans/:id/edit`.
- **Tests**:
  - Backend unit: Bean validators, `PricePerKg` domain logic.
  - Backend integration: Bean and FlavorNote handlers (create with new/existing flavor notes, query with includes, search).
- **Verification**: `dotnet build && dotnet test`. `npm run build`. Manual via Aspire: create a bean selecting a roaster and adding flavor notes, verify detail page shows all relationships and price per kg.
- **Exit Criteria**: Bean create/read/update flows work end-to-end with Roaster FK and FlavorNote M2M. Search works. PricePerKg computed correctly.

---

## Step 6 -- Equipment Registry (F3)

- **Goal**: Implement Brewer, Grinder, and Accessory CRUD with Accessory-Brewer many-to-many, exposed in a unified Equipment UI.
- **Scope**:
  - **Backend**:
    - **Domain**: `Brewer` (Id, Name). `Grinder` (Id, Name -- derived stats deferred). `Accessory` (Id, Name, CompatibleBrewers).
    - **Infrastructure**: Entity configs, `AccessoryBrewer` join table. DbSets. EF migration.
    - **Application**: `Features/Brewers/` CRUD. `Features/Grinders/` CRUD (basic). `Features/Accessories/` CRUD with brewer linking.
    - **Api**: Endpoints for all three entity types.
  - **Frontend** `features/equipment/`:
    - Regenerate API client.
    - `EquipmentPage` -- tabbed layout (Brewers | Grinders | Accessories). Each tab renders a list.
    - `BrewerFormPage`, `GrinderFormPage`, `AccessoryFormPage` -- create/edit forms. Accessory form includes a multi-select of compatible brewers.
    - `BrewerDetailPage`, `GrinderDetailPage`, `AccessoryDetailPage` -- detail views. Accessory detail shows linked brewers.
    - Routes: `/equipment` (tabbed), `/equipment/brewers/new`, `/equipment/brewers/:id`, `/equipment/grinders/new`, etc.
- **Tests**:
  - Backend unit: Validators for all three types.
  - Backend integration: All CRUD handlers, accessory-brewer association.
- **Verification**: `dotnet build && dotnet test`. `npm run build`. Manual via Aspire: add a brewer, add an accessory linked to it, verify association in UI.
- **Exit Criteria**: All equipment types have CRUD in API and UI. Accessory-Brewer M2M works.

---

## Step 7 -- Recipe Library (F4)

- **Goal**: Implement Recipe CRUD with Brewer reference and method-based filtering in both API and UI.
- **Scope**:
  - **Backend**:
    - **Domain**: `Recipe` (Id, Name, Brewer reference, Description).
    - **Infrastructure**: `RecipeConfiguration`. DbSet. EF migration.
    - **Application** `Features/Recipes/`: `CreateRecipe`, `UpdateRecipe`, `DeleteRecipe` commands. `GetRecipeById`, `GetRecipesList` (optional `brewerId` filter) queries.
    - **Api**: Recipe endpoints with `?brewerId=` query parameter.
  - **Frontend** `features/recipes/`:
    - Regenerate API client.
    - `RecipeListPage` -- table with brewer filter dropdown (URL query param driven). Shows recipe name, brewer name, truncated description.
    - `RecipeDetailPage` -- full recipe info with brewer link.
    - `RecipeFormPage` -- form with brewer dropdown, name, description textarea.
    - Routes: `/recipes`, `/recipes/:id`, `/recipes/new`, `/recipes/:id/edit`.
    - Delete confirmation dialog on detail page.
- **Tests**:
  - Backend unit: Recipe validators.
  - Backend integration: Create linked to brewer, query filtered by brewer, delete.
- **Verification**: `dotnet build && dotnet test`. `npm run build`. Manual via Aspire: create recipes for two brewers, filter by method in UI, delete a recipe.
- **Exit Criteria**: Recipe CRUD works. Brewer filtering works. Delete with confirmation works.

---

## Step 8 -- Brew Log and Rating (F5 + F8)

- **Goal**: Implement the core Brew Log feature with all entity references, auto-calculated brew ratio, emoji rating, searchable history, and Grinder derived statistics.
- **Scope**:
  - **Backend**:
    - **Domain**: `BrewLogEntry` (all spec properties + explicit `BrewerId`/method reference so method is captured even when `RecipeId` is null). `BrewRating` enum (1-5). `BrewRatio` derived from Dose/WaterAmount.
    - **Infrastructure**: `BrewLogEntryConfiguration` (FKs to Bean, Brewer, Grinder; M2M with Accessory; optional Recipe FK). `BrewLogAccessory` join table. DbSet. EF migration.
    - **Application** `Features/BrewLog/`: `CreateBrewLog`, `UpdateBrewLog`, `DeleteBrewLog` commands. `GetBrewLogById`, `GetBrewLogsList` (search by bean name, date range) queries.
    - Enforce consistency rule: if `RecipeId` is provided, recipe must belong to selected `BrewerId`.
    - **Application** `Features/Grinders/Queries/GetGrinderById` -- enhance to return derived stats (Total Brews, Total Coffee Ground, Most Common Grind Setting, Grind Setting Range, Best Rated Grind Setting).
    - **Api**: BrewLog CRUD + list endpoints. Updated Grinder detail DTO.
  - **Frontend** `features/brew-log/`:
    - Regenerate API client.
    - `BrewLogListPage` -- chronological brew history with search (bean name) and date range filter. Each row shows date, bean, brewer/method, rating emoji, ratio. Links to detail.
    - `BrewLogDetailPage` -- full brew details with all resolved entity names, brew ratio, rating emoji, tasting notes, adjustment ideas. Edit/delete buttons.
    - `BrewLogFormPage` -- multi-step or sectioned form: (1) Bean select, (2) Method: explicit brewer select, then optional recipe select filtered by brewer, grinder select, accessory multi-select filtered by brewer, (3) Parameters: dose, water, temp, grind size, (4) Results: brew time, rating (emoji picker), tasting notes, adjustment ideas. Brew ratio auto-displayed as dose/water change. `useMutation` submit.
    - Emoji rating picker component: 5 emoji faces, click to select.
    - Update `GrinderDetailPage` to display derived brew statistics.
    - Routes: `/brew-log`, `/brew-log/:id`, `/brew-log/new`, `/brew-log/:id/edit`.
  - **Frontend** `features/equipment/`: Update `GrinderDetailPage` to show stats section.
- **Tests**:
  - Backend unit: BrewLog validators, BrewRatio calculation.
  - Backend integration: Create brew with all refs, query with includes, update, delete. Grinder stats after brews.
- **Verification**: `dotnet build && dotnet test`. `npm run build`. Manual via Aspire: full end-to-end -- create roaster, bean, brewer, grinder, recipe, then log a brew (including a brew without recipe). Verify ratio, rating, history, brewer/method capture, and grinder stats all display correctly.
- **Exit Criteria**: Brew Log CRUD works in API and UI. Rating with emojis. Brew ratio auto-calculated. History searchable. Grinder stats computed.

---

## Step 9 -- Automatic Remaining Bean Quantity (F6)

- **Goal**: Auto-track remaining bean quantity by subtracting brew doses from bag weight, visible in the UI.
- **Scope**:
  - **Backend**:
    - Update `GetBeanByIdHandler` to return `RemainingQuantity` (`BagWeight - SUM(brew doses)`). Compute on read.
    - Update `GetBeansListHandler` to include remaining quantity in summary DTO.
    - No changes to brew log handlers -- the computation is purely on the Bean query side.
  - **Frontend**:
    - Update `BeanDetailPage` to show remaining quantity with a visual progress bar (remaining / bag weight).
    - Update `BeanListPage` to show remaining quantity column.
    - Optionally highlight beans running low (e.g. less than 20% remaining).
  - **Design decision**: Compute on read (`BagWeight - SUM(doses)`) rather than caching.
- **Tests**:
  - Backend integration: Create bean (500g), log brew (18g dose), verify remaining = 482g. Log second brew, verify cumulative. Update brew dose, verify recalculated. Delete brew, verify recalculated.
- **Verification**: `dotnet build && dotnet test`. `npm run build`. Manual via Aspire: create a bean, log brews against it, watch remaining quantity decrease in the bean detail page.
- **Exit Criteria**: Bean detail and list show correct remaining quantity. Values update after brew create/update/delete.

---

## Step 10 -- Repeat Brew (F7)

- **Goal**: Allow starting a new brew log pre-filled from a previous brew entry, accessible from the UI.
- **Scope**:
  - **Backend**:
    - **Application** `Features/BrewLog/Queries/GetRepeatBrewTemplate` -- returns pre-filled DTO (Bean, Brewer/Method, Recipe, Grinder, Accessories, Dose, WaterAmount, WaterTemperature, GrindSize). Excludes brew time, rating, tasting notes, adjustment ideas.
    - **Api**: `GET /api/brew-logs/{id}/repeat` endpoint.
  - **Frontend**:
    - Add "Repeat Brew" button to `BrewLogDetailPage`.
    - Clicking it calls the repeat endpoint, then navigates to `/brew-log/new?from={id}` with the form pre-filled from the template response.
    - User adjusts parameters, submits as a normal new brew.
- **Tests**:
  - Backend integration: Create a brew, call repeat endpoint, verify copied/excluded fields.
- **Verification**: `dotnet build && dotnet test`. `npm run build`. Manual via Aspire: log a brew, click "Repeat Brew", verify form is pre-filled with correct fields and blank for others, submit successfully.
- **Exit Criteria**: Repeat endpoint works. UI button triggers pre-filled form. New brew created successfully from template.

---

## Cross-Step Risks and Mitigations

- **Docker dependency**: Integration tests require Docker for Testcontainers. Aspire's PostgreSQL resource also needs Docker. **Mitigation**: Verify Docker is running in Step 1 before proceeding.
- **EF Migration ordering**: Each step adds a migration. Conflicting migrations can occur if steps are developed on parallel branches. **Mitigation**: Steps are sequential; each migration builds on the previous.
- **Many-to-many complexity**: Bean-FlavorNote, Accessory-Brewer, and BrewLog-Accessory join tables add mapping complexity. **Mitigation**: Front-load one M2M in Step 5 (Bean-FlavorNote) to establish the pattern before the others.
- **Grinder derived stats performance**: Computing stats from BrewLog on every Grinder detail query could be slow with many brews. **Mitigation**: Acceptable for single-user app. Can add caching or materialized view later if needed.
- **Remaining quantity consistency**: Computing on read avoids stale cache but adds query cost. **Mitigation**: Single SUM aggregate is fast for single-user volumes.
- **OpenAPI client drift**: API changes require running `npm run update-api-spec` then `npm run generate-api`. **Mitigation**: `update-api-spec` is a cross-platform script with URL override (`--url` or env var), so contract refresh is not tied to shell-specific tooling or a single fixed port. The spec file is diffable in PRs so contract changes are visible. CI always regenerates from the committed spec before building.
- **CORS during development**: Frontend and backend on different ports. **Mitigation**: CORS configured in Step 1 to allow all origins.
- **Aspire and Testcontainers port conflicts**: Both Aspire and integration tests spin up PostgreSQL containers. **Mitigation**: They use different container instances with dynamic ports, so no conflict. Tests run independently of Aspire.

---

## Final Validation Checklist

- `dotnet run --project backend/CoffeeTracker.AppHost` launches all resources (PostgreSQL, API, frontend)
- All resources healthy in Aspire dashboard
- Backend builds with zero warnings: `dotnet build --warnaserrors`
- All backend unit and integration tests pass: `dotnet test`
- Frontend builds: `npm run build` (in `frontend/`)
- Frontend lints clean: `npm run lint` (in `frontend/`)
- Every entity from the spec supports the required management actions (create/view/edit everywhere; delete where the spec explicitly requires remove/delete)
- Roaster detail shows associated beans (F1)
- Bean detail shows remaining quantity, price per kg, flavor notes, roaster (F2 + F6)
- Equipment registry covers Brewers, Grinders, Accessories with associations (F3)
- Grinder detail shows derived brew statistics (F3 + F5)
- Recipes filterable by brewer/method (F4)
- Brew log captures all specified fields with auto-calculated ratio (F5)
- Brew rating displayed with emoji picker on 1-5 scale (F8)
- Remaining bean quantity updates on brew create/update/delete (F6)
- Repeat brew button pre-fills form correctly (F7)
- Dark mode toggle works across all pages
- Swagger UI documents all endpoints
- Architecture tests enforce dependency rule
- No EF migration conflicts
