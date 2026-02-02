use axum::{
    routing::{get, post, put, delete},
    Router,
};
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};

pub mod db;
pub mod models;
pub mod repository;
pub mod handlers;
pub mod rss;
pub mod auth;
pub mod auth_handlers;
pub mod user_repository;
pub mod upload;
pub mod comment_repository;
pub mod comment_handlers;
pub mod image_repository;
pub mod image_processor;
pub mod image_analytics;

use db::DbPool;
use handlers::AppState;
use repository::PostRepository;
use user_repository::UserRepository;
use comment_repository::CommentRepository;
use image_repository::ImageRepository;

pub async fn create_app(database_url: &str, auth_token: Option<String>) -> Result<Router, String> {
    // Initialize database
    let pool = DbPool::new(database_url, auth_token)
        .await
        .map_err(|e| format!("Failed to connect to database: {}", e))?;

    // Initialize schema
    pool.init_schema()
        .await
        .map_err(|e| format!("Failed to initialize schema: {}", e))?;

    // Create repositories
    let post_repo = PostRepository::new(pool.clone());
    let user_repo = UserRepository::new(pool.clone());
    let comment_repo = CommentRepository::new(pool.clone());
    let image_repo = ImageRepository::new(pool);

    // Create shared state
    let state = Arc::new(AppState { 
        post_repo,
        user_repo,
        comment_repo,
        image_repo,
    });

    // Configure CORS
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Build router
    let app = Router::new()
        // Health & RSS
        .route("/health", get(handlers::health_check))
        .route("/feed.xml", get(rss::rss_feed))
        
        // Authentication
        .route("/api/auth/login", post(auth_handlers::login))
        .route("/api/auth/verify", get(auth_handlers::verify_token))
        
        // Posts
        .route("/api/posts", get(handlers::list_posts).post(handlers::create_post))
        .route("/api/posts/by-slug/{slug}", get(handlers::get_post))
        .route("/api/posts/{id}", get(handlers::get_post_by_id).put(handlers::update_post).delete(handlers::delete_post))
        .route("/api/search", get(handlers::search_posts))
        .route("/api/posts_all", get(handlers::list_posts_all))

        // Comments
        .route("/api/posts/{post_id}/comments", 
            get(comment_handlers::get_comments).post(comment_handlers::create_comment))
        .route("/api/comments/{id}/approve", put(comment_handlers::approve_comment))
        .route("/api/comments/{id}", delete(comment_handlers::delete_comment))
        .route("/api/admin/comments/pending", get(comment_handlers::get_pending_comments))
        
        // Images - stored in Turso DB and served via edge function
        .route("/api/upload/image", post(upload::upload_image))
        .route("/api/images/analytics", get(image_analytics::get_analytics))
        .route("/api/images/{id}", get(upload::get_image).delete(upload::delete_image))
        
        .layer(cors)
        .with_state(state);

    Ok(app)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_app_creation() {
        // This would require a test database
        // let app = create_app("libsql://test.db", None).await;
        // assert!(app.is_ok());
    }
}
