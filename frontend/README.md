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

Local dev continues to use `VITE_API_URL` from `.env` or the Aspire-provided value.

## API URL Configuration

The frontend resolves its API base URL in this order:

1. `window.__APP_CONFIG__.apiUrl` from `/config.js`
2. `VITE_API_URL`
3. `http://localhost:5081`

The app now loads `/config.js` before the Vite bundle. The default file lives at `public/config.js` and initializes `window.__APP_CONFIG__` as an empty object.

This is intended to support future container startup configuration without rebuilding the frontend image. A container entrypoint can generate `/config.js` with content like:

```js
window.__APP_CONFIG__ = {
  apiUrl: 'http://your-server:5081',
}
```

Aspire and local Vite development do not need this override because they can continue providing `VITE_API_URL`.

## Scripts

- `npm run dev` - start Vite dev server
- `npm run build` - regenerate API client, type-check, and build
- `npm run lint` - run ESLint
- `npm run format` - run Prettier
- `npm run update-api-spec` - download Swagger JSON to `openapi.json`
- `npm run generate-api` - generate Orval TypeScript client
- `npm run api:sync` - refresh OpenAPI contract and regenerate client
- `npm run preview` - preview production build
