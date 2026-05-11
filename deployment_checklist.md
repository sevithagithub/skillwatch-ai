# 🚀 SkillWatch AI Deployment Checklist

Follow these steps to get your system live:

## Phase 1: GitHub Push
1. Create a **new repository** on [GitHub](https://github.com/new).
2. Run these commands in your terminal:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

## Phase 2: Backend (Render)
1. Go to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository.
4. Render will detect the `render.yaml` file. It will use the **Docker** environment.
5. In the **Environment Variables** section, ensure `JWT_SECRET` is set (Render might generate it automatically if you use the Blueprint).
6. Once deployed, copy your **Service URL** (e.g., `https://skillwatch-backend.onrender.com`).

## Phase 3: Frontend (Netlify)
1. Go to [Netlify Dashboard](https://app.netlify.com/).
2. Click **Add new site** > **Import an existing project**.
3. Connect to GitHub and select the same repository.
4. **Site Settings**:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. **CRITICAL**: Before clicking deploy, update the `netlify.toml` file in your code (or via the Netlify UI redirects) to point to your **Render URL** from Phase 2.

## Phase 4: Syncing URLs
1. Update your local `netlify.toml`:
   ```toml
   [[redirects]]
     from = "/api/*"
     to = "https://YOUR-RENDER-URL.onrender.com/api/:splat"
     status = 200
     force = true
   ```
2. Commit and push the change:
   ```bash
   git add netlify.toml
   git commit -m "Update backend URL for production"
   git push
   ```

Netlify will automatically redeploy, and your system will be fully operational!
