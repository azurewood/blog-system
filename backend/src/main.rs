use blog_backend::create_app;
use std::env;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Load .env file
    dotenvy::dotenv().ok();

    // Load environment variables
    let database_url = env::var("TURSO_DATABASE_URL")
        .expect("TURSO_DATABASE_URL must be set");
    let auth_token = env::var("TURSO_AUTH_TOKEN").ok();

    // Create the application
    let app = create_app(&database_url, auth_token).await?;

    // Determine port
    let port = env::var("PORT").unwrap_or_else(|_| "3000".to_string());
    let addr = format!("0.0.0.0:{}", port);

    println!("Server running on http://{}", addr);

    // Start the server
    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

// use blog_backend::create_app;
// use std::env;
// use vercel_runtime::{run, Body as VercelBody, Error, Request, Response};
// use tower::ServiceExt; 
// use http_body_util::BodyExt; // For collecting the axum body

// #[tokio::main]
// async fn main() -> Result<(), Error> {
//     dotenvy::dotenv().ok();
    
//     let database_url = env::var("TURSO_DATABASE_URL").expect("TURSO_DATABASE_URL must be set");
//     let auth_token = env::var("TURSO_AUTH_TOKEN").ok();

//     let app = create_app(&database_url, auth_token)
//         .await
//         .map_err(|e| Error::from(e.to_string()))?;

//     run(|req: Request| {
//         let mut app = app.clone(); 
//         async move {
//             // 1. Get the Axum response
//             let axum_response = app.oneshot(req).await
//                 .map_err(|e| Error::from(e.to_string()))?;

//             // 2. Extract parts and body
//             let (parts, body) = axum_response.into_parts();
            
//             // 3. Convert Axum Body to Vercel Body
//             // We collect the bytes from the axum stream and wrap them in VercelBody
//             let bytes = body.collect().await
//                 .map_err(|e| Error::from(e.to_string()))?
//                 .to_bytes();
                
//             let vercel_body = VercelBody::from(bytes.to_vec());

//             // 4. Reconstruct the response with Vercel's expected types
//             Ok(Response::from_parts(parts, vercel_body))
//         }
//     }).await
// }


