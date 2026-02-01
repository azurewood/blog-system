# Quick Start Guide

Get your blog running in 5 minutes!

## Prerequisites Checklist

- [ ] Rust installed (`rustc --version`)
- [ ] Node.js installed (`node --version`)
- [ ] Turso CLI installed (`turso --version`)

## Step 1: Database Setup (2 minutes)

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Create database
turso db create my-blog

# Get your credentials
turso db show my-blog
turso db tokens create my-blog
```

**Save these values:**
- Database URL: `libsql://xxxxx.turso.io`
- Auth Token: `eyJhbGc...`

## Step 2: Backend Setup (1 minute)

```bash
cd backend

# Create .env file
cat > .env << EOL
TURSO_DATABASE_URL=YOUR_DATABASE_URL_HERE
TURSO_AUTH_TOKEN=YOUR_AUTH_TOKEN_HERE
PORT=3000
EOL

# Run the backend
cargo run
```

**Expected output:**
```
Server running on http://0.0.0.0:3000
```

## Step 3: Frontend Setup (2 minutes)

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cat > .env.local << EOL
NEXT_PUBLIC_API_URL=http://localhost:3000
EOL

# Run the frontend
npm run dev
```

**Expected output:**
```
ready - started server on 0.0.0.0:3001
```

## Step 4: Test It Out!

1. **Open your browser:** http://localhost:3001
2. **Create your first post:**

```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Hello World!",
    "slug": "hello-world",
    "content": "# Welcome\n\nThis is my first blog post!",
    "excerpt": "My first post on this amazing blog",
    "status": "published"
  }'
```

3. **Refresh your browser** - Your post should appear!

## Common Issues

### "Cannot connect to database"
- Check your `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`
- Make sure the database exists: `turso db list`

### "Port already in use"
- Backend: Change `PORT` in `backend/.env`
- Frontend: Use `npm run dev -- -p 3002`

### "Module not found" errors
- Run `npm install` in the frontend directory
- Run `cargo clean && cargo build` in the backend

## Next Steps

1. **Customize your blog:**
   - Edit `frontend/app/layout.tsx` for header/footer
   - Modify `frontend/tailwind.config.js` for colors/fonts
   - Update content in `frontend/app/about/page.tsx`

2. **Add more posts:**
   - Use the API or create a simple admin interface
   - Posts support Markdown formatting

3. **Deploy to production:**
   - See `DEPLOYMENT.md` for Vercel deployment guide
   - Or use the main `README.md` for detailed instructions

## Helpful Commands

```bash
# Backend
cargo run          # Run backend
cargo test         # Run tests
cargo build --release  # Production build

# Frontend
npm run dev        # Development server
npm run build      # Production build
npm run start      # Run production build
npm run lint       # Check for errors

# Database
turso db shell my-blog  # Open SQL shell
turso db show my-blog   # Show database info
```

## Support

- Check the main `README.md` for detailed documentation
- Review `backend/schema.sql` for database structure
- See API examples in `README.md`

Happy blogging! 🚀
