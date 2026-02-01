use axum::{
    extract::{Path, Query, State},
    http::{StatusCode, header},
    response::{IntoResponse, Response},
    Json,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use base64::{Engine as _, engine::general_purpose};

use crate::handlers::{ApiResponse, AppState};
use crate::image_processor::ImageProcessor;

#[derive(Debug, Deserialize)]
pub struct ImageUploadRequest {
    pub filename: String,
    pub content_type: String,
    pub data: String, // base64 encoded
}

#[derive(Debug, Serialize)]
pub struct ImageUploadResponse {
    pub id: String,
    pub url: String,
    pub filename: String,
    pub variants: Vec<ImageVariantInfo>,
    pub optimization_info: String,
}

#[derive(Debug, Serialize)]
pub struct ImageVariantInfo {
    pub variant: String,
    pub url: String,
    pub width: u32,
    pub height: u32,
    pub size: usize,
    pub content_type: String,
}

#[derive(Debug, Deserialize)]
pub struct ImageQuery {
    pub variant: Option<String>,
}

pub async fn upload_image(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<ImageUploadRequest>,
) -> impl IntoResponse {
    // Validate content type
    if !payload.content_type.starts_with("image/") {
        return (
            StatusCode::BAD_REQUEST,
            Json(ApiResponse::<ImageUploadResponse>::error(
                "Invalid content type. Only images are allowed.".to_string(),
            )),
        );
    }

    // Decode base64 data
    let image_data = match general_purpose::STANDARD.decode(&payload.data) {
        Ok(data) => data,
        Err(_) => {
            return (
                StatusCode::BAD_REQUEST,
                Json(ApiResponse::<ImageUploadResponse>::error(
                    "Invalid base64 data".to_string(),
                )),
            )
        }
    };

    let original_size = image_data.len();

    // Validate file size (max 5MB for original)
    if original_size > 5 * 1024 * 1024 {
        return (
            StatusCode::BAD_REQUEST,
            Json(ApiResponse::<ImageUploadResponse>::error(
                "File too large. Maximum size is 5MB.".to_string(),
            )),
        );
    }

    // Process image and create all variants
    let processed_images = match ImageProcessor::process_image(&image_data, &payload.content_type) {
        Ok(images) => images,
        Err(e) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<ImageUploadResponse>::error(
                    format!("Failed to process image: {}", e),
                )),
            )
        }
    };

    // Calculate optimization savings
    let optimization_info = ImageProcessor::calculate_savings(original_size, &processed_images);

    // Store original image first
    let original = &processed_images[0];
    let original_id = match state.image_repo.create(
        &payload.filename,
        &original.content_type,
        original.data.clone(),
        Some(original.width),
        Some(original.height),
        "original",
        None,
        None, // TODO: Get from JWT token
    ).await {
        Ok(id) => id,
        Err(e) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse::<ImageUploadResponse>::error(
                    format!("Failed to save original image: {}", e),
                )),
            )
        }
    };

    // Store all variants
    let mut variant_infos = Vec::new();
    let base_url = std::env::var("API_BASE_URL")
        .unwrap_or_else(|_| "http://localhost:3000".to_string());

    for processed in &processed_images {
        let variant_name = processed.variant.to_string();
        
        // Store variant in database
        let _variant_id = match state.image_repo.create(
            &payload.filename,
            &processed.content_type,
            processed.data.clone(),
            Some(processed.width),
            Some(processed.height),
            &variant_name,
            Some(&original_id),
            None,
        ).await {
            Ok(id) => id,
            Err(e) => {
                eprintln!("Warning: Failed to save {} variant: {}", variant_name, e);
                continue;
            }
        };

        variant_infos.push(ImageVariantInfo {
            variant: variant_name.clone(),
            url: format!("{}/api/images/{}?variant={}", base_url, original_id, variant_name),
            width: processed.width,
            height: processed.height,
            size: processed.data.len(),
            content_type: processed.content_type.clone(),
        });
    }

    (
        StatusCode::OK,
        Json(ApiResponse::success(ImageUploadResponse {
            id: original_id.clone(),
            url: format!("{}/api/images/{}", base_url, original_id),
            filename: payload.filename,
            variants: variant_infos,
            optimization_info,
        })),
    )
}

pub async fn get_image(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
    Query(query): Query<ImageQuery>,
) -> impl IntoResponse {
    // Determine which variant to retrieve
    let image = if let Some(variant) = query.variant {
        // Get specific variant
        match state.image_repo.get_variant(&id, &variant).await {
            Ok(Some(img)) => img,
            Ok(None) => {
                // Fallback to original if variant not found
                match state.image_repo.get_by_id(&id).await {
                    Ok(Some(img)) => img,
                    Ok(None) => {
                        return Response::builder()
                            .status(StatusCode::NOT_FOUND)
                            .body(axum::body::Body::from("Image not found"))
                            .unwrap()
                    }
                    Err(e) => {
                        return Response::builder()
                            .status(StatusCode::INTERNAL_SERVER_ERROR)
                            .body(axum::body::Body::from(format!("Error: {}", e)))
                            .unwrap()
                    }
                }
            }
            Err(e) => {
                return Response::builder()
                    .status(StatusCode::INTERNAL_SERVER_ERROR)
                    .body(axum::body::Body::from(format!("Error: {}", e)))
                    .unwrap()
            }
        }
    } else {
        // Get original
        match state.image_repo.get_by_id(&id).await {
            Ok(Some(img)) => img,
            Ok(None) => {
                return Response::builder()
                    .status(StatusCode::NOT_FOUND)
                    .body(axum::body::Body::from("Image not found"))
                    .unwrap()
            }
            Err(e) => {
                return Response::builder()
                    .status(StatusCode::INTERNAL_SERVER_ERROR)
                    .body(axum::body::Body::from(format!("Error: {}", e)))
                    .unwrap()
            }
        }
    };

    Response::builder()
        .status(StatusCode::OK)
        .header(header::CONTENT_TYPE, image.content_type)
        .header(header::CACHE_CONTROL, "public, max-age=31536000, immutable")
        .header(header::CONTENT_LENGTH, image.size.to_string())
        .body(axum::body::Body::from(image.data))
        .unwrap()
}

pub async fn delete_image(
    State(state): State<Arc<AppState>>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    // TODO: Check authentication - only uploader or admin can delete
    
    match state.image_repo.delete(&id).await {
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

