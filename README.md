# Coffee Brewing Tracker

A full-stack application for tracking coffee beans, brewing sessions, equipment, and recipes.

## What it does

- **Bean management** – catalog beans with roaster, origin, variety, processing method, roast profile, flavor notes, and more
- **Brew logging** – record brews with dose, water, grind, time, rating, and tasting notes
- **Recipes** – save and reuse brewing recipes per brewer
- **Equipment** – track brewers, grinders, and accessories
- **Roasters** – manage roasters with optional logo uploads
- **Stats** – dashboard and country-map statistics
- **AI features** – parse bean info from label images and brew logs from voice input

## Tech stack

| Layer | Stack |
|---|---|
| **Backend** | .NET 10, ASP.NET Core, EF Core, PostgreSQL, MediatR (CQRS), FluentValidation |
| **Frontend** | React 19, TypeScript, Vite, TanStack Query, Tailwind CSS, shadcn/ui |

## Container Images

The repo includes one production Dockerfile at the repository root:

- `Dockerfile`

The image builds the React SPA, copies the generated `dist` output into the ASP.NET API image, and serves both the frontend and `/api/*` from Kestrel. PostgreSQL should run as a separate managed database or container.

Example:

```yaml
services:
  app:
    image: ghcr.io/<owner>/coffee-brewing-tracker:<tag>
    ports:
      - "80:8080"
    environment:
      ASPNETCORE_ENVIRONMENT: Production
      ConnectionStrings__DefaultConnection: "Host=postgres;Database=coffee;Username=postgres;Password=<password>"
```

In production, the API applies pending database migrations on startup. This is intended for a single running app container. If the app is later scaled to multiple replicas, move migrations to a one-shot job or service before scaling out.

## GitHub Actions

The repository uses two workflow files under `.github/workflows/`:

- `ci.yml` runs automatically on pull requests and pushes to `master`.
- `publish-images.yml` is manual only and publishes the unified app image to GHCR.

To publish images:

1. Wait for `ci.yml` to pass on the ref you want to deploy.
2. Open the `Publish Images` workflow in GitHub Actions.
3. Run it with:
   - `ref`: the branch, tag, or commit to publish
   - `version`: an optional tag like `v0.1.0`

Each published image always gets a `sha-<shortsha>` tag. When `version` is provided, that tag is pushed as well.

Published package names:

- `ghcr.io/<owner>/coffee-brewing-tracker`

GitHub repository settings should allow workflow write access so `GITHUB_TOKEN` can push packages to GHCR. In practice, that means Actions must be enabled and workflow permissions should allow read/write access for package publishing.