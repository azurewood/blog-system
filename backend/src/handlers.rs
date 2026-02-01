use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

use crate::models::*;
use crate::repository::PostRepository;
use crate::user_repository::UserRepository;
use crate::comment_repository::CommentRepository;
use crate::image_repository::ImageRepository;

pub struct AppState {
    pub post_repo: PostRepository,
    pub user_repo: UserRepository,
    pub comment_repo: CommentRepository,
    pub image_repo: ImageRepository,
}

#[derive(Debug, Deserialize)]
pub struct PaginationQuery {
    #[serde(default = "default_limit")]
    pub limit: i64,
    #[serde(default)]
    pub offset: i64,
}

fn default_limit() -> i64 {
    10
}

#[derive(Serialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

impl<T> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
        }
    }

    pub fn error(error: String) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(error),
        }
    }
}

// GET /api/posts - List published posts
pub async fn list_posts(
    State(state): State<Arc<AppState>>,
    Query(pagination): Query<PaginationQuery>,
) -> impl IntoResponse {
    match state.post_repo.list_published(pagination.limit, pagination.offset).await {
        Ok(posts) => (
            StatusCode::OK,
            Json(ApiResponse::success(posts)),
        ),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<Vec<Post>>::error(e)),
        ),
    }
}

// GET /api/posts/:slug - Get single post by slug
pub async fn get_post(
    State(state): State<Arc<AppState>>,
    Path(slug): Path<String>,
) -> impl IntoResponse {
    match state.post_repo.get_by_slug(&slug).await {
        Ok(Some(post)) => {
            // Increment view count asynchronously
            let post_id = post.id.clone();
            let repo = state.post_repo.clone();
            tokio::spawn(async move {
                let _ = repo.increment_views(&post_id).await;
            });

            (StatusCode::OK, Json(ApiResponse::success(post)))
        }
        Ok(None) => (
            StatusCode::NOT_FOUND,
            Json(ApiResponse::<Post>::error("Post not found".to_string())),
        ),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<Post>::error(e)),
        ),
    }
}

// POST /api/posts - Create new post
pub async fn create_post(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<CreatePostRequest>,
) -> impl IntoResponse {
    // TODO: Extract user ID from JWT token
    let author_id = "temp-user-id"; // This should come from authentication middleware

    match state.post_repo.create(payload, author_id).await {
        Ok(post) => (
            StatusCode::CREATED,
            Json(ApiResponse::success(post)),
        ),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<Post>::error(e)),
        ),
    }
}

// PUT /api/posts/:id - Update post
pub async fn update_post(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
    Json(payload): Json<UpdatePostRequest>,
) -> impl IntoResponse {
    match state.post_repo.update(&id, payload).await {
        Ok(post) => (
            StatusCode::OK,
            Json(ApiResponse::success(post)),
        ),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<Post>::error(e)),
        ),
    }
}

// DELETE /api/posts/:id - Delete post
pub async fn delete_post(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    match state.post_repo.delete(&id).await {
        Ok(_) => (
            StatusCode::NO_CONTENT,
            Json(ApiResponse::<()>::success(())),
        ),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<()>::error(e)),
        ),
    }
}

// GET /api/search?q=query - Search posts
pub async fn search_posts(
    State(state): State<Arc<AppState>>,
    Query(params): Query<SearchQuery>,
) -> impl IntoResponse {
    if params.q.is_empty() {
        return (
            StatusCode::BAD_REQUEST,
            Json(ApiResponse::<Vec<Post>>::error("Search query cannot be empty".to_string())),
        );
    }

    match state.post_repo.search(&params.q, 20).await {
        Ok(posts) => (
            StatusCode::OK,
            Json(ApiResponse::success(posts)),
        ),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<Vec<Post>>::error(e)),
        ),
    }
}

#[derive(Debug, Deserialize)]
pub struct SearchQuery {
    pub q: String,
}

// Health check endpoint
pub async fn health_check() -> impl IntoResponse {
    (StatusCode::OK, Json(ApiResponse::success("OK")))
}
