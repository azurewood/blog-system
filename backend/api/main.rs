// use blog_backend::create_app;
// use std::env;
// use tower::ServiceExt;
// use vercel_runtime::{run, Body, Error, Request, Response};

// #[tokio::main]
// async fn main() -> Result<(), Error> {
//     // Initialize database connection
//     let database_url = env::var("TURSO_DATABASE_URL")
//         .expect("TURSO_DATABASE_URL must be set");
//     let auth_token = env::var("TURSO_AUTH_TOKEN").ok();

//     // Create the Axum app
//     let app = create_app(&database_url, auth_token)
//         .await
//         .map_err(|e| Error::from(e.to_string()))?;

//     // Run as Vercel serverless function
//     run(move |req: Request| {
//         let app = app.clone();
//         async move {
//             handle_request(app, req).await
//         }
//     })
//     .await
// }

// async fn handle_request(
//     app: axum::Router,
//     vercel_req: Request,
// ) -> Result<Response, Error> {
//     // Convert Vercel Request to Hyper Request
//     let (parts, body) = vercel_req.into_parts();
    
//     let body_bytes = match body {
//         Body::Empty => vec![],
//         Body::Text(s) => s.into_bytes(),
//         Body::Binary(b) => b,
//     };

//     let hyper_body = http_body_util::Full::new(body_bytes.into());
//     let hyper_req = hyper::Request::from_parts(parts, hyper_body);

//     // Call Axum app
//     let hyper_response = app
//         .oneshot(hyper_req)
//         .await
//         .map_err(|e| Error::from(e.to_string()))?;

//     // Convert Hyper Response back to Vercel Response
//     let (parts, body) = hyper_response.into_parts();
    
//     // Collect response body
//     use http_body_util::BodyExt;
//     let body_bytes = body
//         .collect()
//         .await
//         .map_err(|e| Error::from(e.to_string()))?
//         .to_bytes()
//         .to_vec();

//     // Build Vercel response
//     let mut builder = Response::builder().status(parts.status);
    
//     for (key, value) in parts.headers.iter() {
//         builder = builder.header(key, value);
//     }

//     builder
//         .body(Body::Binary(body_bytes))
//         .map_err(|e| Error::from(e.to_string()))
// }