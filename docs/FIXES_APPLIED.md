# Common Errors and Fixes

## ✅ All Fixed! Your Routes Are:

The routing conflict has been resolved. Here are your working API endpoints:

```
GET    /health                      - Health check
GET    /api/posts                   - List all posts
POST   /api/posts                   - Create a post
GET    /api/posts/by-slug/{slug}    - Get post by slug
PUT    /api/posts/{id}              - Update post by ID
DELETE /api/posts/{id}              - Delete post by ID
```

## Test Your Setup

1. **Start the backend:**
   ```bash
   cd backend
   cargo run
   ```

2. **Health check:**
   ```bash
   curl http://localhost:3000/health
   ```
   Should return: `{"success":true,"data":"OK","error":null}`

3. **List posts (empty at first):**
   ```bash
   curl http://localhost:3000/api/posts
   ```
   Should return: `{"success":true,"data":[],"error":null}`

4. **Create your first post:**
   ```bash
   curl -X POST http://localhost:3000/api/posts \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Hello World",
       "slug": "hello-world",
       "content": "# Welcome\n\nThis is my first blog post!",
       "excerpt": "A warm welcome to my new blog",
       "status": "published"
     }'
   ```

5. **Get the post by slug:**
   ```bash
   curl http://localhost:3000/api/posts/by-slug/hello-world
   ```

## Starting the Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local and set:
# NEXT_PUBLIC_API_URL=http://localhost:3000
npm run dev
```

Visit: http://localhost:3001

## Common Issues Resolved

### ✅ "TURSO_DATABASE_URL must be set"
**Fixed:** Added `dotenvy::dotenv().ok();` to load .env file

### ✅ "Path segments must not start with `:`"
**Fixed:** Changed `:param` to `{param}` syntax

### ✅ "Insertion failed due to conflict"
**Fixed:** Changed routes to:
- `/api/posts/by-slug/{slug}` for getting by slug
- `/api/posts/{id}` for update/delete by ID

## Everything Should Work Now!

Run `cargo run` and you should see:
```
Server running on http://0.0.0.0:3000
```

No more errors! 🎉
