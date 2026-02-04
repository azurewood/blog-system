# ⚡ QUICK FIX - Missing @tailwindcss/typography

If you're getting this error:
```
Error: Cannot find module '@tailwindcss/typography'
```

## Solution 1: Install the dependency

```bash
cd frontend
npm install @tailwindcss/typography
npm install
```

## Solution 2: Download the latest archive

The latest archive already has this dependency in package.json.
Download: `blog-system-FIXED.tar.gz`

## Solution 3: Manual fix

Edit `frontend/package.json` and add this line to dependencies:

```json
{
  "dependencies": {
    ...
    "@tailwindcss/typography": "^0.5.15",
    ...
  }
}
```

Then run:
```bash
cd frontend
npm install
```

## Verify it worked

```bash
cd frontend
npm run dev
```

You should see:
```
- ready started server on 0.0.0.0:3001
```

## Complete Setup

After fixing the dependency:

1. **Backend (.env file):**
```bash
cd backend
cp .env.example .env
# Edit .env with your Turso credentials
```

2. **Create admin user:**
```bash
cd backend
cargo run --bin setup
```

3. **Start backend:**
```bash
cd backend
cargo run
```

4. **Start frontend:**
```bash
cd frontend
npm run dev
```

5. **Access the app:**
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- Login: http://localhost:3001/login
  - Email: admin@example.com
  - Password: password123

## That's it! 🎉

Your blog system should now be running successfully.
