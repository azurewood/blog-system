use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde::Serialize;
use std::sync::Arc;

use crate::handlers::{ApiResponse, AppState};

#[derive(Debug, Serialize)]
pub struct ImageAnalytics {
    pub total_images: i64,
    pub total_size_bytes: i64,
    pub total_size_mb: f64,
    pub by_variant: Vec<VariantStats>,
    pub orphaned_images: Vec<OrphanedImage>,
    pub largest_images: Vec<LargeImage>,
    pub recent_uploads: Vec<RecentUpload>,
}

#[derive(Debug, Serialize)]
pub struct VariantStats {
    pub variant: String,
    pub count: i64,
    pub total_size_bytes: i64,
    pub total_size_mb: f64,
}

#[derive(Debug, Serialize)]
pub struct OrphanedImage {
    pub id: String,
    pub filename: String,
    pub size_bytes: i64,
    pub created_at: i64,
}

#[derive(Debug, Serialize)]
pub struct LargeImage {
    pub id: String,
    pub filename: String,
    pub size_bytes: i64,
    pub size_mb: f64,
    pub variant: String,
}

#[derive(Debug, Serialize)]
pub struct RecentUpload {
    pub id: String,
    pub filename: String,
    pub size_bytes: i64,
    pub created_at: i64,
    pub variants_count: i64,
}

pub async fn get_analytics(
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    match generate_analytics(state).await {
        Ok(analytics) => (
            StatusCode::OK,
            Json(ApiResponse::success(analytics)),
        ),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse::<ImageAnalytics>::error(e)),
        ),
    }
}

async fn generate_analytics(state: Arc<AppState>) -> Result<ImageAnalytics, String> {
    let pool = state.image_repo.pool.clone();
    let conn = pool.connection().await.map_err(|e| e.to_string())?;

    // Total images and size
    let mut rows = conn.query(
        "SELECT COUNT(*), COALESCE(SUM(size), 0) FROM images WHERE variant = 'original'",
        libsql::params![],
    ).await.map_err(|e| e.to_string())?;

    let (total_images, total_size_bytes) = if let Some(row) = rows.next().await.map_err(|e| e.to_string())? {
        let count: i64 = row.get(0).map_err(|e| e.to_string())?;
        let size: i64 = row.get(1).map_err(|e| e.to_string())?;
        (count, size)
    } else {
        (0, 0)
    };

    // Stats by variant
    let mut rows = conn.query(
        "SELECT variant, COUNT(*), COALESCE(SUM(size), 0) 
         FROM images 
         GROUP BY variant 
         ORDER BY variant",
        libsql::params![],
    ).await.map_err(|e| e.to_string())?;

    let mut by_variant = Vec::new();
    while let Some(row) = rows.next().await.map_err(|e| e.to_string())? {
        let variant: String = row.get(0).map_err(|e| e.to_string())?;
        let count: i64 = row.get(1).map_err(|e| e.to_string())?;
        let size_bytes: i64 = row.get(2).map_err(|e| e.to_string())?;
        
        by_variant.push(VariantStats {
            variant,
            count,
            total_size_bytes: size_bytes,
            total_size_mb: size_bytes as f64 / 1024.0 / 1024.0,
        });
    }

    // Orphaned images (not referenced in any posts)
    // For now, just return empty - would need to check posts table
    let orphaned_images = Vec::new();

    // Largest images
    let mut rows = conn.query(
        "SELECT id, filename, size, variant 
         FROM images 
         WHERE variant = 'original'
         ORDER BY size DESC 
         LIMIT 10",
        libsql::params![],
    ).await.map_err(|e| e.to_string())?;

    let mut largest_images = Vec::new();
    while let Some(row) = rows.next().await.map_err(|e| e.to_string())? {
        let id: String = row.get(0).map_err(|e| e.to_string())?;
        let filename: String = row.get(1).map_err(|e| e.to_string())?;
        let size_bytes: i64 = row.get(2).map_err(|e| e.to_string())?;
        let variant: String = row.get(3).map_err(|e| e.to_string())?;
        
        largest_images.push(LargeImage {
            id,
            filename,
            size_bytes,
            size_mb: size_bytes as f64 / 1024.0 / 1024.0,
            variant,
        });
    }

    // Recent uploads
    let mut rows = conn.query(
        "SELECT i.id, i.filename, i.size, i.created_at,
                (SELECT COUNT(*) FROM images WHERE parent_id = i.id) as variants_count
         FROM images i
         WHERE i.variant = 'original'
         ORDER BY i.created_at DESC
         LIMIT 10",
        libsql::params![],
    ).await.map_err(|e| e.to_string())?;

    let mut recent_uploads = Vec::new();
    while let Some(row) = rows.next().await.map_err(|e| e.to_string())? {
        recent_uploads.push(RecentUpload {
            id: row.get(0).map_err(|e| e.to_string())?,
            filename: row.get(1).map_err(|e| e.to_string())?,
            size_bytes: row.get(2).map_err(|e| e.to_string())?,
            created_at: row.get(3).map_err(|e| e.to_string())?,
            variants_count: row.get(4).map_err(|e| e.to_string())?,
        });
    }

    Ok(ImageAnalytics {
        total_images,
        total_size_bytes,
        total_size_mb: total_size_bytes as f64 / 1024.0 / 1024.0,
        by_variant,
        orphaned_images,
        largest_images,
        recent_uploads,
    })
}
