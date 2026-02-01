use crate::db::DbPool;
use crate::models::{Comment, CommentStatus};
use chrono::Utc;
use libsql::params;
use uuid::Uuid;

#[derive(Clone)]
pub struct CommentRepository {
    pool: DbPool,
}

impl CommentRepository {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }

    pub async fn create(
        &self,
        post_id: &str,
        author_name: &str,
        author_email: &str,
        content: &str,
    ) -> Result<Comment, String> {
        let conn = self.pool.connection().await.map_err(|e| e.to_string())?;
        
        let id = Uuid::new_v4().to_string();
        let now = Utc::now();

        conn.execute(
            "INSERT INTO comments (id, post_id, author_name, author_email, content, status, created_at) 
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![
                id.clone(),
                post_id,
                author_name,
                author_email,
                content,
                CommentStatus::Pending.to_string(),
                now.timestamp(),
            ],
        )
        .await
        .map_err(|e| e.to_string())?;

        Ok(Comment {
            id,
            post_id: post_id.to_string(),
            author_name: author_name.to_string(),
            author_email: author_email.to_string(),
            content: content.to_string(),
            status: CommentStatus::Pending,
            created_at: now,
        })
    }

    pub async fn get_by_post(&self, post_id: &str, include_pending: bool) -> Result<Vec<Comment>, String> {
        let conn = self.pool.connection().await.map_err(|e| e.to_string())?;
        
        let query = if include_pending {
            "SELECT id, post_id, author_name, author_email, content, status, created_at 
             FROM comments 
             WHERE post_id = ?1 
             ORDER BY created_at DESC"
        } else {
            "SELECT id, post_id, author_name, author_email, content, status, created_at 
             FROM comments 
             WHERE post_id = ?1 AND status = 'approved' 
             ORDER BY created_at DESC"
        };

        let mut rows = conn.query(query, params![post_id])
            .await
            .map_err(|e| e.to_string())?;

        let mut comments = Vec::new();
        while let Some(row) = rows.next().await.map_err(|e| e.to_string())? {
            comments.push(self.row_to_comment(row)?);
        }

        Ok(comments)
    }

    pub async fn approve(&self, comment_id: &str) -> Result<(), String> {
        let conn = self.pool.connection().await.map_err(|e| e.to_string())?;
        
        conn.execute(
            "UPDATE comments SET status = 'approved' WHERE id = ?1",
            params![comment_id],
        )
        .await
        .map_err(|e| e.to_string())?;

        Ok(())
    }

    pub async fn reject(&self, comment_id: &str) -> Result<(), String> {
        let conn = self.pool.connection().await.map_err(|e| e.to_string())?;
        
        conn.execute(
            "UPDATE comments SET status = 'spam' WHERE id = ?1",
            params![comment_id],
        )
        .await
        .map_err(|e| e.to_string())?;

        Ok(())
    }

    pub async fn delete(&self, comment_id: &str) -> Result<(), String> {
        let conn = self.pool.connection().await.map_err(|e| e.to_string())?;
        
        conn.execute(
            "DELETE FROM comments WHERE id = ?1",
            params![comment_id],
        )
        .await
        .map_err(|e| e.to_string())?;

        Ok(())
    }

    pub async fn get_pending_count(&self) -> Result<i64, String> {
        let conn = self.pool.connection().await.map_err(|e| e.to_string())?;
        
        let mut rows = conn.query(
            "SELECT COUNT(*) FROM comments WHERE status = 'pending'",
            params![],
        )
        .await
        .map_err(|e| e.to_string())?;

        if let Some(row) = rows.next().await.map_err(|e| e.to_string())? {
            Ok(row.get(0).map_err(|e| e.to_string())?)
        } else {
            Ok(0)
        }
    }

    fn row_to_comment(&self, row: libsql::Row) -> Result<Comment, String> {
        let status_str: String = row.get(5).map_err(|e| e.to_string())?;
        let status = match status_str.as_str() {
            "approved" => CommentStatus::Approved,
            "spam" => CommentStatus::Spam,
            _ => CommentStatus::Pending,
        };

        Ok(Comment {
            id: row.get(0).map_err(|e| e.to_string())?,
            post_id: row.get(1).map_err(|e| e.to_string())?,
            author_name: row.get(2).map_err(|e| e.to_string())?,
            author_email: row.get(3).map_err(|e| e.to_string())?,
            content: row.get(4).map_err(|e| e.to_string())?,
            status,
            created_at: chrono::DateTime::from_timestamp(
                row.get::<i64>(6).map_err(|e| e.to_string())?, 0
            ).unwrap(),
        })
    }
}
