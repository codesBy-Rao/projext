# CodeBugX

CodeBugX is a full-stack project with:

- Frontend: React + Vite (`codebugx/client`)
- Backend: Node.js + Express (`codebugx/server`)

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

## Backend Only

Start backend only (normal mode):

```bash
npm --prefix ./codebugx/server run dev
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
