use libsql::{Builder, Connection, Database};
use std::sync::Arc;

#[derive(Clone)]
pub struct DbPool {
    db: Arc<Database>,
}

impl DbPool {
    pub async fn new(url: &str, auth_token: Option<String>) -> Result<Self, libsql::Error> {
        let builder = Builder::new_remote(url.to_string(), auth_token.unwrap_or_default());
        
        let db = builder.build().await?;
        
        Ok(Self { db: Arc::new(db) })
    }

    pub async fn connection(&self) -> Result<Connection, libsql::Error> {
        self.db.connect()
    }

    pub async fn init_schema(&self) -> Result<(), libsql::Error> {
        let conn = self.connection().await?;
        let schema = include_str!("../schema.sql");
        
        conn.execute_batch(schema).await?;
        
        Ok(())
    }
}
