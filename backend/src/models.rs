use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Post {
    pub id: String,
    pub title: String,
    pub slug: String,
    pub content: String,
    pub excerpt: Option<String>,
    pub author_id: String,
    pub status: PostStatus,
    pub featured_image: Option<String>,
    pub published_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub views: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum PostStatus {
    Draft,
    Published,
    Archived,
}

impl ToString for PostStatus {
    fn to_string(&self) -> String {
        match self {
            PostStatus::Draft => "draft".to_string(),
            PostStatus::Published => "published".to_string(),
            PostStatus::Archived => "archived".to_string(),
        }
    }
}

impl From<String> for PostStatus {
    fn from(s: String) -> Self {
        match s.as_str() {
            "published" => PostStatus::Published,
            "archived" => PostStatus::Archived,
            _ => PostStatus::Draft,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreatePostRequest {
    pub title: String,
    pub slug: String,
    pub content: String,
    pub excerpt: Option<String>,
    pub status: PostStatus,
    pub featured_image: Option<String>,
    pub tags: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdatePostRequest {
    pub title: Option<String>,
    pub slug: Option<String>,
    pub content: Option<String>,
    pub excerpt: Option<String>,
    pub status: Option<PostStatus>,
    pub featured_image: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub email: String,
    pub username: String,
    #[serde(skip_serializing)]
    pub password_hash: String,
    pub full_name: Option<String>,
    pub bio: Option<String>,
    pub avatar_url: Option<String>,
    pub role: UserRole,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum UserRole {
    Admin,
    Author,
    Editor,
}

impl ToString for UserRole {
    fn to_string(&self) -> String {
        match self {
            UserRole::Admin => "admin".to_string(),
            UserRole::Author => "author".to_string(),
            UserRole::Editor => "editor".to_string(),
        }
    }
}

impl From<String> for UserRole {
    fn from(s: String) -> Self {
        match s.as_str() {
            "admin" => UserRole::Admin,
            "editor" => UserRole::Editor,
            _ => UserRole::Author,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tag {
    pub id: String,
    pub name: String,
    pub slug: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Comment {
    pub id: String,
    pub post_id: String,
    pub author_name: String,
    pub author_email: String,
    pub content: String,
    pub status: CommentStatus,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum CommentStatus {
    Pending,
    Approved,
    Spam,
}

impl ToString for CommentStatus {
    fn to_string(&self) -> String {
        match self {
            CommentStatus::Pending => "pending".to_string(),
            CommentStatus::Approved => "approved".to_string(),
            CommentStatus::Spam => "spam".to_string(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PostWithAuthor {
    #[serde(flatten)]
    pub post: Post,
    pub author: AuthorInfo,
    pub tags: Vec<Tag>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthorInfo {
    pub username: String,
    pub full_name: Option<String>,
    pub avatar_url: Option<String>,
}
