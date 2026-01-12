# API Documentation

Complete documentation for all API endpoints in the AI Image Sharing App.

---

## Base URL

```
http://localhost:3000/api
```

---

## Endpoints Overview

| Method | Endpoint       | Purpose                          |
|--------|---------------|----------------------------------|
| POST   | `/generate`   | Generate AI image from prompt    |
| POST   | `/publish`    | Save image to database          |
| GET    | `/feed`       | Fetch paginated image feed      |
| PUT    | `/feed`       | Update image heart count        |

---

## 1. POST /api/generate

Generate an AI image using OpenAI's DALL·E 2 API.

### Request

**Method:** `POST`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "prompt": "a beautiful sunset over mountains"
}
```

**Parameters:**

| Field   | Type   | Required | Description                           |
|---------|--------|----------|---------------------------------------|
| prompt  | string | Yes      | Text description of image to generate |

### Validation Rules

- `prompt` must be present
- `prompt` must be a string
- `prompt` cannot be empty or only whitespace
- Whitespace is automatically trimmed

### Success Response

**Status Code:** `200 OK`

**Body:**
```json
{
  "imageUrl": "https://oaidalleapiprodscus.blob.core.windows.net/...",
  "prompt": "a beautiful sunset over mountains"
}
```

**Fields:**

| Field     | Type   | Description                          |
|-----------|--------|--------------------------------------|
| imageUrl  | string | Temporary URL to generated image     |
| prompt    | string | Echo of the input prompt (trimmed)   |

### Error Responses

**400 Bad Request** - Invalid prompt
```json
{
  "error": "Prompt is required and must be a non-empty string"
}
```

**401 Unauthorized** - Invalid OpenAI API key
```json
{
  "error": "Invalid OpenAI API key"
}
```

**429 Too Many Requests** - Rate limit exceeded
```json
{
  "error": "Rate limit exceeded. Please try again later."
}
```

**500 Internal Server Error** - OpenAI or server error
```json
{
  "error": "Failed to generate image"
}
```

### Status Codes

| Code | Meaning                                    |
|------|--------------------------------------------|
| 200  | Image generated successfully               |
| 400  | Invalid request (missing/empty prompt)     |
| 401  | OpenAI API key invalid or missing          |
| 429  | OpenAI rate limit exceeded                 |
| 500  | Server error or OpenAI API error           |

### Example Usage

**cURL:**
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "a beautiful sunset over mountains"}'
```

**JavaScript (fetch):**
```javascript
const response = await fetch('/api/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: 'a beautiful sunset over mountains'
  })
});

const data = await response.json();
console.log(data.imageUrl);
```

### Notes

- Image URLs from OpenAI are temporary and expire
- Image size is fixed at 512x512 pixels
- Model used is DALL·E 2
- Generation typically takes 5-15 seconds

---

## 2. POST /api/publish

Save a generated image to the database for public display.

### Request

**Method:** `POST`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "imageUrl": "https://oaidalleapiprodscus.blob.core.windows.net/...",
  "prompt": "a beautiful sunset over mountains"
}
```

**Parameters:**

| Field     | Type   | Required | Description                      |
|-----------|--------|----------|----------------------------------|
| imageUrl  | string | Yes      | URL of the generated image       |
| prompt    | string | Yes      | Prompt used (can be empty string)|

### Validation Rules

- `imageUrl` must be present
- `imageUrl` must be a string
- `imageUrl` cannot be empty or only whitespace
- `prompt` must be present
- `prompt` must be a string
- `prompt` can be an empty string (but not null/undefined)
- Whitespace in `imageUrl` is automatically trimmed

### Success Response

**Status Code:** `200 OK`

**Body:**
```json
{
  "id": 42,
  "imageUrl": "https://oaidalleapiprodscus.blob.core.windows.net/...",
  "prompt": "a beautiful sunset over mountains",
  "hearts": 0,
  "createdAt": "2026-01-12T15:30:00.000Z"
}
```

**Fields:**

| Field      | Type   | Description                           |
|------------|--------|---------------------------------------|
| id         | number | Auto-generated unique identifier      |
| imageUrl   | string | URL of the image                      |
| prompt     | string | Prompt used to generate image         |
| hearts     | number | Like count (always 0 initially)       |
| createdAt  | string | ISO 8601 timestamp of creation        |

### Error Responses

**400 Bad Request** - Invalid imageUrl
```json
{
  "error": "imageUrl is required and must be a non-empty string"
}
```

**400 Bad Request** - Invalid prompt
```json
{
  "error": "prompt is required and must be a string"
}
```

**500 Internal Server Error** - Database error
```json
{
  "error": "Failed to publish image"
}
```

### Status Codes

| Code | Meaning                                    |
|------|--------------------------------------------|
| 200  | Image published successfully               |
| 400  | Invalid request (missing/invalid fields)   |
| 500  | Database or server error                   |

### Example Usage

**cURL:**
```bash
curl -X POST http://localhost:3000/api/publish \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://oaidalleapiprodscus.blob.core.windows.net/...",
    "prompt": "a beautiful sunset over mountains"
  }'
