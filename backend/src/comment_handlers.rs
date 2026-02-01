use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde::Deserialize;
use std::sync::Arc;

use crate::handlers::{ApiResponse, AppState};
use crate::models::Comment;

#[derive(Debug, Deserialize)]
pub struct CreateCommentRequest {
    pub author_name: String,
    pub author_email: String,
    pub content: String,
}

// POST /api/posts/:post_id/comments - Create comment
pub async fn create_comment(
    State(state): State<Arc<AppState>>,
    Path(post_id): Path<String>,
    Json(payload): Json<CreateCommentRequest>,
) -> impl IntoResponse {
    // Basic validation
    if payload.author_name.trim().is_empty() 
        || payload.author_email.trim().is_empty() 
        || payload.content.trim().is_empty() {
        return (
            StatusCode::BAD_REQUEST,
            Json(ApiResponse::<Comment>::error(
                "All fields are required".to_string(),
            )),
        );
    }

    // Simple email validation
    if !payload.author_email.contains('@') {
        return (
            StatusCode::BAD_REQUEST,
            Json(ApiResponse::<Comment>::error(
                "Invalid email address".to_string(),
            )),
        );
    }

    match state.comment_repo.create(
        &post_id,
        &payload.author_name,
        &payload.author_email,
        &payload.content,
    ).await {
        Ok(comment) => (
            StatusCode::CREATED,
            Json(ApiResponse::success(comment)),
        ),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<Comment>::error(e)),
        ),
    }
}

// GET /api/posts/:post_id/comments - Get approved comments
pub async fn get_comments(
    State(state): State<Arc<AppState>>,
    Path(post_id): Path<String>,
) -> impl IntoResponse {
    match state.comment_repo.get_by_post(&post_id, false).await {
        Ok(comments) => (
            StatusCode::OK,
            Json(ApiResponse::success(comments)),
        ),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<Vec<Comment>>::error(e)),
        ),
    }
}

// GET /api/admin/comments/pending - Get pending comments (admin only)
pub async fn get_pending_comments(
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    // In a real app, this would check authentication
    match state.comment_repo.get_pending_count().await {
        Ok(count) => (
            StatusCode::OK,
            Json(ApiResponse::success(count)),
        ),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<i64>::error(e)),
        ),
    }
}

// PUT /api/comments/:id/approve - Approve comment (admin only)
pub async fn approve_comment(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    match state.comment_repo.approve(&id).await {
        Ok(_) => (
            StatusCode::OK,
            Json(ApiResponse::success("Comment approved".to_string())),
        ),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<String>::error(e)),
        ),
    }
}

// DELETE /api/comments/:id - Delete comment (admin only)
pub async fn delete_comment(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    match state.comment_repo.delete(&id).await {
        Ok(_) => (
            StatusCode::NO_CONTENT,
            Json(ApiResponse::success(())),
        ),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<()>::error(e)),
        ),
    }
}
