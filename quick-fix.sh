#!/bin/bash

# Quick Fix Script for Blog System
# Run this if you encounter dependency errors

echo "🔧 Blog System - Quick Fix Script"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo "❌ Error: Please run this script from the blog-system root directory"
    exit 1
fi

echo "📦 Installing Frontend Dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "🦀 Building Backend..."
cd backend
cargo build
cd ..

echo ""
echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Configure backend/.env with your Turso credentials"
echo "2. Configure frontend/.env.local with API_URL"
echo "3. Run: cd backend && cargo run --bin setup (create admin user)"
echo "4. Run: cd backend && cargo run (start backend)"
echo "5. Run: cd frontend && npm run dev (start frontend)"
echo ""
echo "📚 Check SETUP_INSTRUCTIONS.md for detailed setup guide"
