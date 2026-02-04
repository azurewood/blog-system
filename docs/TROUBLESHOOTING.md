# Troubleshooting Guide

## Common Setup Issues & Solutions

---

## ❌ Error: Cannot find module '@tailwindcss/typography'

**Problem:** Missing Tailwind CSS typography plugin

**Solution:**
```bash
cd frontend
npm install @tailwindcss/typography
```

Or run the quick fix script:
```bash
chmod +x quick-fix.sh
./quick-fix.sh
```

---

## ❌ Error: `cargo: not found` or Rust not installed

**Problem:** Rust toolchain not installed

**Solution:**
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Restart terminal, then verify
cargo --version
```

---

## ❌ Error: `TURSO_DATABASE_URL must be set`

**Problem:** Missing environment variables

**Solution:**
```bash
# 1. Create Turso database
turso db create blog-db

# 2. Get credentials
turso db show blog-db --url
turso db tokens create blog-db

# 3. Create backend/.env
cp backend/.env.example backend/.env

# 4. Edit backend/.env with your credentials
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token-here
```

---

## ❌ Error: Compilation errors in Rust

**Problem:** Missing dependencies or version mismatch

**Solution:**
```bash
cd backend

# Clean build
cargo clean

# Update dependencies
cargo update

# Rebuild
cargo build
```

---

## ❌ Error: Module not found in Next.js

**Problem:** Node modules not installed

**Solution:**
```bash
cd frontend

# Remove existing modules
rm -rf node_modules package-lock.json

# Clean install
npm install

# Try again
npm run dev
```

---

## ❌ Error: `turso: command not found`

**Problem:** Turso CLI not installed

**Solution:**
```bash
# macOS/Linux
curl -sSfL https://get.tur.so/install.sh | bash

# Restart terminal, then verify
turso --version
```

---

## ❌ Error: Port already in use (Backend)

**Problem:** Port 3000 already occupied

**Solution 1 - Change port:**
```bash
# In backend/.env
PORT=3001
```

**Solution 2 - Kill existing process:**
```bash
# Find process on port 3000
lsof -ti:3000

# Kill it
kill -9 $(lsof -ti:3000)
```

---

## ❌ Error: Port already in use (Frontend)

**Problem:** Port 3001 already occupied

**Solution:**
```bash
# Next.js will automatically try port 3002, 3003, etc.
# Or specify a port:
PORT=3002 npm run dev
```

---

## ❌ Error: CORS policy blocked

**Problem:** Frontend can't access backend

**Solution:**
```bash
# 1. Check frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3000

# 2. Verify backend CORS is configured (already done)
# 3. Make sure both are running
```

---

## ❌ Error: Images won't upload

**Problem:** Various image upload issues

**Solution 1 - Check file size:**
```
Max size is 5MB per image
Compress large images before upload
```

**Solution 2 - Check file type:**
```
Allowed: JPG, PNG, GIF, WebP
Not allowed: SVG, BMP, TIFF
```

**Solution 3 - Check database:**
```bash
# Verify database connection
turso db list
turso db show blog-db
```

---

## ❌ Error: Database schema errors

**Problem:** Schema not initialized

**Solution:**
```bash
cd backend

# Run setup script
cargo run --bin setup

# This will:
# - Initialize schema
# - Create admin user
# - Set up tables
```

---

## ❌ Error: Authentication not working

**Problem:** No admin user or wrong credentials

**Solution:**
```bash
# Create admin user
cd backend
cargo run --bin setup

# Default credentials:
# Email: admin@example.com
# Password: password123

# Change password after first login!
```

---

## ❌ Error: TypeScript errors in frontend

**Problem:** Type mismatches

**Solution:**
```bash
cd frontend

# Check TypeScript
npm run build

# If issues persist, check:
# - All imports are correct
# - Component props match interfaces
# - API response types match
```

---

## ❌ Error: `Failed to connect to database`

**Problem:** Invalid Turso credentials or network

**Solution 1 - Verify credentials:**
```bash
# Test database connection
turso db shell blog-db

# If this works, credentials are correct
# Update backend/.env with correct values
```

**Solution 2 - Check network:**
```bash
# Verify internet connection
# Turso requires internet access
ping turso.io
```

---

## ❌ Error: Build fails on Vercel

**Problem:** Missing environment variables or build errors

**Solution:**
```bash
# 1. Add environment variables in Vercel dashboard:
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...

# 2. Verify vercel.json is present
# 3. Check build logs for specific errors
```

---

## 🔍 Debugging Tips

### Check Backend Logs
```bash
cd backend
RUST_LOG=debug cargo run
```

### Check Frontend Logs
```bash
cd frontend
npm run dev
# Check browser console for errors
```

### Check Database
```bash
# Open Turso shell
turso db shell blog-db

# Check tables
.tables

# Check data
SELECT * FROM images LIMIT 5;
SELECT * FROM posts LIMIT 5;
```

### Test API Endpoints
```bash
# Health check
curl http://localhost:3000/health

# Get posts
curl http://localhost:3000/api/posts

# Get analytics
curl http://localhost:3000/api/images/analytics
```

---

## 🆘 Still Having Issues?

### 1. Run Quick Fix Script
```bash
chmod +x quick-fix.sh
./quick-fix.sh
```

### 2. Check Documentation
- `README.md` - Overview
- `SETUP_INSTRUCTIONS.md` - Detailed setup
- `QUICKSTART.md` - 5-minute guide

### 3. Verify Installation
```bash
# Check versions
node --version    # Should be 18+
npm --version     # Should be 9+
cargo --version   # Should be 1.70+
turso --version   # Should be latest
```

### 4. Clean Install
```bash
# Backend
cd backend
cargo clean
cargo build

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 Common Setup Mistakes

### ❌ Running in wrong directory
```bash
# Wrong:
npm run dev  # From root

# Correct:
cd frontend
npm run dev
```

### ❌ Missing .env files
```bash
# Need both:
backend/.env       # Backend config
frontend/.env.local  # Frontend config
```

### ❌ Not running both servers
```bash
# Need BOTH running:
# Terminal 1:
cd backend && cargo run

# Terminal 2:
cd frontend && npm run dev
```

### ❌ Using wrong ports
```bash
# Backend: http://localhost:3000
# Frontend: http://localhost:3001
# Make sure NEXT_PUBLIC_API_URL points to 3000
```

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can login at /login
- [ ] Can access /admin
- [ ] Can create a post
- [ ] Can upload an image
- [ ] Can view analytics
- [ ] Can search images

---

## 🎯 Quick Start Commands

```bash
# Initial Setup
./quick-fix.sh

# Start Backend
cd backend
cargo run

# Start Frontend (new terminal)
cd frontend
npm run dev

# Create Admin User
cd backend
cargo run --bin setup
```

---

**Need more help?** Check the detailed guides:
- `SETUP_INSTRUCTIONS.md`
- `BUG_FIXES_AND_ROADMAP.md`
- Individual feature guides (IMAGE_OPTIMIZATION_GUIDE.md, etc.)
