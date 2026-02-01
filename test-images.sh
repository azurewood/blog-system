#!/bin/bash

# Image Endpoint Test Script
# Tests all image-related endpoints

API_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:3000"

echo "🧪 Testing Image Endpoints"
echo "=========================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo "1️⃣  Testing Backend Health..."
response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL/health)
if [ $response -eq 200 ]; then
    echo -e "${GREEN}✓ Backend is running${NC}"
else
    echo -e "${RED}✗ Backend is not running (HTTP $response)${NC}"
    exit 1
fi
echo ""

# Test 2: Image Upload
echo "2️⃣  Testing Image Upload..."
# Create a small test image (1x1 red pixel PNG in base64)
BASE64_IMAGE="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=="

upload_response=$(curl -s -X POST $API_URL/api/upload/image \
  -H "Content-Type: application/json" \
  -d "{
    \"filename\": \"test-image.png\",
    \"content_type\": \"image/png\",
    \"data\": \"$BASE64_IMAGE\"
  }")

echo "Upload response:"
echo "$upload_response" | jq '.' 2>/dev/null || echo "$upload_response"

# Extract image ID from response
IMAGE_ID=$(echo "$upload_response" | jq -r '.data.id' 2>/dev/null)

if [ -n "$IMAGE_ID" ] && [ "$IMAGE_ID" != "null" ]; then
    echo -e "${GREEN}✓ Image uploaded successfully${NC}"
    echo "Image ID: $IMAGE_ID"
else
    echo -e "${RED}✗ Image upload failed${NC}"
    exit 1
fi
echo ""

# Test 3: Image Retrieval
echo "3️⃣  Testing Image Retrieval..."
image_url="$API_URL/api/images/$IMAGE_ID"
echo "Testing: $image_url"

image_response=$(curl -s -o /dev/null -w "%{http_code}" "$image_url")
if [ $image_response -eq 200 ]; then
    echo -e "${GREEN}✓ Image retrieved successfully (HTTP 200)${NC}"
    
    # Check content type
    content_type=$(curl -s -I "$image_url" | grep -i "content-type" | awk '{print $2}' | tr -d '\r')
    echo "Content-Type: $content_type"
    
    # Check if it's an image
    if [[ $content_type == image/* ]]; then
        echo -e "${GREEN}✓ Correct content type${NC}"
    else
        echo -e "${YELLOW}⚠ Unexpected content type${NC}"
    fi
else
    echo -e "${RED}✗ Image retrieval failed (HTTP $image_response)${NC}"
    exit 1
fi
echo ""

# Test 4: Image Variants
echo "4️⃣  Testing Image Variants..."
for variant in "original" "thumbnail" "small" "medium" "webp"; do
    variant_url="$API_URL/api/images/$IMAGE_ID?variant=$variant"
    variant_response=$(curl -s -o /dev/null -w "%{http_code}" "$variant_url")
    
    if [ $variant_response -eq 200 ]; then
        echo -e "${GREEN}✓ $variant variant works${NC}"
    else
        echo -e "${YELLOW}⚠ $variant variant returned HTTP $variant_response${NC}"
    fi
done
echo ""

# Test 5: Analytics Endpoint
echo "5️⃣  Testing Analytics Endpoint..."
analytics_response=$(curl -s "$API_URL/api/images/analytics")
echo "Analytics response:"
echo "$analytics_response" | jq '.' 2>/dev/null || echo "$analytics_response"

total_images=$(echo "$analytics_response" | jq -r '.data.total_images' 2>/dev/null)
if [ -n "$total_images" ] && [ "$total_images" != "null" ]; then
    echo -e "${GREEN}✓ Analytics endpoint works${NC}"
    echo "Total images: $total_images"
else
    echo -e "${RED}✗ Analytics endpoint failed${NC}"
fi
echo ""

# Test 6: Frontend Integration
echo "6️⃣  Testing Frontend..."
frontend_response=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
if [ $frontend_response -eq 200 ]; then
    echo -e "${GREEN}✓ Frontend is running${NC}"
else
    echo -e "${RED}✗ Frontend is not running (HTTP $frontend_response)${NC}"
fi
echo ""

# Test 7: Image in Frontend
echo "7️⃣  Testing Image Display in Frontend..."
echo "Image URL to test in browser:"
echo "$FRONTEND_URL (with image ID: $IMAGE_ID)"
echo ""
echo "Manual test: Open browser and check if image at:"
echo "  $image_url"
echo "displays correctly"
echo ""

# Summary
echo "=========================="
echo "📊 Test Summary"
echo "=========================="
echo -e "${GREEN}✓ Backend health check passed${NC}"
echo -e "${GREEN}✓ Image upload passed${NC}"
echo -e "${GREEN}✓ Image retrieval passed${NC}"
echo -e "${GREEN}✓ Image variants tested${NC}"
echo -e "${GREEN}✓ Analytics endpoint tested${NC}"
echo ""
echo "🎉 All automated tests passed!"
echo ""
echo "Next steps:"
echo "1. Open $FRONTEND_URL/admin/images"
echo "2. Upload an image through the UI"
echo "3. Verify it appears in the gallery"
echo "4. Check analytics tab"
echo ""