```

**JavaScript (fetch):**
```javascript
const response = await fetch('/api/publish', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    imageUrl: generatedImage.imageUrl,
    prompt: generatedImage.prompt
  })
});

const data = await response.json();
console.log('Published with ID:', data.id);
```

### Notes

- Each publish creates a new database record
- Default values are set automatically (hearts, createdAt)
- ID is auto-incremented
- Same image can be published multiple times (creates duplicates)

---

## 3. GET /api/feed

Fetch a paginated list of published images, sorted by newest first.

### Request

**Method:** `GET`

**Query Parameters:**

| Parameter | Type   | Required | Default | Description                    |
|-----------|--------|----------|---------|--------------------------------|
| page      | number | No       | 1       | Page number (1-indexed)        |
| limit     | number | No       | 10      | Items per page (max 50)        |

**URL Examples:**
```
/api/feed
/api/feed?page=1
/api/feed?page=2&limit=20
/api/feed?limit=12
```

### Validation Rules

- `page` must be a positive integer (defaults to 1 if invalid)
- `limit` must be a positive integer (defaults to 10 if invalid)
- `limit` is capped at 50 (values > 50 are set to 50)
- Invalid values fall back to defaults instead of erroring

### Success Response

**Status Code:** `200 OK`

**Body:**
```json
{
  "images": [
    {
      "id": 42,
      "imageUrl": "https://...",
      "prompt": "a beautiful sunset over mountains",
      "hearts": 5,
      "createdAt": "2026-01-12T15:30:00.000Z"
    },
    {
      "id": 41,
      "imageUrl": "https://...",
      "prompt": "a serene lake at dawn",
      "hearts": 3,
      "createdAt": "2026-01-12T14:20:00.000Z"
    }
  ],
  "total": 100,
  "page": 1,
  "totalPages": 10
}
```

**Fields:**

| Field      | Type   | Description                              |
|------------|--------|------------------------------------------|
| images     | array  | Array of image objects                   |
| total      | number | Total count of images in database        |
| page       | number | Current page number                      |
| totalPages | number | Total number of pages available          |

**Image Object:**

| Field      | Type   | Description                           |
|------------|--------|---------------------------------------|
| id         | number | Unique identifier                     |
| imageUrl   | string | URL of the image                      |
| prompt     | string | Prompt used to generate image         |
| hearts     | number | Current like count                    |
| createdAt  | string | ISO 8601 timestamp                    |

### Error Responses

**500 Internal Server Error** - Database error
```json
{
  "error": "Failed to fetch feed"
}
```

### Status Codes

| Code | Meaning                                    |
|------|--------------------------------------------|
| 200  | Feed retrieved successfully                |
| 500  | Database or server error                   |

### Example Usage

**cURL:**
```bash
curl http://localhost:3000/api/feed?page=1&limit=12
```

**JavaScript (fetch):**
```javascript
const response = await fetch('/api/feed?page=1&limit=12');
const data = await response.json();

console.log(`Showing ${data.images.length} of ${data.total} images`);
console.log(`Page ${data.page} of ${data.totalPages}`);
```

### Pagination Logic

```
skip = (page - 1) * limit
totalPages = Math.ceil(total / limit)

Examples:
- Page 1, limit 10: skip 0, take 10
- Page 2, limit 10: skip 10, take 10
- Page 3, limit 20: skip 40, take 20
```

### Edge Cases

- **Empty database**: Returns `images: []`, `total: 0`, `totalPages: 1`
- **Out of range page**: Returns `images: []` with correct pagination info
- **Last page with partial results**: Returns fewer images than limit
- **Invalid params**: Falls back to defaults, never errors

### Notes

- Images are always sorted by `createdAt DESC` (newest first)
- Pagination is 1-indexed (page 1 is first page)
- Maximum limit enforced server-side for performance
- Total count includes all images, not just current page

---

## 4. PUT /api/feed

Update the heart count for a specific image.

### Request

**Method:** `PUT`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "id": 42,
  "hearts": 6
}
```

**Parameters:**

| Field  | Type   | Required | Description                        |
|--------|--------|----------|------------------------------------|
| id     | number | Yes      | ID of image to update              |
| hearts | number | Yes      | New heart count (non-negative)     |

### Validation Rules

