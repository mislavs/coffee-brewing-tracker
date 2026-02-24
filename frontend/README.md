# Coffee Brewing Tracker Frontend

React SPA for the Coffee Brewing Tracker project.

## Stack

- React + TypeScript + Vite
- `react-router-dom` for routing
- `@tanstack/react-query` for server state
- Tailwind CSS v4 + `shadcn/ui`
- Orval-generated TypeScript API client from `openapi.json`

## Prerequisites

- Node.js 20+
- npm 10+
- Optional for `update-api-spec`: backend API running at `http://localhost:5081` (or set a custom URL)

## Setup

```bash
npm install
```

## Run

```bash
npm run dev
```

## API Client Workflow

1. Refresh OpenAPI contract:

```bash
npm run update-api-spec
```

2. Generate typed client:

```bash
npm run generate-api
```

`openapi.json` is committed. Generated client code is written to `src/lib/api/generated/` and ignored by git.

For convenience, run both steps together:

```bash
npm run api:sync
```

## Environment

Default local config is in `.env`:

```env
VITE_API_URL=http://localhost:5081
```

Override locally with `.env.local`.

## Scripts

- `npm run dev` - start Vite dev server
- `npm run build` - regenerate API client, type-check, and build
- `npm run lint` - run ESLint
- `npm run format` - run Prettier
- `npm run update-api-spec` - download Swagger JSON to `openapi.json`
- `npm run generate-api` - generate Orval TypeScript client
- `npm run api:sync` - refresh OpenAPI contract and regenerate client
- `npm run preview` - preview production build
