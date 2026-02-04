# New Features Guide

## 🎉 Three New Features Added!

1. **RSS Feed** - Subscribe functionality
2. **Social Sharing** - Share buttons on every post
3. **Admin Dashboard** - Easy content management

---

## 1️⃣ RSS Feed

### What It Does
- Auto-generates an RSS feed at `/feed.xml`
- Includes latest 20 published posts
- Standard RSS 2.0 format
- Works with all RSS readers

### How to Use

**For Readers:**
- Visit: `http://localhost:3000/feed.xml`
- Add to your RSS reader (Feedly, Inoreader, etc.)
- RSS link is in the header navigation

**For You:**
- Nothing to do! It's automatic
- Updates whenever you publish a post
- Includes title, excerpt, link, and publish date

### Testing

```bash
# View the feed
curl http://localhost:3000/feed.xml

# Or open in browser
open http://localhost:3000/feed.xml
```

### For Production

Update your `.env` to set the correct URL:
```bash
FRONTEND_URL=https://yourblog.com
```

---

## 2️⃣ Social Sharing Buttons

### What It Does
- Share buttons on every blog post
- Platforms: Twitter/X, Facebook, LinkedIn, Reddit, Email
- Copy link button with visual feedback
- Open Graph meta tags for rich previews
- Twitter Card support

### Features

**Share Buttons:**
- 🐦 Twitter/X - Share with tweet
- 👤 Facebook - Share to timeline
- 💼 LinkedIn - Share to feed
- 🤖 Reddit - Submit to subreddit
- 📧 Email - Send via email
- 🔗 Copy Link - One-click copy

**Meta Tags:**
- Post title, description, image
- Proper Open Graph tags
- Twitter Card with large image
- SEO optimized

### Where to Find
- Bottom of every blog post
- Just above "Back to all posts" link

### Customization

Edit `frontend/components/ShareButtons.tsx` to:
- Change button colors
- Add/remove platforms
- Customize styling
- Add analytics tracking

---

## 3️⃣ Admin Dashboard

### What It Does
- Visual interface for managing posts
- No more curl commands!
- Create, edit, view posts
- See analytics at a glance
- Draft/publish workflow

### How to Access

**URL:** `http://localhost:3001/admin`

**Note:** Currently no authentication - anyone can access!
(Authentication coming in next update)

### Dashboard Features

**Stats Overview:**
- 📝 Total Posts
- ✅ Published Posts
- 📄 Draft Posts
- 👁️ Total Views

**Recent Posts Table:**
- Post title and slug
- Status badge (draft/published)
- View count
- Creation date
- Quick actions (Edit/View)

### Creating a New Post

1. **Go to Admin Panel**
   ```
   http://localhost:3001/admin
   ```

2. **Click "Create New Post"** or go to `/admin/posts/new`

3. **Fill in the Form:**
   - **Title** - Auto-generates slug
   - **Slug** - URL-friendly identifier
   - **Excerpt** - Short description (optional)
   - **Featured Image** - URL to image (optional)
   - **Content** - Full post in Markdown

4. **Toggle Preview** to see how it looks

5. **Save Draft** or **Publish** immediately

### Form Features

**Auto-slug Generation:**
- Type a title
- Slug is automatically created
- Example: "Hello World" → "hello-world"
- Can be edited manually

**Markdown Editor:**
- Full Markdown support
- Syntax highlighting
- Live preview mode
- 20 rows of space

**Image Preview:**
- Paste image URL
- See preview immediately
- Validates image loads

**Draft Workflow:**
- Save as draft first
- Review and edit
- Publish when ready

### Markdown Guide

```markdown
# Heading 1
## Heading 2
### Heading 3

**Bold text**
*Italic text*

- Bullet point
- Another point

1. Numbered list
2. Second item

[Link text](https://example.com)

![Image alt](https://example.com/image.jpg)

> Blockquote

`inline code`

```code
Code block
```
```

### Managing Posts

**View All Posts:**
- Go to `/admin/posts`
- See all posts in a table
- Filter by status (coming soon)
- Search posts (coming soon)

**Edit Post:**
- Click "Edit" in the table
- Same form as create
- Changes saved immediately

**View Published Post:**
- Click "View" to see live post
- Opens in new tab

**Delete Post:**
- Currently via API only
- UI delete button coming soon

