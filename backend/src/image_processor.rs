use image::{ImageFormat, DynamicImage, imageops::FilterType, GenericImageView};
use std::io::Cursor;

#[derive(Debug, Clone)]
pub enum ImageVariant {
    Original,
    Thumbnail,  // 150x150
    Small,      // 400x400
    Medium,     // 800x800
    WebP,       // WebP version of original
}

impl ImageVariant {
    pub fn to_string(&self) -> String {
        match self {
            ImageVariant::Original => "original".to_string(),
            ImageVariant::Thumbnail => "thumbnail".to_string(),
            ImageVariant::Small => "small".to_string(),
            ImageVariant::Medium => "medium".to_string(),
            ImageVariant::WebP => "webp".to_string(),
        }
    }

    pub fn max_dimension(&self) -> Option<u32> {
        match self {
            ImageVariant::Thumbnail => Some(150),
            ImageVariant::Small => Some(400),
            ImageVariant::Medium => Some(800),
            _ => None,
        }
    }
}

pub struct ProcessedImage {
    pub data: Vec<u8>,
    pub width: u32,
    pub height: u32,
    pub content_type: String,
    pub variant: ImageVariant,
}

pub struct ImageProcessor;

impl ImageProcessor {
    /// Load image from bytes and detect format
    pub fn load_from_bytes(data: &[u8]) -> Result<DynamicImage, String> {
        image::load_from_memory(data)
            .map_err(|e| format!("Failed to load image: {}", e))
    }

    /// Get image format from content type
    fn get_format(content_type: &str) -> Result<ImageFormat, String> {
        match content_type {
            "image/jpeg" | "image/jpg" => Ok(ImageFormat::Jpeg),
            "image/png" => Ok(ImageFormat::Png),
            "image/gif" => Ok(ImageFormat::Gif),
            "image/webp" => Ok(ImageFormat::WebP),
            _ => Err(format!("Unsupported image format: {}", content_type)),
        }
    }

    /// Create thumbnail with specified max dimension
    pub fn create_thumbnail(
        img: &DynamicImage,
        max_dimension: u32,
    ) -> Result<DynamicImage, String> {
        let (width, height) = img.dimensions();
        
        // Calculate new dimensions maintaining aspect ratio
        let (new_width, new_height) = if width > height {
            let ratio = max_dimension as f32 / width as f32;
            (max_dimension, (height as f32 * ratio) as u32)
        } else {
            let ratio = max_dimension as f32 / height as f32;
            ((width as f32 * ratio) as u32, max_dimension)
        };

        Ok(img.resize(new_width, new_height, FilterType::Lanczos3))
    }

    /// Convert image to JPEG format
    pub fn to_jpeg(img: &DynamicImage, _quality: u8) -> Result<Vec<u8>, String> {
        let mut buffer = Vec::new();
        let mut cursor = Cursor::new(&mut buffer);
        
        // Convert to RGB8 if needed (JPEG doesn't support alpha)
        let rgb_img = DynamicImage::ImageRgb8(img.to_rgb8());
        
        rgb_img
            .write_to(&mut cursor, ImageFormat::Jpeg)
            .map_err(|e| format!("Failed to encode JPEG: {}", e))?;

        Ok(buffer)
    }

    /// Convert image to WebP format
    pub fn to_webp(img: &DynamicImage, quality: f32) -> Result<Vec<u8>, String> {
        let (width, height) = img.dimensions();
        let rgba = img.to_rgba8();
        
        // Create WebP encoder
        let encoder = webp::Encoder::from_rgba(&rgba, width, height);
        let encoded = encoder.encode(quality);
        
        Ok(encoded.to_vec())
    }

    /// Process image and create all variants
    pub fn process_image(
        data: &[u8],
        original_content_type: &str,
    ) -> Result<Vec<ProcessedImage>, String> {
        let img = Self::load_from_bytes(data)?;
        let (width, height) = img.dimensions();
        
        let mut variants = Vec::new();

        // 1. Original (re-encode as JPEG for consistency and compression)
        let original_data = Self::to_jpeg(&img, 85)?;
        variants.push(ProcessedImage {
            data: original_data,
            width,
            height,
            content_type: "image/jpeg".to_string(),
            variant: ImageVariant::Original,
        });

        // 2. Thumbnail (150x150)
        if width > 150 || height > 150 {
            let thumbnail = Self::create_thumbnail(&img, 150)?;
            let (thumb_w, thumb_h) = thumbnail.dimensions();
            let thumbnail_data = Self::to_jpeg(&thumbnail, 85)?;
            variants.push(ProcessedImage {
                data: thumbnail_data,
                width: thumb_w,
                height: thumb_h,
                content_type: "image/jpeg".to_string(),
                variant: ImageVariant::Thumbnail,
            });
        }

        // 3. Small (400x400)
        if width > 400 || height > 400 {
            let small = Self::create_thumbnail(&img, 400)?;
            let (small_w, small_h) = small.dimensions();
            let small_data = Self::to_jpeg(&small, 85)?;
            variants.push(ProcessedImage {
                data: small_data,
                width: small_w,
                height: small_h,
                content_type: "image/jpeg".to_string(),
                variant: ImageVariant::Small,
            });
        }

        // 4. Medium (800x800)
        if width > 800 || height > 800 {
            let medium = Self::create_thumbnail(&img, 800)?;
            let (medium_w, medium_h) = medium.dimensions();
            let medium_data = Self::to_jpeg(&medium, 85)?;
            variants.push(ProcessedImage {
                data: medium_data,
                width: medium_w,
                height: medium_h,
                content_type: "image/jpeg".to_string(),
                variant: ImageVariant::Medium,
            });
        }

        // 5. WebP version (original size, better compression)
        let webp_data = Self::to_webp(&img, 80.0)?;
        variants.push(ProcessedImage {
            data: webp_data,
            width,
            height,
            content_type: "image/webp".to_string(),
            variant: ImageVariant::WebP,
        });

        Ok(variants)
    }

    /// Get size reduction statistics
    pub fn calculate_savings(original_size: usize, variants: &[ProcessedImage]) -> String {
        let webp_size = variants
            .iter()
            .find(|v| matches!(v.variant, ImageVariant::WebP))
            .map(|v| v.data.len())
            .unwrap_or(0);

        let webp_savings = if webp_size > 0 {
            ((original_size as f64 - webp_size as f64) / original_size as f64 * 100.0) as i32
        } else {
            0
        };

        format!(
            "Original: {} KB, WebP: {} KB ({}% smaller)",
            original_size / 1024,
            webp_size / 1024,
            webp_savings
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_thumbnail_creation() {
        // Create a simple test image
        let img = DynamicImage::new_rgb8(1000, 800);
        let thumbnail = ImageProcessor::create_thumbnail(&img, 150).unwrap();
        let (w, h) = thumbnail.dimensions();
        
        assert!(w <= 150 && h <= 150);
        assert!(w == 150 || h == 150); // One dimension should be exactly 150
    }

    #[test]
    fn test_variant_string() {
        assert_eq!(ImageVariant::Thumbnail.to_string(), "thumbnail");
        assert_eq!(ImageVariant::WebP.to_string(), "webp");
    }
}
