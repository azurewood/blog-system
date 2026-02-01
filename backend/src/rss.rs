use axum::{
    extract::State,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use std::sync::Arc;
use chrono::Utc;

use crate::handlers::AppState;

pub async fn rss_feed(State(state): State<Arc<AppState>>) -> Response {
    match generate_rss_feed(state).await {
        Ok(xml) => (
            StatusCode::OK,
            [("Content-Type", "application/rss+xml; charset=utf-8")],
            xml,
        )
            .into_response(),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Error generating RSS feed: {}", e),
        )
            .into_response(),
    }
}

async fn generate_rss_feed(state: Arc<AppState>) -> Result<String, String> {
    // Fetch the latest 20 published posts
    let posts = state.post_repo.list_published(20, 0).await?;

    let now = Utc::now().to_rfc2822();
    let base_url = std::env::var("FRONTEND_URL").unwrap_or_else(|_| "http://localhost:3001".to_string());

    let mut items = String::new();
    for post in posts {
        let pub_date = post
            .published_at
            .unwrap_or(post.created_at)
            .to_rfc2822();
        
        let link = format!("{}/blog/{}", base_url, post.slug);
        let description = post.excerpt.unwrap_or_else(|| {
            // Create excerpt from content (first 200 chars)
            let content = post.content.replace('\n', " ");
            if content.len() > 200 {
                format!("{}...", &content[..200])
            } else {
                content
            }
        });

        items.push_str(&format!(
            r#"    <item>
      <title><![CDATA[{}]]></title>
      <link>{}</link>
      <guid isPermaLink="true">{}</guid>
      <description><![CDATA[{}]]></description>
      <pubDate>{}</pubDate>
    </item>
"#,
            escape_xml(&post.title),
            link,
            link,
            escape_xml(&description),
            pub_date
        ));
    }

    let rss = format!(
        r#"<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>My Blog</title>
    <link>{}</link>
    <description>Thoughts, stories, and ideas</description>
    <language>en-us</language>
    <lastBuildDate>{}</lastBuildDate>
    <atom:link href="{}/feed.xml" rel="self" type="application/rss+xml"/>
{}
  </channel>
</rss>"#,
        base_url, now, base_url, items
    );

    Ok(rss)
}

fn escape_xml(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&apos;")
}
