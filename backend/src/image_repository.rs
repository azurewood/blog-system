use crate::db::DbPool;
use chrono::Utc;
use libsql::params;
use uuid::Uuid;

#[derive(Clone)]
pub struct ImageRepository {
    pub pool: DbPool,
}

#[derive(Debug)]
pub struct Image {
    pub id: String,
    pub filename: String,
    pub content_type: String,
    pub data: Vec<u8>,
    pub size: i64,
    pub width: Option<i64>,
    pub height: Option<i64>,
    pub variant: String,
    pub parent_id: Option<String>,
    pub uploaded_by: Option<String>,
    pub created_at: i64,
}

impl ImageRepository {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }

    pub async fn create(
        &self,
        filename: &str,
        content_type: &str,
        data: Vec<u8>,
        width: Option<u32>,
        height: Option<u32>,
        variant: &str,
        parent_id: Option<&str>,
        uploaded_by: Option<&str>,
    ) -> Result<String, String> {
        let conn = self.pool.connection().await.map_err(|e| e.to_string())?;
        
        let id = Uuid::new_v4().to_string();
        let now = Utc::now();
        let size = data.len() as i64;

        conn.execute(
            "INSERT INTO images (id, filename, content_type, data, size, width, height, variant, parent_id, uploaded_by, created_at) 
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
            params![
                id.clone(),
                filename,
                content_type,
                data,
                size,
                width.map(|w| w as i64),
                height.map(|h| h as i64),
                variant,
                parent_id,
                uploaded_by,
                now.timestamp(),
            ],
        )
        .await
        .map_err(|e| e.to_string())?;

        Ok(id)
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<Image>, String> {
        let conn = self.pool.connection().await.map_err(|e| e.to_string())?;
        
        let mut rows = conn.query(
            "SELECT id, filename, content_type, data, size, width, height, variant, parent_id, uploaded_by, created_at 
             FROM images WHERE id = ?1",
            params![id],
        ).await.map_err(|e| e.to_string())?;

        if let Some(row) = rows.next().await.map_err(|e| e.to_string())? {
            Ok(Some(self.row_to_image(row)?))
        } else {
            Ok(None)
        }
    }

    pub async fn get_variant(&self, parent_id: &str, variant: &str) -> Result<Option<Image>, String> {
        let conn = self.pool.connection().await.map_err(|e| e.to_string())?;
        
        let mut rows = conn.query(
            "SELECT id, filename, content_type, data, size, width, height, variant, parent_id, uploaded_by, created_at 
             FROM images WHERE parent_id = ?1 AND variant = ?2",
            params![parent_id, variant],
        ).await.map_err(|e| e.to_string())?;

        if let Some(row) = rows.next().await.map_err(|e| e.to_string())? {
            Ok(Some(self.row_to_image(row)?))
        } else {
            Ok(None)
        }
    }

    pub async fn list_variants(&self, parent_id: &str) -> Result<Vec<(String, String, i64)>, String> {
        let conn = self.pool.connection().await.map_err(|e| e.to_string())?;
        
        let mut rows = conn.query(
            "SELECT variant, content_type, size FROM images WHERE parent_id = ?1",
            params![parent_id],
        ).await.map_err(|e| e.to_string())?;

        let mut variants = Vec::new();
        while let Some(row) = rows.next().await.map_err(|e| e.to_string())? {
            variants.push((
                row.get(0).map_err(|e| e.to_string())?,
                row.get(1).map_err(|e| e.to_string())?,
                row.get(2).map_err(|e| e.to_string())?,
            ));
        }

        Ok(variants)
    }

    pub async fn delete(&self, id: &str) -> Result<(), String> {
        let conn = self.pool.connection().await.map_err(|e| e.to_string())?;
        
        // This will cascade delete all variants due to ON DELETE CASCADE
        conn.execute(
            "DELETE FROM images WHERE id = ?1",
            params![id],
        )
        .await
        .map_err(|e| e.to_string())?;

        Ok(())
    }

    pub async fn list_by_user(&self, user_id: &str, limit: i64) -> Result<Vec<(String, String, i64)>, String> {
        let conn = self.pool.connection().await.map_err(|e| e.to_string())?;
        
        let mut rows = conn.query(
            "SELECT id, filename, created_at 
             FROM images 
             WHERE uploaded_by = ?1 AND variant = 'original'
             ORDER BY created_at DESC 
             LIMIT ?2",
            params![user_id, limit],
        ).await.map_err(|e| e.to_string())?;

        let mut images = Vec::new();
        while let Some(row) = rows.next().await.map_err(|e| e.to_string())? {
            images.push((
                row.get(0).map_err(|e| e.to_string())?,
                row.get(1).map_err(|e| e.to_string())?,
                row.get(2).map_err(|e| e.to_string())?,
            ));
        }

        Ok(images)
    }

    fn row_to_image(&self, row: libsql::Row) -> Result<Image, String> {
        Ok(Image {
            id: row.get(0).map_err(|e| e.to_string())?,
            filename: row.get(1).map_err(|e| e.to_string())?,
            content_type: row.get(2).map_err(|e| e.to_string())?,
            data: row.get(3).map_err(|e| e.to_string())?,
            size: row.get(4).map_err(|e| e.to_string())?,
            width: row.get(5).map_err(|e| e.to_string())?,
            height: row.get(6).map_err(|e| e.to_string())?,
            variant: row.get(7).map_err(|e| e.to_string())?,
            parent_id: row.get(8).map_err(|e| e.to_string())?,
            uploaded_by: row.get(9).map_err(|e| e.to_string())?,
            created_at: row.get(10).map_err(|e| e.to_string())?,
        })
    }
}

