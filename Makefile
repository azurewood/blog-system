.PHONY: help backend frontend install setup clean test deploy

# Default target
help:
	@echo "Blog System - Available Commands:"
	@echo ""
	@echo "  make setup      - Initial setup (install dependencies)"
	@echo "  make backend    - Run backend server"
	@echo "  make frontend   - Run frontend server"
	@echo "  make dev        - Run both backend and frontend"
	@echo "  make test       - Run all tests"
	@echo "  make build      - Build for production"
	@echo "  make clean      - Clean build artifacts"
	@echo "  make deploy     - Deploy to Vercel"
	@echo ""

# Install dependencies
install:
	@echo "Installing backend dependencies..."
	cd backend && cargo build
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "✓ Dependencies installed!"

# Initial setup
setup: install
	@echo "Setting up environment files..."
	@if [ ! -f backend/.env ]; then \
		cp backend/.env.example backend/.env; \
		echo "✓ Created backend/.env - Please configure!"; \
	fi
	@if [ ! -f frontend/.env.local ]; then \
		cp frontend/.env.local.example frontend/.env.local; \
		echo "✓ Created frontend/.env.local - Please configure!"; \
	fi
	@echo ""
	@echo "Setup complete! Next steps:"
	@echo "1. Configure backend/.env with Turso credentials"
	@echo "2. Run 'make dev' to start development servers"

# Run backend
backend:
	cd backend && cargo run

# Run frontend
frontend:
	cd frontend && npm run dev

# Run both (requires tmux or similar)
dev:
	@echo "Starting backend and frontend..."
	@echo "Backend: http://localhost:3000"
	@echo "Frontend: http://localhost:3001"
	@echo ""
	@make -j2 backend frontend

# Run tests
test:
	@echo "Running backend tests..."
	cd backend && cargo test
	@echo "Running frontend tests..."
	cd frontend && npm test

# Build for production
build:
	@echo "Building backend..."
	cd backend && cargo build --release
	@echo "Building frontend..."
	cd frontend && npm run build
	@echo "✓ Production build complete!"

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	cd backend && cargo clean
	cd frontend && rm -rf .next node_modules
	@echo "✓ Clean complete!"

# Deploy to Vercel
deploy:
	@echo "Deploying to Vercel..."
	vercel --prod
	@echo "✓ Deployment complete!"

# Create a sample post
sample-post:
	@echo "Creating sample post..."
	curl -X POST http://localhost:3000/api/posts \
		-H "Content-Type: application/json" \
		-d '{ \
			"title": "Welcome to My Blog", \
			"slug": "welcome", \
			"content": "# Hello World\n\nThis is a sample blog post created to test the system.\n\n## Features\n\n- Markdown support\n- Fast loading\n- Beautiful design\n\nEnjoy your new blog!", \
			"excerpt": "A warm welcome to our new blog platform", \
			"status": "published", \
			"tags": ["welcome", "first-post"] \
		}'
	@echo "✓ Sample post created!"
