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

## Scripts

- `npm run dev` - start Vite dev server
- `npm run build` - regenerate API client, type-check, and build
- `npm run lint` - run ESLint
- `npm run format` - run Prettier
- `npm run update-api-spec` - download Swagger JSON to `openapi.json`
- `npm run generate-api` - generate Orval TypeScript client
- `npm run api:sync` - refresh OpenAPI contract and regenerate client
- `npm run preview` - preview production build
