# Turf

Pitch booking and venue management for Nairobi: an app for venue owners and staff (calendar, walk-ins, payments at the venue, reports) and for players (find a pitch, book a slot).

| Path | What it is |
|------|------------|
| `apps/web` | Web app: Vite + React 19 + Tailwind v4 (phone, tablet and desktop layouts) |
| `apps/api` | API: NestJS 12, served under `/api/v1` |
| `packages/database` | Prisma 7 schema, migrations and client (Postgres + PostGIS) |
| `packages/validation` | Zod schemas and helpers shared by the web app and the API |
| `infrastructure` | Docker Compose for local Postgres/PostGIS and Redis |
| `docs` | [SRS](docs/SRS), [implementation plan](docs/IMPLEMENTATION_PLAN.md), [build plan](docs/BUILD_PLAN.md), [OTP guide](docs/OTP_GUIDE.md) |

## Getting started

You need **Node 22+**, **pnpm 10** (`corepack enable`), and **Docker** ([OrbStack](https://orbstack.dev) or Docker Desktop) for the database.

```bash
pnpm install
cp .env.example .env
pnpm dev
```

`pnpm dev` starts Postgres and Redis in Docker, applies database migrations, builds the shared packages and runs everything in watch mode:

- Web app: <http://localhost:8443>
- API: <http://localhost:3000/api/v1/health>. The web app forwards `/api` requests to it.

Sign in with the demo accounts in the [OTP guide](docs/OTP_GUIDE.md), e.g. `722 000 111` with code `123456`.

**Frontend only (no Docker):** `pnpm dev:web`. The screens run on sample data.

## Demo data

Until the API has real tables, the web app keeps its data in the browser (`src/app/DemoStore.tsx`):

- Everything in the app works on this data: bookings (new, move, extend, cancel, no-show), payments, requests, venue settings (details, pitches, opening hours, pricing, blocked periods, booking rules, team, notifications), listing a new venue, reports with CSV export, and on the player side filters, the map, favourites and reviews.
- New bookings, payments and settings changes show up on every screen straight away, and a manager you invite can sign in with their number.
- Player bookings reach the owner's Today and Requests. Two tabs in the same browser stay in sync, so an owner window and a player window work side by side (two different devices don't sync until the API lands).
- The sample bookings are dated relative to today, and the data resets each day. To start fresh before a demo, open **`/reset-demo`**.

## Common commands

| Command | What it does |
|---------|--------------|
| `pnpm dev` | Database + API + web app, all in watch mode |
| `pnpm dev:web` | Web app only |
| `pnpm db:up` / `pnpm db:down` | Start / stop Postgres and Redis |
| `pnpm db:migrate` | Create and apply a migration after editing `packages/database/prisma/schema.prisma` |
| `pnpm db:reset` | Drop the local database and re-apply all migrations |
| `pnpm typecheck` · `pnpm lint` · `pnpm test` · `pnpm build` | What CI runs on every push |

API tests that need the real database are skipped unless `RUN_INTEGRATION=1` is set: `pnpm db:up && RUN_INTEGRATION=1 pnpm test`.

## Health check

`GET /api/v1/health` returns `200` when the database and Redis are reachable and `503` otherwise, with details:

```json
{
  "status": "ok",
  "version": "0.1.0",
  "uptimeSeconds": 42,
  "time": "2026-09-24T18:00:00.000Z",
  "checks": {
    "database": { "status": "up", "latencyMs": 3, "postgis": "3.5.2" },
    "redis": { "status": "up", "latencyMs": 1 }
  }
}
```
