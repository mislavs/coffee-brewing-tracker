# Features

## Product Overview

Coffee Brewing Tracker helps a coffee enthusiast track beans, roasters, brewing gear, recipes, and brew sessions. The app is optimized for personal logging, repeatable brewing, and lightweight analysis of what beans and recipes produce the best cups.

## Shipped Behavior

### Roaster Library

Users can create, view, edit, delete unused roasters, and browse roasters. Roasters can include location details and optional logos, and beans reference roasters so roaster information is entered once and reused.

### Bean Library

Users can catalog purchased coffee beans with roaster, origin countries, variety, processing method, roast profile, roast date, altitude, flavor notes, bag weight, price, rating, notes, and availability. Bean lists support search, country filtering, sorting, and available/unavailable visibility. Remaining quantity is calculated from logged brew doses.

### Bean Image Parsing

When AI extraction is configured, users can upload a bean bag image to prefill bean form fields. When AI extraction is unavailable, the app continues to run without exposing that capability.

### Equipment Registry

Users can manage brewers, grinders, and accessories. Accessories can be associated with compatible brewers so brew logging can filter tools by brewing method.

### Recipe Library

Users can create, view, edit, and browse recipes tied to brewers. Recipes store process notes and can be selected when logging a brew.

### Brew Log

Users can create, view, edit, delete, filter, and paginate brew log entries. A brew records bean, brewer, optional recipe, optional grinder, accessories, dose, water amount, water temperature, grind size, brew time, rating, tasting notes, and adjustment ideas. Brew ratio is derived from dose and water amount.

### Quick And Repeat Logging

Users can start a quick log flow from the brew log list, repeat a previous brew as a new brew template, and repeat a previous bean as a new bean purchase template. Repeat flows copy setup fields while leaving session-specific results for the new entry.

### Voice Brew Log Parsing

When transcription and extraction providers are configured, users can dictate a brew description and review parsed form values before saving. Feature availability is server-gated so the UI can hide voice entry when dependencies are missing.

### Stats And Maps

The app exposes dashboard statistics and country map data so users can see aggregate brewing and bean-origin information.

### Deployment And Operations

The production container serves both the API and the built SPA. PostgreSQL is external, and the API applies migrations at startup for the current single-container deployment model.

## Planned Or Unresolved Behavior

- Keep `docs/SPEC.md` as the broader product specification while this file remains the concise behavior map.
- Revisit low-bean notification behavior before treating it as shipped user-facing behavior.
- Add ADRs for future decisions that change persistence shape, external integrations, ownership boundaries, or deployment assumptions.

## Out Of Scope

- Multi-user accounts, authentication, authorization, and tenancy are not currently product features.
- A separate BFF or independently deployed frontend service is not part of the current deployment model.
- Detailed API payloads, database schemas, and generated client references belong in generated docs or source code, not this feature summary.

## Validation Expectations

- Product behavior changes should update this file when user-facing capabilities change.
- Architecture-only changes should update `docs/architecture.md` instead.
- Finished implementation plans should move from `docs/exec-plans/active/` to `docs/exec-plans/completed/`.
