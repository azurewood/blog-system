use crate::db::DbPool;
use crate::models::*;
use chrono::Utc;
use libsql::params;
use uuid::Uuid;

#[derive(Clone)]
pub struct PostRepository {
    pool: DbPool,
}

impl PostRepository {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, post: CreatePostRequest, author_id: &str) -> Result<Post, String> {
        let conn = self.pool.connection().await.map_err(|e| e.to_string())?;
        
        let id = Uuid::new_v4().to_string();
        let now = Utc::now();
        let published_at = if matches!(post.status, PostStatus::Published) {
            Some(now)
        } else {
            None
        };

        conn.execute(
            "INSERT INTO posts (id, title, slug, content, excerpt, author_id, status, featured_image, published_at, created_at, updated_at, views) 
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, 0)",
            params![
                id.clone(),
                post.title.clone(),
                post.slug.clone(),
                post.content.clone(),
                post.excerpt.clone(),
                author_id,
                post.status.to_string(),
                post.featured_image.clone(),
                published_at.map(|dt| dt.timestamp()),
                now.timestamp(),
                now.timestamp(),
            ],
        )
        .await
        .map_err(|e| e.to_string())?;

        // Handle tags if provided
        if let Some(tags) = post.tags {
            for tag_name in tags {
                let tag_slug = tag_name.to_lowercase().replace(' ', "-");
                let tag_id = Uuid::new_v4().to_string();
                
                // Insert tag if it doesn't exist
                let _ = conn.execute(
                    "INSERT OR IGNORE INTO tags (id, name, slug, created_at) VALUES (?1, ?2, ?3, ?4)",
                    params![tag_id.clone(), tag_name, tag_slug.clone(), now.timestamp()],
                ).await;

                // Get tag id
                let mut rows = conn.query(
                    "SELECT id FROM tags WHERE slug = ?1",
                    params![tag_slug],
                ).await.map_err(|e| e.to_string())?;

                if let Some(row) = rows.next().await.map_err(|e| e.to_string())? {
                    let actual_tag_id: String = row.get(0).map_err(|e| e.to_string())?;
                    
                    // Link post to tag
                    conn.execute(
                        "INSERT INTO post_tags (post_id, tag_id) VALUES (?1, ?2)",
                        params![id.clone(), actual_tag_id],
                    ).await.map_err(|e| e.to_string())?;
                }
            }
        }

        Ok(Post {
            id,
            title: post.title,
            slug: post.slug,
            content: post.content,
            excerpt: post.excerpt,
            author_id: author_id.to_string(),
            status: post.status,
            featured_image: post.featured_image,
            published_at,
            created_at: now,
            updated_at: now,
            views: 0,
        })
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<Post>, String> {
        let conn = self.pool.connection().await.map_err(|e| e.to_string())?;
        
        let mut rows = conn.query(
            "SELECT id, title, slug, content, excerpt, author_id, status, featured_image, published_at, created_at, updated_at, views 
             FROM posts WHERE id = ?1",
            params![id],
        ).await.map_err(|e| e.to_string())?;

        if let Some(row) = rows.next().await.map_err(|e| e.to_string())? {
            Ok(Some(self.row_to_post(row)?))
        } else {
            Ok(None)
        }
    }

    pub async fn get_by_slug(&self, slug: &str) -> Result<Option<Post>, String> {
        let conn = self.pool.connection().await.map_err(|e| e.to_string())?;
        
        let mut rows = conn.query(
            "SELECT id, title, slug, content, excerpt, author_id, status, featured_image, published_at, created_at, updated_at, views 
             FROM posts WHERE slug = ?1",
            params![slug],
        ).await.map_err(|e| e.to_string())?;

        if let Some(row) = rows.next().await.map_err(|e| e.to_string())? {
            Ok(Some(self.row_to_post(row)?))
        } else {
            Ok(None)
        }
    }

    pub async fn list_published(&self, limit: i64, offset: i64) -> Result<Vec<Post>, String> {
        let conn = self.pool.connection().await.map_err(|e| e.to_string())?;
        
        let mut rows = conn.query(
            "SELECT id, title, slug, content, excerpt, author_id, status, featured_image, published_at, created_at, updated_at, views 
             FROM posts 
             WHERE status = 'published' 
             ORDER BY published_at DESC 
             LIMIT ?1 OFFSET ?2",
            params![limit, offset],
        ).await.map_err(|e| e.to_string())?;

        let mut posts = Vec::new();
        while let Some(row) = rows.next().await.map_err(|e| e.to_string())? {
            posts.push(self.row_to_post(row)?);
        }

        Ok(posts)
    }

    pub async fn update(&self, id: &str, update: UpdatePostRequest) -> Result<Post, String> {
        let conn = self.pool.connection().await.map_err(|e| e.to_string())?;
        let now = Utc::now();

        // Build update fields and collect values
        let mut fields = Vec::new();
        let mut values: Vec<libsql::Value> = Vec::new();

        if let Some(title) = &update.title {
            fields.push("title = ?");
            values.push(libsql::Value::Text(title.clone()));
        }
        if let Some(slug) = &update.slug {
            fields.push("slug = ?");
            values.push(libsql::Value::Text(slug.clone()));
        }
        if let Some(content) = &update.content {
            fields.push("content = ?");
            values.push(libsql::Value::Text(content.clone()));
        }
        if let Some(excerpt) = &update.excerpt {
            fields.push("excerpt = ?");
            values.push(libsql::Value::Text(excerpt.clone()));
        }
        if let Some(status) = &update.status {
            fields.push("status = ?");
            values.push(libsql::Value::Text(status.to_string()));
        }
        if let Some(featured_image) = &update.featured_image {
            fields.push("featured_image = ?");
            values.push(libsql::Value::Text(featured_image.clone()));
        }

        fields.push("updated_at = ?");
        values.push(libsql::Value::Integer(now.timestamp()));

        // Add the id as the last parameter
        values.push(libsql::Value::Text(id.to_string()));

        let query = format!(
            "UPDATE posts SET {} WHERE id = ?",
            fields.join(", ")
        );

        conn.execute(&query, libsql::params::Params::Positional(values))
            .await
            .map_err(|e| e.to_string())?;

        self.get_by_id(id).await?.ok_or_else(|| "Post not found after update".to_string())
    }

    pub async fn delete(&self, id: &str) -> Result<(), String> {
        let conn = self.pool.connection().await.map_err(|e| e.to_string())?;
        
        conn.execute("DELETE FROM posts WHERE id = ?1", params![id])
            .await
            .map_err(|e| e.to_string())?;

        Ok(())
    }

    pub async fn increment_views(&self, id: &str) -> Result<(), String> {
        let conn = self.pool.connection().await.map_err(|e| e.to_string())?;
        
        conn.execute(
            "UPDATE posts SET views = views + 1 WHERE id = ?1",
            params![id],
        )
        .await
        .map_err(|e| e.to_string())?;

        Ok(())
    }

    pub async fn search(&self, query: &str, limit: i64) -> Result<Vec<Post>, String> {
        let conn = self.pool.connection().await.map_err(|e| e.to_string())?;
        
        // Search using FTS5
        let mut rows = conn.query(
            "SELECT p.id, p.title, p.slug, p.content, p.excerpt, p.author_id, p.status, 
                    p.featured_image, p.published_at, p.created_at, p.updated_at, p.views
             FROM posts p
             INNER JOIN posts_fts ON posts_fts.rowid = p.rowid
             WHERE posts_fts MATCH ?1 AND p.status = 'published'
             ORDER BY rank
             LIMIT ?2",
            params![query, limit],
        ).await.map_err(|e| e.to_string())?;

        let mut posts = Vec::new();
        while let Some(row) = rows.next().await.map_err(|e| e.to_string())? {
            posts.push(self.row_to_post(row)?);
        }

        Ok(posts)
    }

    fn row_to_post(&self, row: libsql::Row) -> Result<Post, String> {
        Ok(Post {
            id: row.get(0).map_err(|e| e.to_string())?,
            title: row.get(1).map_err(|e| e.to_string())?,
            slug: row.get(2).map_err(|e| e.to_string())?,
            content: row.get(3).map_err(|e| e.to_string())?,
            excerpt: row.get(4).map_err(|e| e.to_string())?,
            author_id: row.get(5).map_err(|e| e.to_string())?,
            status: PostStatus::from(row.get::<String>(6).map_err(|e| e.to_string())?),
            featured_image: row.get(7).map_err(|e| e.to_string())?,
            published_at: row.get::<Option<i64>>(8)
                .map_err(|e| e.to_string())?
                .map(|ts| chrono::DateTime::from_timestamp(ts, 0).unwrap()),
            created_at: chrono::DateTime::from_timestamp(
                row.get::<i64>(9).map_err(|e| e.to_string())?, 0
            ).unwrap(),
            updated_at: chrono::DateTime::from_timestamp(
                row.get::<i64>(10).map_err(|e| e.to_string())?, 0
            ).unwrap(),
            views: row.get(11).map_err(|e| e.to_string())?,
        })
    }
}
