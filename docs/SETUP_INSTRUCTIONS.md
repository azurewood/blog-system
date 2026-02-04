# Environment Setup Instructions

## The Error You're Seeing

```
TURSO_DATABASE_URL must be set: NotPresent
```

This means the backend can't find your Turso database credentials.

## Quick Fix (5 minutes)

### Step 1: Create a Turso Database

```bash
# Install Turso CLI (if not already installed)
curl -sSfL https://get.tur.so/install.sh | bash

# Authenticate with Turso
turso auth login

# Create a new database
turso db create my-blog

# Get your database URL
turso db show my-blog --url

# Create an authentication token
turso db tokens create my-blog
```

**Save these two values:**
- Database URL (looks like: `libsql://my-blog-xxx.turso.io`)
- Auth Token (looks like: `eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...`)

### Step 2: Create .env File

In the `backend/` directory, create a file named `.env`:

```bash
cd backend
```

Create the `.env` file with your credentials:

```bash
cat > .env << 'ENVFILE'
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-token-here
PORT=3000
ENVFILE
```

**Replace with your actual values:**
- Replace `libsql://your-database.turso.io` with your database URL
- Replace `your-token-here` with your auth token

### Step 3: Run the Backend

```bash
cargo run
```

You should see:
```
Server running on http://0.0.0.0:3000
```

## Alternative: Using Environment Variables Directly

Instead of a `.env` file, you can set environment variables directly:

```bash
export TURSO_DATABASE_URL="libsql://your-database.turso.io"
export TURSO_AUTH_TOKEN="your-token-here"
cargo run
```

## Verifying Your Setup

Test the API:

```bash
# Health check
curl http://localhost:3000/health

# List posts (should return empty array initially)
curl http://localhost:3000/api/posts
```

## Common Issues

### "turso: command not found"
Install Turso CLI:
```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

### "Not authenticated"
Run:
```bash
turso auth login
```

### ".env file exists but still getting error"
Make sure:
1. The `.env` file is in the `backend/` directory (same level as `Cargo.toml`)
2. There are no spaces around the `=` sign
3. No quotes around the values (unless they contain spaces)

### "Connection refused" or "Failed to connect"
Check your:
1. Database URL is correct
2. Auth token is valid
3. Internet connection is working

## Complete .env Example

```bash
# Turso Database Configuration
TURSO_DATABASE_URL=libsql://my-blog-abc123.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3MDY...

# Application Configuration
PORT=3000

# JWT Configuration (optional for now)
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
```

## Next Steps

Once the backend is running:

1. **Start the Frontend**
   ```bash
   cd ../frontend
   npm install
   cp .env.local.example .env.local
   # Edit .env.local to set NEXT_PUBLIC_API_URL=http://localhost:3000
   npm run dev
   ```

2. **Create Your First Post**
   ```bash
   curl -X POST http://localhost:3000/api/posts \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Hello World",
       "slug": "hello-world",
       "content": "# Welcome\n\nMy first post!",
       "excerpt": "A warm welcome",
       "status": "published"
     }'
   ```

3. **Visit Your Blog**
   Open http://localhost:3001 in your browser

## Need Help?

- Check `README.md` for detailed documentation
- See `QUICKSTART.md` for the full setup guide
- Verify your Turso database exists: `turso db list`
