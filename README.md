# Modern Blog System

A high-performance, modern blog system built with **Rust** (backend) and **Next.js 14** (frontend), deployed on Vercel with Turso (LibSQL) database.

## 🚀 Features

- **Lightning Fast**: Rust-powered API with edge functions
- **Type-Safe**: Full TypeScript and Rust type safety
- **Modern Stack**: Next.js 14 App Router with Server Components
- **Scalable Database**: Turso (LibSQL) - globally distributed SQLite
- **Beautiful UI**: Responsive design with Tailwind CSS
- **SEO Optimized**: Static generation for blog posts
- **Real-time Analytics**: View tracking built-in

## 📁 Project Structure

```
blog-system/
├── backend/              # Rust API
│   ├── src/
│   │   ├── db.rs        # Database connection
│   │   ├── models.rs    # Data models
│   │   ├── repository.rs # Database operations
│   │   ├── handlers.rs  # API endpoints
│   │   ├── lib.rs       # Application setup
│   │   └── main.rs      # Entry point
│   ├── schema.sql       # Database schema
│   └── Cargo.toml       # Rust dependencies
│
├── frontend/            # Next.js application
│   ├── app/
│   │   ├── layout.tsx   # Root layout
│   │   ├── page.tsx     # Home page
│   │   ├── blog/[slug]/ # Blog post pages
│   │   └── about/       # About page
│   ├── lib/
│   │   └── api.ts       # API client
│   ├── types/
│   │   └── index.ts     # TypeScript types
│   └── package.json
│
└── vercel.json          # Vercel configuration
```

## 🛠️ Technology Stack

### Backend
- **Rust** - Latest stable version
- **Axum** - Modern web framework
- **LibSQL** - Database driver for Turso
- **Serde** - Serialization/deserialization
- **Tokio** - Async runtime

### Frontend
- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Markdown** - Markdown rendering
- **date-fns** - Date formatting

### Database
- **Turso** - Edge-hosted LibSQL (SQLite fork)
- Globally distributed
- Built-in replication
- HTTP and WebSocket support

## 📋 Prerequisites

- **Rust** 1.75+ ([Install](https://rustup.rs/))
- **Node.js** 18+ ([Install](https://nodejs.org/))
- **Turso CLI** ([Install](https://docs.turso.tech/cli/installation))
- **Vercel CLI** (optional, for deployment)

## 🚀 Getting Started

### 1. Set Up Turso Database

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Create a new database
turso db create blog-db

# Get your database URL
turso db show blog-db

# Create an auth token
turso db tokens create blog-db
```

### 2. Backend Setup

```bash
cd backend

# Copy environment variables
cp .env.example .env

# Edit .env and add your Turso credentials:
# TURSO_DATABASE_URL=libsql://your-database.turso.io
# TURSO_AUTH_TOKEN=your-token-here

# Build the project
cargo build

# Run the backend
cargo run
```

The backend will start on `http://localhost:3001`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Edit .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:3001

# Run the development server
npm run dev
```

The frontend will start on `http://localhost:3000`

## 🌐 API Endpoints

### Posts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | List all published posts |
| GET | `/api/posts/by-slug/{slug}` | Get a single post by slug |
| POST | `/api/posts` | Create a new post |
| PUT | `/api/posts/{id}` | Update a post |
| DELETE | `/api/posts/{id}` | Delete a post |

### Query Parameters

**GET /api/posts**
- `limit` (optional, default: 10) - Number of posts to return
- `offset` (optional, default: 0) - Offset for pagination

### Example Requests

**Create a post:**
```bash
curl -X POST http://localhost:3001/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Post",
    "slug": "my-first-post",
    "content": "# Hello World\n\nThis is my first blog post!",
    "excerpt": "A brief introduction to my blog",
    "status": "published",
    "tags": ["welcome", "introduction"]
  }'
```

**Get all posts:**
```bash
curl http://localhost:3001/api/posts
```

**Get a specific post:**
```bash
curl http://localhost:3001/api/posts/by-slug/my-first-post
```

## 🚢 Deployment to Vercel

### 1. Prepare Your Repository

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

### 2. Configure Turso for Production

```bash
# Create a production database
turso db create blog-prod

# Get credentials
turso db show blog-prod
turso db tokens create blog-prod
```

### 3. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard:
# - TURSO_DATABASE_URL
# - TURSO_AUTH_TOKEN
# - NEXT_PUBLIC_API_URL (your Vercel backend URL)
```

Or deploy via Vercel dashboard:
1. Import your repository
2. Add environment variables
3. Deploy!

## 📝 Database Schema

The system uses the following tables:

- **posts** - Blog posts with content, metadata, and status
- **users** - Author information and authentication
- **tags** - Post categorization
- **post_tags** - Many-to-many relationship between posts and tags
- **comments** - User comments on posts (optional)

See `backend/schema.sql` for the complete schema.

## 🎨 Customization

### Styling

Edit `frontend/tailwind.config.js` to customize:
- Colors
- Fonts
- Spacing
- Typography

### Fonts

The default setup uses:
- **Playfair Display** - Headings
- **Merriweather** - Body text
- **Inter** - UI elements

Change in `frontend/app/globals.css`

### Layout

Modify `frontend/app/layout.tsx` for:
- Header/navigation
- Footer
- Global metadata

## 🔒 Security Notes

**Important**: This is a basic implementation. For production use, add:

1. **Authentication** - JWT or session-based auth
2. **Authorization** - Role-based access control
3. **Input Validation** - Validate all inputs
4. **Rate Limiting** - Prevent abuse
5. **CSRF Protection** - For write operations
6. **XSS Prevention** - Sanitize user content

## 🧪 Testing

### Backend Tests

```bash
cd backend
cargo test
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 📚 Additional Resources

- [Rust Book](https://doc.rust-lang.org/book/)
- [Axum Documentation](https://docs.rs/axum/latest/axum/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Turso Documentation](https://docs.turso.tech/)
- [Vercel Documentation](https://vercel.com/docs)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for your own blog!

## 🐛 Troubleshooting

### Backend won't start
- Check Turso credentials in `.env`
- Ensure port 3001 is available
- Run `cargo clean` and rebuild

### Frontend can't connect to backend
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check backend is running
- Check CORS settings in `backend/src/lib.rs`

### Database errors
- Verify Turso database exists
- Check auth token is valid
- Ensure schema is initialized

## 💡 Next Steps

- [x] Add authentication system
- [ ] Implement comment moderation
- [x] Add image upload functionality
- [x] Create admin dashboard
- [x] Add search functionality
- [x] Implement RSS feed
- [x] Add social sharing buttons
- [ ] Set up email notifications

---

Built with ❤️ using Rust and Next.js
