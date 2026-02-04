# 🔧 LibSQL TLS Error - FIXED

## The Error

```
thread 'main' panicked at libsql-0.9.29/src/database.rs:783:5:
The `tls` feature is disabled, you must provide your own http connector
```

## Root Cause

The `libsql` crate needs TLS features enabled to connect to Turso Cloud (which uses HTTPS).

---

## ✅ Solution Applied

**File:** `backend/Cargo.toml`

**Changed from:**
```toml
libsql = "0.6"
```

**Changed to:**
```toml
libsql = { version = "0.6", features = ["core", "replication", "sync"] }
```

---

## 🚀 How to Apply

### Option 1: Use Updated Archive

Download the latest `blog-system-FINAL-WITH-DEPLOY.tar.gz` which has this fix.

### Option 2: Manual Update

```bash
cd backend

# Edit Cargo.toml and change the libsql line to:
# libsql = { version = "0.6", features = ["core", "replication", "sync"] }

# Clean rebuild
cargo clean
cargo build

# Deploy
fly deploy
```

---

## ✅ Verification

After fixing, the build should succeed:

```bash
cd backend
cargo build --release
```

**Expected:**
```
Compiling libsql v0.6...
Compiling blog-backend v0.1.0
Finished release [optimized] target(s)
```

**No panic!** ✅

---

## 🔍 What Each Feature Does

| Feature | Purpose |
|---------|---------|
| `core` | Basic database operations |
| `replication` | Turso replication support |
| `sync` | Synchronization features |

These features enable the HTTPS/TLS connector needed for Turso Cloud.

---

## 🐛 Alternative: If Still Fails

If you still see TLS errors, try the full feature set:

```toml
libsql = { version = "0.6", features = ["core", "replication", "sync", "encryption"] }
```

Or use all features:

```toml
libsql = { version = "0.6", features = ["full"] }
```

---

## 📊 Common Related Issues

### Issue 1: "rustls" missing

**Error:**
```
error: rustls not found
```

**Fix:**
Add to `Cargo.toml`:
```toml
rustls = "0.21"
```

### Issue 2: "openssl" missing

**Error:**
```
Could not find openssl
```

**Fix (Dockerfile):**
```dockerfile
# Add to your Dockerfile before COPY
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*
```

### Issue 3: Timeout connecting

**Error:**
```
Connection timeout
```

**Fix:**
Check your Turso credentials:
```bash
# Verify database exists
turso db list

# Test connection
turso db shell blog-production
```

---

## 🚀 Complete Deploy Commands

After fixing Cargo.toml:

```bash
cd backend

# Clean build (important!)
cargo clean

# Test locally first
cargo build

# If successful, deploy to Fly.io
fly deploy

# Or rebuild Docker image
docker build -t blog-backend .
```

---

## 📝 Updated Cargo.toml

Here's the complete corrected dependencies section:

```toml
[dependencies]
tokio = { version = "1.42", features = ["full"] }
axum = "0.8"
tower = "0.5"
tower-http = { version = "0.6", features = ["cors", "trace", "fs"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
libsql = { version = "0.6", features = ["core", "replication", "sync"] }  # ← Fixed!
chrono = { version = "0.4", features = ["serde"] }
uuid = { version = "1.11", features = ["v4", "serde"] }
bcrypt = "0.16"
jsonwebtoken = { version = "9.3", features = ["rust_crypto"] }
tracing = "0.1"
tracing-subscriber = "0.3"
dotenvy = "0.15"
base64 = "0.22"
image = "0.25"
webp = "0.3"
```

---

## ✅ Testing After Fix

### Local Test

```bash
cd backend

# Set env vars
export TURSO_DATABASE_URL="libsql://your-db.turso.io"
export TURSO_AUTH_TOKEN="your-token"
export JWT_SECRET="test-secret"

# Run
cargo run

# Should see:
# Server running on http://0.0.0.0:3001
```

### Fly.io Test

```bash
# Deploy
fly deploy

# Check logs
fly logs

# Should NOT see TLS error
# Should see: Server running...

# Test endpoint
curl https://your-app.fly.dev/health
# Should return: {"status":"ok"}
```

---

## 🎯 Why This Happens

**LibSQL versions:**
- `libsql = "0.6"` → Uses **default features** (no TLS)
- `libsql = { version = "0.6", features = [...] }` → Enables TLS ✅

**Turso requires TLS** because it's a cloud service using HTTPS.

**Local SQLite doesn't need TLS** because it's a file.

---

## 💡 Pro Tip: Check Features

To see what features a crate supports:

```bash
# Check libsql features
cargo tree -f "{p} {f}"

# Or check on crates.io
open https://crates.io/crates/libsql
```

---

## 🎉 Summary

**The Fix:**
1. Add features to `libsql` in `Cargo.toml`
2. Rebuild with `cargo clean && cargo build`
3. Deploy with `fly deploy`

**Result:**
- ✅ TLS support enabled
- ✅ Can connect to Turso
- ✅ No more panic errors
- ✅ Production ready!

---

## 📚 Related Docs

- LibSQL features: https://docs.rs/libsql/latest/libsql/
- Turso Rust SDK: https://docs.turso.tech/sdk/rust/quickstart
- Fly.io Rust: https://fly.io/docs/languages-and-frameworks/rust/

---

**Fixed! Your backend will now connect to Turso correctly.** 🚀