---

## 🚀 Quick Start Guide

### 1. Start the Backend

```bash
cd backend
# Make sure .env has FRONTEND_URL=http://localhost:3001
cargo run
```

### 2. Start the Frontend

```bash
cd frontend
npm run dev
```

### 3. Create Your First Post

**Option A: Using Admin Dashboard (Recommended)**
1. Visit `http://localhost:3001/admin`
2. Click "Create New Post"
3. Fill in the form
4. Click "Publish"

**Option B: Using curl (Old Way)**
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Post",
    "slug": "my-first-post",
    "content": "# Hello World\n\nThis is my first post!",
    "status": "published"
  }'
```

### 4. View Your Post

1. Go to `http://localhost:3001`
2. See your post in the grid
3. Click to read
4. See share buttons at the bottom

### 5. Subscribe to RSS

1. Visit `http://localhost:3000/feed.xml`
2. Copy URL
3. Add to RSS reader
4. Get notified of new posts

---

## 🎨 Customization

### Change Blog Title/Description

Edit `frontend/app/layout.tsx`:
```typescript
export const metadata: Metadata = {
  title: 'My Awesome Blog',
  description: 'Your custom description here',
}
```

### RSS Feed Title

Edit `backend/src/rss.rs`:
```rust
<title>My Awesome Blog</title>
<description>Your description</description>
```

### Share Button Colors

Edit `frontend/components/ShareButtons.tsx`:
```typescript
// Twitter button
className="bg-black hover:bg-gray-800"

// Change to:
className="bg-blue-500 hover:bg-blue-600"
```

### Admin Dashboard Colors

Edit `frontend/app/admin/layout.tsx`:
```typescript
// Sidebar
className="bg-gray-900"

// Change to:
className="bg-blue-900"
```

---

## 📝 Tips & Best Practices

### Writing Posts

1. **Use Markdown** - It's simple and powerful
2. **Add Featured Images** - Posts with images get more clicks
3. **Write Good Excerpts** - Shows up in RSS and social shares
4. **Use Clear Slugs** - Good for SEO

### SEO Optimization

1. **Titles** - Keep under 60 characters
2. **Excerpts** - 150-160 characters ideal
3. **Images** - Use descriptive alt text
4. **Slugs** - Use keywords, keep short

### Social Sharing

1. **Featured Image** - Use 1200x630px for best results
2. **Excerpt** - This becomes the social description
3. **Title** - Keep punchy and interesting

---

## 🔒 Security Notes

**IMPORTANT:** The admin dashboard currently has NO authentication!

**Before deploying to production:**
1. Add authentication (JWT or session-based)
2. Protect `/admin` routes
3. Add role-based access control
4. Implement rate limiting

I can build authentication next if you want!

---

## 🐛 Troubleshooting

### RSS Feed Shows "localhost"

**Fix:** Update `FRONTEND_URL` in `backend/.env`
```bash
FRONTEND_URL=https://yourdomain.com
```

### Share Buttons Not Working

**Check:** Make sure JavaScript is enabled
**Fix:** Share buttons require client-side JavaScript

### Can't Create Posts in Admin

**Check:** 
1. Backend is running (`cargo run`)
2. Frontend can reach backend
3. Check browser console for errors

### Images Not Showing

**Check:**
1. Image URL is valid and accessible
2. CORS allows the image domain
3. Try opening URL directly in browser

---

## 🎯 What's Next?

Want me to add:
- 🔐 **Authentication** - Secure the admin panel
- 🔍 **Search** - Find posts quickly
- 📤 **Image Upload** - No more URL pasting
- ✍️ **Rich Editor** - WYSIWYG instead of Markdown
- 📧 **Newsletter** - Email subscribers
- 💬 **Comments** - Reader engagement

Just let me know which feature you want next!

---

## 📚 API Reference

### New Endpoints

**RSS Feed:**
```
GET /feed.xml
Returns: XML RSS feed
```

### Existing Endpoints

```
GET  /api/posts                    - List posts
GET  /api/posts/by-slug/{slug}     - Get post
POST /api/posts                    - Create post
PUT  /api/posts/{id}               - Update post
DELETE /api/posts/{id}             - Delete post
```

---

**Enjoy your new features! 🎉**

Need help? Check the main README or ask for assistance!
