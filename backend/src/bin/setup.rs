use blog_backend::create_app;
use blog_backend::user_repository::UserRepository;
use blog_backend::models::UserRole;
use blog_backend::db::DbPool;
use std::env;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Load environment variables
    dotenvy::dotenv().ok();
    
    let database_url = env::var("TURSO_DATABASE_URL")
        .expect("TURSO_DATABASE_URL must be set");
    let auth_token = env::var("TURSO_AUTH_TOKEN").ok();

    println!("Connecting to database...");
    let pool = DbPool::new(&database_url, auth_token).await?;
    
    println!("Initializing schema...");
    pool.init_schema().await?;

    let user_repo = UserRepository::new(pool);

    // Create default admin user
    println!("Creating default admin user...");
    let password_hash = bcrypt::hash("password123", bcrypt::DEFAULT_COST)?;
    
    match user_repo.create_user(
        "admin@example.com",
        "admin",
        &password_hash,
        Some("Admin User".to_string()),
        UserRole::Admin,
    ).await {
        Ok(user) => {
            println!("✓ Admin user created successfully!");
            println!("  Email: {}", user.email);
            println!("  Username: {}", user.username);
            println!("  Password: password123");
            println!("\nYou can now login at http://localhost:3001/login");
        }
        Err(e) => {
            if e.contains("UNIQUE constraint failed") {
                println!("⚠ Admin user already exists");
            } else {
                println!("✗ Error creating admin user: {}", e);
            }
        }
    }

    Ok(())
}
