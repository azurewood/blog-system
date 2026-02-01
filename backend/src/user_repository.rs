use crate::db::DbPool;
use crate::models::{User, UserRole};
use chrono::Utc;
use libsql::params;
use uuid::Uuid;

#[derive(Clone)]
pub struct UserRepository {
    pool: DbPool,
}

impl UserRepository {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }

    pub async fn create_user(
        &self,
        email: &str,
        username: &str,
        password_hash: &str,
        full_name: Option<String>,
        role: UserRole,
    ) -> Result<User, String> {
        let conn = self.pool.connection().await.map_err(|e| e.to_string())?;
        
        let id = Uuid::new_v4().to_string();
        let now = Utc::now();

        conn.execute(
            "INSERT INTO users (id, email, username, password_hash, full_name, role, created_at, updated_at) 
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![
                id.clone(),
                email,
                username,
                password_hash,
                full_name.clone(),
                role.to_string(),
                now.timestamp(),
                now.timestamp(),
            ],
        )
        .await
        .map_err(|e| e.to_string())?;

        Ok(User {
            id,
            email: email.to_string(),
            username: username.to_string(),
            password_hash: password_hash.to_string(),
            full_name,
            bio: None,
            avatar_url: None,
            role,
            created_at: now,
            updated_at: now,
        })
    }

    pub async fn get_by_email(&self, email: &str) -> Result<Option<User>, String> {
        let conn = self.pool.connection().await.map_err(|e| e.to_string())?;
        
        let mut rows = conn.query(
            "SELECT id, email, username, password_hash, full_name, bio, avatar_url, role, created_at, updated_at 
             FROM users WHERE email = ?1",
            params![email],
        ).await.map_err(|e| e.to_string())?;

        if let Some(row) = rows.next().await.map_err(|e| e.to_string())? {
            Ok(Some(self.row_to_user(row)?))
        } else {
            Ok(None)
        }
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<User>, String> {
        let conn = self.pool.connection().await.map_err(|e| e.to_string())?;
        
        let mut rows = conn.query(
            "SELECT id, email, username, password_hash, full_name, bio, avatar_url, role, created_at, updated_at 
             FROM users WHERE id = ?1",
            params![id],
        ).await.map_err(|e| e.to_string())?;

        if let Some(row) = rows.next().await.map_err(|e| e.to_string())? {
            Ok(Some(self.row_to_user(row)?))
        } else {
            Ok(None)
        }
    }

    fn row_to_user(&self, row: libsql::Row) -> Result<User, String> {
        Ok(User {
            id: row.get(0).map_err(|e| e.to_string())?,
            email: row.get(1).map_err(|e| e.to_string())?,
            username: row.get(2).map_err(|e| e.to_string())?,
            password_hash: row.get(3).map_err(|e| e.to_string())?,
            full_name: row.get(4).map_err(|e| e.to_string())?,
            bio: row.get(5).map_err(|e| e.to_string())?,
            avatar_url: row.get(6).map_err(|e| e.to_string())?,
            role: UserRole::from(row.get::<String>(7).map_err(|e| e.to_string())?),
            created_at: chrono::DateTime::from_timestamp(
                row.get::<i64>(8).map_err(|e| e.to_string())?, 0
            ).unwrap(),
            updated_at: chrono::DateTime::from_timestamp(
                row.get::<i64>(9).map_err(|e| e.to_string())?, 0
            ).unwrap(),
        })
    }
}
