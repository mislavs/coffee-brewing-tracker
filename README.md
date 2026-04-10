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

The repo includes production Dockerfiles for:

- `frontend/Dockerfile`
- `backend/Dockerfile`

The frontend container reads its backend base URL from the `API_URL` environment variable at container startup. Set that value in your `docker-compose.yml` so the same frontend image can be reused across environments without rebuilding.

Example:

```yaml
services:
  frontend:
    image: ghcr.io/<owner>/coffee-brewing-tracker-frontend:<tag>
    environment:
      API_URL: http://api:8080
```

## GitHub Actions

The repository uses two workflow files under `.github/workflows/`:

- `ci.yml` runs automatically on pull requests and pushes to `master`.
- `publish-images.yml` is manual only and publishes the `frontend` and `api` images to GHCR.

To publish images:

1. Wait for `ci.yml` to pass on the ref you want to deploy.
2. Open the `Publish Images` workflow in GitHub Actions.
3. Run it with:
   - `ref`: the branch, tag, or commit to publish
   - `version`: an optional tag like `v0.1.0`

Each published image always gets a `sha-<shortsha>` tag. When `version` is provided, that tag is pushed as well.

Published package names:

- `ghcr.io/<owner>/coffee-brewing-tracker-frontend`
- `ghcr.io/<owner>/coffee-brewing-tracker-api`

GitHub repository settings should allow workflow write access so `GITHUB_TOKEN` can push packages to GHCR. In practice, that means Actions must be enabled and workflow permissions should allow read/write access for package publishing.