- `id` must be present
- `id` must be a number
- `id` must be an integer
- `hearts` must be present
- `hearts` must be a number
- `hearts` must be an integer
- `hearts` must be >= 0 (non-negative)

### Success Response

**Status Code:** `200 OK`

**Body:**
```json
{
  "id": 42,
  "imageUrl": "https://...",
  "prompt": "a beautiful sunset over mountains",
  "hearts": 6,
  "createdAt": "2026-01-12T15:30:00.000Z"
}
```

**Fields:**

| Field      | Type   | Description                           |
|------------|--------|---------------------------------------|
| id         | number | Image identifier                      |
| imageUrl   | string | URL of the image                      |
| prompt     | string | Prompt used                           |
| hearts     | number | Updated heart count                   |
| createdAt  | string | ISO 8601 timestamp                    |

### Error Responses

**400 Bad Request** - Invalid id
```json
{
  "error": "id is required and must be a number"
}
```

**400 Bad Request** - Invalid hearts
```json
{
  "error": "hearts is required and must be a non-negative integer"
}
```

**404 Not Found** - Image doesn't exist
```json
{
  "error": "Image not found"
}
```

**500 Internal Server Error** - Database error
```json
{
  "error": "Failed to update hearts"
}
```

### Status Codes

| Code | Meaning                                    |
|------|--------------------------------------------|
| 200  | Hearts updated successfully                |
| 400  | Invalid request (missing/invalid fields)   |
| 404  | Image with given ID doesn't exist          |
| 500  | Database or server error                   |

### Example Usage

**cURL:**
```bash
curl -X PUT http://localhost:3000/api/feed \
  -H "Content-Type: application/json" \
  -d '{"id": 42, "hearts": 6}'
```

**JavaScript (fetch):**
```javascript
const response = await fetch('/api/feed', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    id: 42,
    hearts: currentHearts + 1
  })
});

const updatedImage = await response.json();
console.log('New heart count:', updatedImage.hearts);
```

### Atomic Update

The update operation is atomic in Prisma:
```typescript
await prisma.publishedImage.update({
  where: { id },
  data: { hearts }
})
```

This ensures:
- Only one update succeeds in concurrent requests
- No race conditions
- Data consistency maintained

### Notes

- Update is atomic (safe for concurrent requests)
- Typically used to increment hearts: `hearts: currentHearts + 1`
- Can also be used to decrement or set to specific value
- Frontend implements optimistic updates for better UX
- If update fails, frontend reverts optimistic change

---

## Common Patterns

### Error Handling

All endpoints follow this pattern:
```javascript
try {
  // Validation
  if (!valid) {
    return NextResponse.json({ error: 'message' }, { status: 400 });
  }
  
  // Business logic
  const result = await operation();
  
  // Success response
  return NextResponse.json(result);
  
} catch (error) {
  console.error('Context:', error);
  return NextResponse.json(
    { error: error.message || 'Generic message' },
    { status: 500 }
  );
}
```

### Response Format

Success responses contain data directly:
```json
{
  "field1": "value",
  "field2": 123
}
```

Error responses always have an `error` field:
```json
{
  "error": "Description of what went wrong"
}
```

### Date Formatting

All timestamps are returned as ISO 8601 strings:
```javascript
createdAt: date.toISOString()
// "2026-01-12T15:30:00.000Z"
```

---

## Rate Limiting

Currently, there is no rate limiting implemented. Consider adding:
- Per-IP rate limiting
- Per-endpoint rate limiting
- OpenAI API rate limit handling
- Cost tracking for OpenAI usage

---

## Authentication

Currently, there is no authentication. All endpoints are public. Future considerations:
- User accounts
- API keys
- JWT tokens
- Session management
- Image ownership

---

## Testing

Example test cases for each endpoint:

### POST /api/generate
- ✓ Valid prompt returns image URL
- ✓ Empty prompt returns 400
- ✓ Missing prompt returns 400
- ✓ Invalid API key returns 401
- ✓ Network error returns 500

### POST /api/publish
- ✓ Valid data creates record
- ✓ Missing imageUrl returns 400
- ✓ Empty imageUrl returns 400
- ✓ Missing prompt returns 400
- ✓ Database error returns 500

### GET /api/feed
- ✓ No params returns page 1 with default limit
- ✓ Custom page and limit work
- ✓ Invalid params fallback to defaults
- ✓ Empty database returns empty array
- ✓ Out of range page returns empty array
- ✓ Images sorted by newest first

### PUT /api/feed
- ✓ Valid update changes hearts
- ✓ Invalid ID returns 400
- ✓ Negative hearts returns 400
- ✓ Non-existent image returns 404
- ✓ Concurrent updates handled correctly
