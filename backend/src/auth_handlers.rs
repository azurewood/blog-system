use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use std::sync::Arc;

use crate::auth::{create_jwt, LoginRequest, LoginResponse, UserResponse};
use crate::handlers::{ApiResponse, AppState};

pub async fn login(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<LoginRequest>,
) -> impl IntoResponse {
    // Get user by email
    let user = match state.user_repo.get_by_email(&payload.email).await {
        Ok(Some(user)) => user,
        Ok(None) => {
            return (
                StatusCode::UNAUTHORIZED,
                Json(ApiResponse::<LoginResponse>::error(
                    "Invalid email or password".to_string(),
                )),
            )
        }
        Err(e) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<LoginResponse>::error(e)),
            )
        }
    };

    // Verify password
    let is_valid = bcrypt::verify(&payload.password, &user.password_hash)
        .unwrap_or(false);

    if !is_valid {
        return (
            StatusCode::UNAUTHORIZED,
            Json(ApiResponse::<LoginResponse>::error(
                "Invalid email or password".to_string(),
            )),
        );
    }

    // Create JWT
    let token = match create_jwt(&user.id, &user.email, &user.role.to_string()) {
        Ok(token) => token,
        Err(e) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<LoginResponse>::error(
                    format!("Failed to create token: {}", e),
                )),
            )
        }
    };

    let response = LoginResponse {
        token,
        user: UserResponse {
            id: user.id,
            email: user.email,
            username: user.username,
            full_name: user.full_name,
            role: user.role.to_string(),
        },
    };

    (StatusCode::OK, Json(ApiResponse::success(response)))
}

pub async fn verify_token(
    State(_state): State<Arc<AppState>>,
    headers: axum::http::HeaderMap,
) -> impl IntoResponse {
    let token = match extract_token(&headers) {
        Some(token) => token,
        None => {
            return (
                StatusCode::UNAUTHORIZED,
                Json(ApiResponse::<serde_json::Value>::error("No token provided".to_string())),
            )
        }
    };

    match crate::auth::verify_jwt(&token) {
        Ok(claims) => {
            let response = serde_json::json!({
                "sub": claims.sub,
                "email": claims.email,
                "role": claims.role,
                "exp": claims.exp
            });
            (
                StatusCode::OK,
                Json(ApiResponse::success(response)),
            )
        }
        Err(_) => (
            StatusCode::UNAUTHORIZED,
            Json(ApiResponse::<serde_json::Value>::error("Invalid token".to_string())),
        ),
    }
}

fn extract_token(headers: &axum::http::HeaderMap) -> Option<String> {
    headers
        .get("Authorization")
        .and_then(|value| value.to_str().ok())
        .and_then(|value| {
            if value.starts_with("Bearer ") {
                Some(value[7..].to_string())
            } else {
                None
            }
        })
}
