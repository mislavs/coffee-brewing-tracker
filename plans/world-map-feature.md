# World Map Feature

## Assumptions

- Test/dev data in DB -- countries table can be reset/replaced with seeded data
- Seed all ~195 countries with ISO alpha-2 and ISO numeric codes
- The `world-atlas` TopoJSON (`countries-110m.json`) uses ISO 3166-1 numeric codes as feature `id` -- match on those
- Map library: `react-simple-maps` (proven in POC at `D:\other\world-map-poc\`)
- Choropleth: darker fill = more beans (linear scale from lightest to darkest based on bean count)
- Compact map on all pages (below header, above `DashboardStats`); full-page map at `/map` route
- Tooltip stats: bean count, total weight, avg brew rating, total brews

---

## Step 1: Enhance Country Entity with ISO Codes + Seed Countries

**Goal:** Country entity gains ISO codes; all ~195 countries are pre-seeded in the database.

**Scope:**

- Add `IsoAlpha2` (string, 2 chars, e.g. `"BR"`) and `IsoNumericCode` (string, 3 chars, e.g. `"076"`) to `[Country](backend/src/CoffeeTracker.Domain/Entities/Country.cs)` entity
- Update `[CountryConfiguration](backend/src/CoffeeTracker.Infrastructure/Persistence/Configurations/CountryConfiguration.cs)`: add column constraints + unique indexes on the new fields
- Update `Country.Create(...)` factory to accept the new fields
- Create a new EF Core migration that:
  - Adds the two columns
  - Deletes existing test countries (and their `BeanCountry`/`Roasters` FK references first)
  - Seeds all ~195 countries via raw SQL `INSERT` with deterministic GUIDs (following the existing raw-SQL-in-migration pattern from `[LinkRoasterToCountryEntity](backend/src/CoffeeTracker.Infrastructure/Persistence/Migrations/20260224143423_LinkRoasterToCountryEntity.cs)`)
  - Re-links any orphaned `BeanCountry` / `Roasters.CountryId` rows to the new country IDs by matching on `Name`
- Update `[seed-test-data.sql](scripts/seed-test-data.sql)`:
  - **Remove** the Countries INSERT block (lines 175-184) -- countries are now migration-seeded reference data
  - **Remove** the Countries DELETE block (lines 163-168) -- don't delete reference data
  - **Update** Roasters INSERT (lines 191-199) to use the migration-seeded deterministic GUIDs for "United States" and "Norway"
  - **Update** BeanCountry INSERT (lines 281-298) to use the migration-seeded deterministic GUIDs for Ethiopia, Colombia, Kenya, Brazil, Guatemala, Indonesia
- Update `[delete-all-data.sql](scripts/delete-all-data.sql)`: remove `DELETE FROM "Countries"` (line 29) -- countries are reference data that should survive a full wipe
- Update `[CountryDto](backend/src/CoffeeTracker.Application/Features/Countries/Dtos/CountryDto.cs)` to include `IsoAlpha2` and `IsoNumericCode`

**Tests:**

- Update/add domain tests for `Country` entity with new fields
- Existing architecture tests should continue passing

**Verification:** `dotnet build` and `dotnet test` from solution root

**Exit criteria:** Migration applies, countries table has ~195 rows with ISO codes, existing features still work.

---

## Step 2: Country Map Stats API Endpoint

**Goal:** New endpoint returns per-country aggregated stats for the map choropleth and tooltips.

**Scope:**

- New DTO in `[Features/Stats/Dtos/](backend/src/CoffeeTracker.Application/Features/Stats/Dtos/)`:

```csharp
public sealed record CountryMapStatsDto(
    Guid CountryId,
    string CountryName,
    string IsoAlpha2,
    string IsoNumericCode,
    int BeanCount,
    decimal TotalBagWeightGrams,
    decimal? AvgBrewRating,
    int TotalBrews);
```

- New query + handler in `[Features/Stats/Queries/](backend/src/CoffeeTracker.Application/Features/Stats/Queries/)` -- `GetCountryMapStatsQuery`/`GetCountryMapStatsHandler`
  - Joins Countries -> BeanCountry (join table) -> Beans -> BrewLogEntries
  - Groups by country, computes aggregates
  - Only returns countries that have at least one bean
- New `GET /api/stats/country-map` endpoint in `[StatsEndpoints](backend/src/CoffeeTracker.Api/Endpoints/StatsEndpoints.cs)`

**Tests:**

- Unit test for `GetCountryMapStatsHandler` (verify aggregation logic)

**Verification:** `dotnet build` and `dotnet test`

**Exit criteria:** `GET /api/stats/country-map` returns correct per-country stats.

---

## Step 3: Frontend -- WorldMap Component, Layout, Navigation, and Settings

**Goal:** Interactive world map renders below the nav bar on all pages with choropleth coloring and hover tooltips; toggleable via settings; dedicated `/map` route.

**Scope:**

- **Install dependency:** `react-simple-maps` (npm)
- **Regenerate API client:** `npm run generate-api` (picks up new stats endpoint + updated CountryDto)
- **New feature module** `src/features/world-map/`:
  - `hooks/useCountryMapStats.ts` -- TanStack Query hook calling `GET /api/stats/country-map`
  - `queryKeys.ts` -- query key factory
  - `components/WorldMap.tsx` -- main map component:
    - Uses `ComposableMap` + `Geographies` from `react-simple-maps` with `countries-110m.json` CDN URL (same as POC)
    - Builds lookup from API `isoNumericCode` -> stats; matches against GeoJSON `geo.id`
    - Choropleth: linear color scale from theme's muted color to primary color based on `beanCount`
    - Filters out Antarctica
  - `components/WorldMapTooltip.tsx` -- positioned tooltip showing:
    - Country name
    - Bean count
    - Total bag weight (formatted)
    - Avg brew rating (if available)
    - Total brews
  - `pages/WorldMapPage.tsx` -- full-page view wrapping WorldMap in a Card
- **Settings** (`[useSettings.ts](frontend/src/hooks/useSettings.ts)`):
  - Add `showWorldMap: boolean` (default `true`) to `AppSettings`
- **Settings UI** (`[SettingsButton.tsx](frontend/src/components/SettingsButton.tsx)`):
  - Add "Show world map" toggle (same pattern as dashboard stats toggle)
- **Layout** (`[AppLayout.tsx](frontend/src/components/AppLayout.tsx)`):
  - Render compact `WorldMap` between header and `DashboardStats`, conditionally on `settings.showWorldMap`
- **Navigation** (`[navigation.ts](frontend/src/lib/navigation.ts)`):
  - Add `{ path: 'map', href: '/map', title: 'Map' }` to `featureRoutes`
- **Routing** (`[App.tsx](frontend/src/App.tsx)`):
  - Add `<Route path="map" element={<WorldMapPage />} />`

**Tests:** N/A (visual component -- verified by build + manual inspection)

**Verification:** `npm run build`

**Exit criteria:** Map renders with choropleth on all pages, tooltip appears on hover, settings toggle hides/shows it, `/map` route shows full-page map.

---

## Step 4: Country Click Navigates to Filtered Beans Page

**Goal:** Clicking a highlighted country on the map opens the beans page filtered to that country.

**Scope:**

- **Backend** (`[GetBeansList.cs](backend/src/CoffeeTracker.Application/Features/Beans/Queries/GetBeansList.cs)`):
  - Add optional `Guid? CountryId` to `GetBeansListQuery`
  - Filter: `.Where(entity => entity.OriginCountries.Any(c => c.Id == request.CountryId))` when set
- **Backend** (`[BeanEndpoints.cs](backend/src/CoffeeTracker.Api/Endpoints/BeanEndpoints.cs)`):
  - Add `Guid? country` query parameter to `GetBeans` endpoint
- **Frontend**: Regenerate API client
- **Frontend** (`[BeanListPage.tsx](frontend/src/features/beans/pages/BeanListPage.tsx)`):
  - Read `?country=<guid>` from URL search params
  - Pass `countryId` to `useBeans` hook
  - Show active filter badge with country name + clear button when filtering by country
  - Fetch country name from countries list (existing `useCountries` hook)
- **Frontend** (`useBeans.ts`): Add `countryId` parameter, pass to API call
- **Frontend** (`WorldMap.tsx`): On country click, call `navigate(`/beans?country=${countryId}`)` using the stats lookup to resolve the country ID from the GeoJSON feature

**Tests:**

- Update `GetBeansListHandler` unit test to verify country filtering

**Verification:** `dotnet build`, `dotnet test`, `npm run build`

**Exit criteria:** Clicking a highlighted country navigates to `/beans?country=<id>` and the beans page shows only beans from that country with a visible filter indicator.

---

## Cross-Step Risks and Mitigations

- **Country name matching (eliminated):** By seeding ISO numeric codes and matching on `geo.id`, we avoid all fuzzy name matching issues.
- **Large seed migration:** ~195 INSERT statements in a migration is manageable. Using deterministic GUIDs (derived from ISO code) ensures idempotency if re-run logic is needed.
- **react-simple-maps bundle size:** The library is ~50KB gzipped. The TopoJSON file is loaded from CDN, not bundled. Acceptable tradeoff.
- **Compact map performance:** The map renders ~195 SVG paths. Memoize the component to avoid re-renders on unrelated state changes.

## Final Validation Checklist

- [ ] All countries seeded with correct ISO alpha-2 and numeric codes
- [ ] `GET /api/stats/country-map` returns correct aggregates
- [ ] Map renders with choropleth on every page (when enabled)
- [ ] Settings toggle hides/shows map; preference persists across reloads
- [ ] "Map" nav entry works, `/map` shows full-page map
- [ ] Hover tooltip shows: country name, bean count, total weight, avg rating, total brews
- [ ] Click on highlighted country navigates to `/beans?country=<id>` with correct filtering
- [ ] Click on country with no beans does nothing (no navigation)
- [ ] Beans page shows active country filter with clear button
- [ ] `dotnet build` and `dotnet test` pass
- [ ] `npm run build` succeeds
- [ ] Dark mode: map colors work in both themes
