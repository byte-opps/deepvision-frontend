# DeepVision Frontend — Setup & Usage Guide

This frontend connects to the **DeepVision backend API** running on this server
(public IP `193.237.154.180`, port `8076`). All API calls go through
`src/lib/api.ts` using the `VITE_API_URL` in `.env`, so no local proxy is needed.

## Prerequisites

- **Node.js 18+** (https://nodejs.org/)
- **npm 9+** (comes with Node.js 18+)

## Setup

### 1. Clone or Copy the Frontend

```bash
# Option A: Clone from repository
git clone <repository-url> deepvision-frontend
cd deepvision-frontend

# Option B: Copy the frontend directory
# Copy the caption/frontend/ directory to your machine
```

### 2. Install Dependencies

```bash
npm install
```

This installs all required packages (React, Tailwind CSS, Zustand, TanStack Query, etc.)

### 3. Configure API Connection

The API URL is already set in `.env.example` to the server's public IP.
Copy it to `.env` (so it never gets committed to git):

```bash
cp .env.example .env
```

If the IP or scheme needs to change, edit `.env`:

```env
# Backend on this server (default, already configured)
VITE_API_URL=http://193.237.154.180:8076

# Behind HTTPS / a custom domain
VITE_API_URL=https://deepvision.yourdomain.com
```

### 4. Start Development Server

```bash
npm run dev
```

This starts the Vite dev server on `http://localhost:8077/`.

**Open your browser to:** http://localhost:8077/

**Features of dev server:**
- Hot module reloading (changes reflected instantly)
- API calls go directly to `VITE_API_URL` (backend allows CORS `*`)
- Port 8077 (backend uses 8076)

### 5. Build for Production (Optional)

```bash
npm run build
```

Creates optimized files in `dist/`. Serve with `npm run preview` or deploy `dist/`
to any static host (nginx, Apache, etc.).

## First Login

1. Open http://localhost:8077/
2. Click "Login"
3. Register a new account (username, password, email)
4. Login with those credentials → redirected to the Dashboard

## Common Issues

### Can't reach the backend (network/firewall)

The laptop must be able to reach `http://193.237.154.180:8076` from the internet:

1. Confirm the URL works from your laptop:
   `curl http://193.237.154.180:8076/`
2. If it fails, the server's firewall or cloud **security group** may be blocking
   port 8076 — open inbound TCP 8076 (or use HTTPS 443 with a domain).
3. Confirm your `.env` points to the correct URL.

### CORS Errors

Backend allows `allow_origins: ["*"]`, so cross-origin requests from your laptop
should work. If you see CORS errors, verify the backend is actually running on
port 8076 and reachable from your machine.

### Port Already in Use

If port 8077 is occupied, edit `vite.config.ts` `server.port`.

### TypeScript Errors

```bash
npx tsc --noEmit
```

Fix any errors, then rebuild: `npm run build`.

## Architecture Notes

- Frontend only knows about API endpoints, never backend implementation details
- All API calls go through `src/lib/api.ts` (single source of truth)
- Authentication uses JWT tokens stored in localStorage
- Backend must be running before the frontend can function

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server (port 8077) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npx tsc --noEmit` | Typecheck |

## Backend Requirements

The backend API must be running and reachable at `VITE_API_URL`.

**To start the backend on the server:**

```bash
cd caption
source venv/bin/activate
uvicorn api.main:app --host 0.0.0.0 --port 8076
```

It is installed as a systemd service (`deepvision-api.service`, enabled/restarts
automatically). Verify it is running with:

```bash
systemctl status deepvision-api.service
curl http://localhost:8076/
```
