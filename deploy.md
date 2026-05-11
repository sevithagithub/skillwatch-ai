# SkillWatch AI — Deployment Guide

This project is split into a **Vite Frontend** and a **FastAPI Backend**. For the best performance and stability, we recommend a hybrid deployment:

## 1. Backend Deployment (Render / Railway)

Netlify is for static sites, so the FastAPI backend needs a platform that supports Python servers.

### Using Render (Recommended)
1.  **Create a New Web Service** on [Render](https://render.com/).
2.  Connect your GitHub repository.
3.  Set the **Environment** to `Docker`.
4.  Render will automatically use the `Dockerfile` in the root.
5.  Set the following environment variables if needed (e.g., `SECRET_KEY`).
6.  Once deployed, copy your backend URL (e.g., `https://skillwatch-backend.onrender.com`).

---

## 2. Frontend Deployment (Netlify)

1.  **Create a New Site** on [Netlify](https://www.netlify.com/).
2.  Connect your GitHub repository.
3.  **Site Settings**:
    *   **Base directory**: `frontend`
    *   **Build command**: `npm run build`
    *   **Publish directory**: `dist`
4.  **Important**: Open the `netlify.toml` file in the project root and update the `to` address in the redirects section to match your **actual backend URL** from Step 1.

```toml
[[redirects]]
  from = "/api/*"
  to = "https://your-backend-url.onrender.com/api/:splat"  # UPDATE THIS
  status = 200
  force = true
```

---

## 3. Environment Variables

Ensure your backend has the following set in the platform's dashboard:
- `JWT_SECRET`: A secure random string for authentication.
- `DATABASE_URL`: If you use an external database (otherwise it defaults to SQLite `skillwatch.db`).

## 4. Local Testing with Docker

To test the deployment setup locally:
```bash
docker build -t skillwatch-backend .
docker run -p 8000:8000 skillwatch-backend
```
