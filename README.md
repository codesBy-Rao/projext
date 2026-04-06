# CodeBugX

CodeBugX is a full-stack project with:

- Frontend: React + Vite (`codebugx/client`)
- Backend: Node.js + Express (`codebugx/server`)

## Quick Start

From the project root:

```bash
npm run setup
```

What setup does:

- Installs root, client, and server dependencies
- Creates `codebugx/server/.env` from `codebugx/server/.env.example` (if missing)
- Runs API smoke checks

Then start the app:

```bash
npm run start
```

If setup shows Windows `EPERM` file lock warnings (for example around `esbuild.exe`), close running dev servers and run `npm run setup` again.

## Run Locally

From the project root:

```bash
npm run dev
```

This starts both frontend and backend concurrently.

Default URLs:

- Client: `http://localhost:3000` (Vite may move to another port if busy)
- API: `http://localhost:5000`

## API Smoke Test

Run core reliability checks in one command from project root:

```bash
npm run smoke:api
```

What it checks:

- Health endpoint returns `200`
- Unknown route returns `404`
- Invalid auth payload returns `400`
- Protected analyze route without token returns `401`

## Demo Account (Seed Data)

From the project root:

```bash
npm run seed:demo
```

This creates or refreshes a demo user plus sample analytics/history data.

Default demo credentials:

- Email: `demo@codebugx.dev`
- Password: `DemoPass123!`

You can override these with backend env vars `DEMO_EMAIL` and `DEMO_PASSWORD`.

To enable one-click demo data reset from the Login page, set `DEMO_RESET_TOKEN` in backend env.
The Login page includes a `Reset Demo Data (Admin)` button that prompts for this token.

You can also call the reset endpoint directly:

```bash
curl -X POST http://localhost:5000/api/ops/reset-demo -H "x-admin-token: your_token"
```

## Backend Only

Start backend only (normal mode):

```bash
npm --prefix ./codebugx/server run dev
```

Before first backend run, create an env file from the template (only needed if you did not run `npm run setup`):

```powershell
Copy-Item ./codebugx/server/.env.example ./codebugx/server/.env
```

## Degraded Mode (Start Without Database)

Use this only for API/middleware debugging when MongoDB is unavailable.

PowerShell:

```powershell
$env:ALLOW_START_WITHOUT_DB="true"
$env:MONGO_URI="mongodb://127.0.0.1:27018/nonexistent"
node "./codebugx/server/server.js"
```

In degraded mode, API starts but database-dependent routes may fail.

## Notes

- Keep `codebugx/server/.env` configured for normal startup.
- Request IDs and request logging are enabled on the backend.
- Do not commit real secrets. Use `codebugx/server/.env.example` as the shared template.
