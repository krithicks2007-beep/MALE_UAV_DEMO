# MALE UAV Dashboard — Frontend

React + Vite + TypeScript dashboard for the **MALE UAV Aero-Piston Engine Digital Twin**.

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and set your backend URL
cp .env.example .env
# Edit .env if your backend is running on a different host/port

# 3. Start dev server (auto-proxies /api and /ws to localhost:8000)
npm run dev
```

> **Requires the backend to be running** at `http://localhost:8000` for live data.  
> The Vite dev proxy handles `/api/*` and `/ws/*` so you won't hit CORS issues locally.

---

## Production Build

```bash
npm run build
# Output in: dist/
```

---

## Hosting Options

### Vercel
```bash
npm i -g vercel
vercel deploy

# Set environment variables in Vercel dashboard:
# VITE_BACKEND_WS_URL  = wss://your-backend.railway.app/ws/telemetry
# VITE_BACKEND_API_URL = https://your-backend.railway.app
```

### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist

# Set env vars in Netlify dashboard:
# VITE_BACKEND_WS_URL  = wss://your-backend.railway.app/ws/telemetry
# VITE_BACKEND_API_URL = https://your-backend.railway.app
```

### Nginx (Self-hosted)
```nginx
server {
    listen 80;
    server_name your-dashboard.example.com;
    root /var/www/male-uav-dashboard/dist;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
}
```

---

## Environment Variables

| Variable | Description | Default (dev) |
|---|---|---|
| `VITE_BACKEND_WS_URL` | WebSocket URL for live telemetry | `ws://localhost:8000/ws/telemetry` |
| `VITE_BACKEND_API_URL` | REST API base URL | `http://localhost:8000` |

---

## Tech Stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** — dark aerospace design system
- **Zustand** — state management
- **Three.js** / **React Three Fiber** — 3D twin view
- **uPlot** — high-frequency time-series charts
- **Lucide React** — icons
