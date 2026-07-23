# my-react-ui

A **React + Vite + TypeScript** UI for the [`my-fastapi-backend`](../my-fastapi-backend) demo,
packaged to deploy on **Databricks Apps**. It provides a small console to view the
backend health, list/create/delete items, and inspect the backend environment.

## What it does

- Connects to the deployed FastAPI backend by URL (set in the UI or at build time).
- Shows a live **health** indicator (`GET /health`).
- Lists items (`GET /items`), creates items (`POST /items`), deletes items (`DELETE /items/{id}`).
- Displays backend env info (`GET /env`).

## Project structure

```
my-react-ui/
├── app.yaml            # Databricks Apps entrypoint (runs server.js)
├── server.js           # Express static server, binds to $DATABRICKS_APP_PORT
├── package.json
├── vite.config.ts
├── index.html
├── .env.example        # VITE_BACKEND_URL (optional build-time backend URL)
└── src/
    ├── main.tsx
    ├── App.tsx         # UI
    ├── api.ts          # backend client
    ├── types.ts
    ├── App.css
    └── index.css
```

## Run locally

```powershell
npm install
npm run dev
```

Open http://localhost:5173, paste your backend URL (e.g. `http://127.0.0.1:8000`)
into the **Backend URL** field, and click **Connect**.

> When running the backend locally, its default `ALLOWED_ORIGINS` already permits
> `http://localhost:5173`, so browser CORS calls work out of the box.

## Configure the backend URL

Two options:

1. **Runtime (recommended for demos):** type the backend URL in the UI. It is saved
   in the browser's `localStorage`, so no rebuild is needed.
2. **Build time:** copy `.env.example` to `.env`, set `VITE_BACKEND_URL`, then build.

## Build for production

```powershell
npm run build      # outputs static assets to ./dist
npm start          # serves ./dist via server.js on $DATABRICKS_APP_PORT (defaults to 8000)
```

## Deploy to Databricks Apps

Databricks Apps runs the command in `app.yaml` (`node server.js`), which serves the
prebuilt `./dist` folder and binds to `$DATABRICKS_APP_PORT`.

**Build before deploying** so `./dist` exists:

```powershell
npm install
npm run build
```

### Option A — Databricks CLI

```bash
# 1. Create the app (once)
databricks apps create my-react-ui

# 2. Sync this folder (including ./dist) to your workspace
databricks sync . /Workspace/Users/<you>/my-react-ui

# 3. Deploy
databricks apps deploy my-react-ui \
  --source-code-path /Workspace/Users/<you>/my-react-ui
```

### Option B — Databricks UI

1. In your workspace, go to **Compute → Apps → Create app**.
2. Choose **Custom** app.
3. Point it to this folder (must contain `app.yaml`, `server.js`, `package.json`, and `dist/`).
4. Click **Deploy**.

Once deployed, open the app URL and enter the backend app's URL in the **Backend URL** field.

## CORS between the two apps

The UI and backend are separate Databricks Apps with different origins. Set the backend's
`ALLOWED_ORIGINS` to include this UI's deployed URL, e.g. in the backend `app.yaml`:

```yaml
env:
  - name: "ALLOWED_ORIGINS"
    value: "https://my-react-ui-xxxx.databricksapps.com"
```

## Notes

- Always bind to `$DATABRICKS_APP_PORT`; never hard-code the port.
- `app.yaml`, `server.js`, and `dist/` must be at the root of the deployed folder.
- Keep dependencies pinned in `package.json` for reproducible builds.
