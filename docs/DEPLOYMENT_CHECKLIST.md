# 📋 Deployment Checklist

Use this to ensure successful deployment.

---

## Pre-Deployment

### 1. Turso Database Setup
- [ ] Turso CLI installed: `turso --version`
- [ ] Logged in: `turso auth login`
- [ ] Database created: `turso db create blog-production`
- [ ] Got database URL: `turso db show blog-production --url`
- [ ] Got auth token: `turso db tokens create blog-production`
- [ ] Saved both values securely

### 2. Code Repository
- [ ] Code committed to Git
- [ ] Pushed to GitHub/GitLab
- [ ] Repository is public or connected to Vercel

### 3. Environment Variables Ready
- [ ] `TURSO_DATABASE_URL` - Turso database URL
- [ ] `TURSO_AUTH_TOKEN` - Turso auth token
- [ ] `JWT_SECRET` - Generated with `openssl rand -base64 32`

---

## Backend Deployment

### Option A: Vercel

- [ ] `vercel.json` exists in `backend/`
- [ ] Vercel CLI installed: `npm install -g vercel`
- [ ] Deployed: `cd backend && vercel`
- [ ] Environment variables added in Vercel dashboard
- [ ] Production deploy: `vercel --prod`
- [ ] Health check passes: `curl https://your-backend.vercel.app/health`
- [ ] Saved backend URL

### Option B: Fly.io (Recommended)

- [ ] `Dockerfile` exists in `backend/`
- [ ] `fly.toml` exists in `backend/`
- [ ] Fly CLI installed: `brew install flyctl` or `curl -L https://fly.io/install.sh | sh`
- [ ] Logged in: `fly auth login`
- [ ] App created: `fly apps create your-blog-backend`
- [ ] Secrets set: `fly secrets set TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... JWT_SECRET=...`
- [ ] Deployed: `fly deploy`
- [ ] Health check passes: `curl https://your-blog-backend.fly.dev/health`
- [ ] Saved backend URL

---

## Frontend Deployment

### Vercel (Next.js)

- [ ] `.env.production` created with backend URL
- [ ] Vercel CLI installed
- [ ] Deployed: `cd frontend && vercel`
- [ ] Environment variable added: `NEXT_PUBLIC_API_URL`
- [ ] Production deploy: `vercel --prod`
- [ ] Site loads: `https://your-blog.vercel.app`
- [ ] No console errors
- [ ] API calls work (check Network tab)

---

## Database Initialization

- [ ] Schema initialized (one of these):
  - [ ] Via Turso shell: `turso db shell blog-production < schema.sql`
  - [ ] Via backend setup endpoint: `curl -X POST https://backend/api/setup`
- [ ] Admin user created
- [ ] Can login at: `https://your-blog.vercel.app/login`

---

## Testing in Production

### Basic Functionality
- [ ] Homepage loads
- [ ] Blog list shows
- [ ] Individual post loads
- [ ] RSS feed works: `/feed.xml`

### Admin Panel
- [ ] Can access login page
- [ ] Can login with admin credentials
- [ ] Redirects to `/admin`
- [ ] Dashboard loads
- [ ] Can create new post
- [ ] Can edit existing post
- [ ] Can upload images
- [ ] Can delete post

### Images
- [ ] Image upload works
- [ ] Uploaded images display
- [ ] Thumbnails generate
- [ ] WebP variants create
- [ ] Analytics shows data

### API Endpoints
- [ ] `GET /health` - Returns 200
- [ ] `GET /api/posts` - Returns posts
- [ ] `GET /feed.xml` - Returns RSS XML
- [ ] `POST /api/auth/login` - Login works
- [ ] `GET /api/images/analytics` - Returns stats

---

## Performance Check

- [ ] Lighthouse score > 90
- [ ] Images load quickly
- [ ] No console errors
- [ ] No 404s in Network tab
- [ ] HTTPS enabled (automatic)
- [ ] Gzip compression enabled

---

## SEO & Content

- [ ] Site title set
- [ ] Meta descriptions added
- [ ] OG tags configured
- [ ] Robots.txt exists
- [ ] Sitemap.xml exists
- [ ] RSS feed accessible

---

## Security

- [ ] Changed default admin password
- [ ] Strong JWT_SECRET set
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] No sensitive data in frontend code
- [ ] Environment variables not exposed

---

## Monitoring

### Vercel
- [ ] Checked deployment logs
- [ ] No build errors
- [ ] Analytics enabled (optional)

### Fly.io (if used)
- [ ] Checked logs: `fly logs`
- [ ] VM running: `fly status`
- [ ] Health checks passing

### Turso
- [ ] Database accessible
- [ ] Usage within limits
- [ ] Backups configured (optional)

---

## Optional: Custom Domain

- [ ] Domain purchased
- [ ] DNS configured
- [ ] Added to Vercel project
- [ ] SSL certificate issued
- [ ] Site accessible at custom domain
- [ ] Redirect www to non-www (or vice versa)

---

## Post-Deployment

- [ ] Created first real blog post
- [ ] Tested on mobile
- [ ] Tested on different browsers
- [ ] Shared with friends/colleagues
- [ ] Announced on social media

---

## Troubleshooting Completed

If you checked all boxes above, your blog is:
- ✅ Deployed
- ✅ Tested
- ✅ Secure
- ✅ Production-ready

---

## Quick Commands Reference

```bash
# Deploy backend (Fly.io)
cd backend && fly deploy

# Deploy frontend
cd frontend && vercel --prod

# Check backend health
curl https://your-backend.fly.dev/health

# View backend logs
fly logs

# View frontend logs
vercel logs

# Update backend secrets
fly secrets set JWT_SECRET=new-secret

# Update frontend env
# (Do in Vercel dashboard, then redeploy)
```

---

## Emergency Rollback

### Backend (Fly.io)
```bash
fly releases
fly releases rollback <version>
```

### Frontend (Vercel)
```bash
vercel rollback <deployment-url>
```

---

**Status:** Check boxes as you complete each step!

**Ready to launch?** When all boxes are checked, you're good to go! 🚀
