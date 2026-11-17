# AEMA LAB — Deployment & Publishing Guide

Comprehensive instructions for deploying **AEMA LAB** to cloud hosting platforms (Vercel, Render, Railway, Docker, or self-hosted VPS).

---

## Architecture Overview

```
               [ Users / Web Browsers ]
                         │
          ┌──────────────┴──────────────┐
          ▼                             ▼
  [ Frontend SPA ]             [ Backend API ]
  Vercel / Netlify / Render    Render / Railway / Fly.io / Docker
  (React + Vite + Tailwind)    (FastAPI + Scikit-learn + SQLite)
          │                             │
          └──────────────┬──────────────┘
                         │ REST Calls (/api)
                         ▼
               [ Persistent Database ]
               SQLite / PostgreSQL
```

---

## Option 1: Vercel (Frontend) + Render (Backend) [Recommended Free-Tier]

### Step 1: Deploy Backend to Render

1. Create a free account at [render.com](https://render.com).
2. Connect your GitHub repository containing the AEMA project.
3. Click **New +** → **Web Service**.
4. Configure the service:
   - **Name**: `aema-lab-backend`
   - **Root Directory**: `.` (or leave blank)
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables:
   - `CORS_ORIGINS`: `*` (or your Vercel frontend URL once deployed)
   - `DATABASE_URL`: `sqlite:////tmp/aema_lab.db` (or attach a Render managed PostgreSQL database)
6. Click **Create Web Service**. Once deployed, copy your backend URL (e.g. `https://aema-lab-backend.onrender.com`).

---

### Step 2: Deploy Frontend to Vercel

1. Create a free account at [vercel.com](https://vercel.com).
2. Click **Add New...** → **Project** and select your GitHub repository.
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**, add:
   - `VITE_API_URL`: `https://aema-lab-backend.onrender.com/api` *(use your actual Render backend URL)*
5. Click **Deploy**. Vercel will build and assign you a live production URL (e.g. `https://aema-lab.vercel.app`).

---

## Option 2: Render Blueprint (One-Click Monorepo)

A complete `render.yaml` specification is included in the root directory.

1. Go to [dashboard.render.com/blueprints](https://dashboard.render.com/blueprints).
2. Click **New Blueprint Instance**.
3. Select this repository.
4. Render will automatically read `render.yaml` and provision both:
   - `aema-lab-backend` (FastAPI Web Service)
   - `aema-lab-frontend` (Static Site with SPA rewrite rules)

---

## Option 3: Full Docker Container Deployment

You can run the entire production-grade stack locally or on any cloud VPS (AWS EC2, DigitalOcean, Hetzner, Linode) using Docker Compose:

```bash
# Build and start all services in detached mode
docker-compose up --build -d

# Check running container health
docker-compose ps

# View live application logs
docker-compose logs -f
```

- Frontend web UI: `http://localhost:3000`
- Backend API endpoints: `http://localhost:8000`
- Interactive Swagger API docs: `http://localhost:8000/docs`

---

## Option 4: Local Production Manual Run

### Terminal 1: Backend
```powershell
# From project root
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
```

### Terminal 2: Frontend
```powershell
cd frontend
npm run build
npm run preview
```

---

## Environment Variables Reference

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `sqlite:///./aema_lab.db` | SQLAlchemy connection string (SQLite or PostgreSQL) |
| `CORS_ORIGINS` | `["http://localhost:5173", "http://localhost:3000"]` | Allowed CORS origins for frontend requests |
| `UPLOAD_DIR` | `./uploads` | Storage directory for uploaded datasets and reports |
| `VITE_API_URL` | `/api` | Base URL used by the frontend to communicate with backend |

---

## Continuous Integration (CI)

The repository includes a GitHub Actions workflow in `.github/workflows/ci.yml` that automatically:
- Executes the Python 3.12 Pytest suite on every push.
- Installs Node dependencies and validates TypeScript build compilation for the frontend.
