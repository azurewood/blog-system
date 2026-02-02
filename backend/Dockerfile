FROM lukemathwalker/cargo-chef:latest-rust-1 AS chef
WORKDIR /app

FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS builder
COPY --from=planner /app/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json
COPY . .
RUN cargo build --release --bin blog-backend

# --- RUNTIME STAGE ---
FROM debian:bookworm-slim AS runtime
WORKDIR /app

# Install certificates HERE so they exist in the final image
RUN apt-get update && apt-get install -y \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && update-ca-certificates

COPY --from=builder /app/target/release/blog-backend /usr/local/bin
ENTRYPOINT ["/usr/local/bin/blog-backend"]
