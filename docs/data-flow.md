# Data Flow Documentation

This document describes the data flow for each major feature in the application.

---

## 1. Image Generation Flow

### Overview
User provides a text prompt, which is sent to OpenAI's DALL·E 2 API to generate an image.

### Step-by-Step Flow

1. **User Input**
   - User types prompt in textarea on Generate Page
   - User clicks "Generate Image" button
   - Form validation checks prompt is non-empty

2. **Client-Side Processing**
   - `handleGenerate` function triggered
   - Loading state set to `true`
   - Previous errors/images cleared
   - Button disabled during request

3. **API Request**
   - `POST /api/generate` called with JSON body:
     ```json
     {
       "prompt": "a beautiful sunset over mountains"
     }
     ```

4. **Server-Side Validation** (`app/api/generate/route.js`)
   - Check prompt exists
   - Check prompt is a string
   - Check prompt is non-empty after trimming
   - Return 400 error if validation fails

5. **OpenAI API Call**
   - Initialize OpenAI client with API key
   - Call `openai.images.generate()` with:
     - Model: `dall-e-2`
     - Prompt: user's input (trimmed)
     - Size: `512x512`
     - N: `1` (one image)

6. **OpenAI Response**
   - Receives array of image objects
   - Extract URL from `response.data[0].url`
   - URL points to temporary OpenAI CDN location

7. **API Response**
   - Return JSON to client:
     ```json
     {
       "imageUrl": "https://oaidalleapiprodscus.blob...",
       "prompt": "a beautiful sunset over mountains"
     }
     ```

8. **Client-Side Display**
   - Loading state set to `false`
   - Image URL stored in `generatedImage` state
   - Image rendered in `<img>` tag
   - Prompt displayed in read-only field
   - "Publish to Gallery" button appears

9. **Error Handling**
   - Network errors caught and displayed
   - OpenAI API errors (401, 429) handled specifically
   - Generic fallback for other errors
   - Loading state always reset in `finally` block

### Data Structure

**Request:**
```typescript
{
  prompt: string  // Required, non-empty
}
```

**Success Response (200):**
```typescript
{
  imageUrl: string  // OpenAI CDN URL
  prompt: string    // Echo of input prompt
}
```

**Error Response (4xx/5xx):**
```typescript
{
  error: string  // Human-readable error message
}
```

---

## 2. Publishing Flow

### Overview
User publishes a generated image to the database for display in the public gallery.

### Step-by-Step Flow

1. **User Action**
   - User clicks "Publish to Gallery" button
   - Must have generated image available
   - Button disabled during publish

2. **Client-Side Processing**
   - `handlePublish` function triggered
   - Publishing state set to `true`
   - Previous errors/success messages cleared

3. **API Request**
   - `POST /api/publish` called with JSON body:
     ```json
     {
       "imageUrl": "https://oaidalleapiprodscus.blob...",
       "prompt": "a beautiful sunset over mountains"
     }
     ```

4. **Server-Side Validation** (`app/api/publish/route.js`)
   - Check `imageUrl` exists and is non-empty string
   - Check `prompt` exists and is a string (can be empty)
   - Return 400 error if validation fails

5. **Database Operation**
   - Prisma Client `create` operation
   - Insert into `published_images` table:
     ```sql
     INSERT INTO published_images (image_url, prompt, hearts, created_at)
     VALUES ($1, $2, 0, NOW())
     ```
   - Default values applied:
     - `hearts`: 0
     - `created_at`: current timestamp
     - `id`: auto-increment

6. **Database Response**
   - Returns created record with generated ID
   - Includes all fields with default values

7. **API Response**
   - Format timestamps as ISO strings
   - Return JSON to client:
     ```json
     {
       "id": 1,
       "imageUrl": "https://...",
       "prompt": "a beautiful sunset over mountains",
       "hearts": 0,
       "createdAt": "2026-01-12T10:30:00.000Z"
     }
     ```

8. **Client-Side Feedback**
   - Publishing state set to `false`
   - Success message displayed with green alert
   - Link to feed page provided
   - Button changes to "Published ✓"
   - Button disabled (can't publish twice)

9. **Error Handling**
   - Database errors caught and logged
   - User sees friendly error message
   - Publishing state reset to allow retry

### Data Structure

**Request:**
```typescript
{
  imageUrl: string  // Required, non-empty
  prompt: string    // Required (can be empty string)
}
```

**Success Response (200):**
```typescript
{
  id: number
  imageUrl: string
  prompt: string
  hearts: number        // Always 0 initially
  createdAt: string     // ISO 8601 format
}
```

**Error Response (4xx/5xx):**
```typescript
{
  error: string
}
```

---

## 3. Feed Retrieval Flow

### Overview
User views paginated gallery of all published images, sorted by newest first.

### Step-by-Step Flow

1. **Page Load**
   - Feed Page component mounts
   - `useEffect` hook triggers on mount
   - Initial loading state set to `true`

2. **Client-Side Preparation**
   - `fetchFeed(1)` called for page 1
   - Query parameters constructed: `?page=1&limit=12`

3. **API Request**
   - `GET /api/feed?page=1&limit=12`
   - No request body (GET request)

4. **Server-Side Parsing** (`app/api/feed/route.js`)
   - Extract `page` from query params (default: 1)
   - Extract `limit` from query params (default: 10)
   - Validate both are positive integers
   - Enforce max limit of 50
   - Invalid values fall back to defaults

5. **Pagination Calculation**
   - Calculate skip: `(page - 1) * limit`
     - Page 1: skip 0
     - Page 2: skip 12
     - Page 3: skip 24
   - Get total count from database

6. **Database Query**
   - Two Prisma operations:
     ```typescript
     // Count total records
     const total = await prisma.publishedImage.count()
     
     // Fetch page of results
     const images = await prisma.publishedImage.findMany({
       skip: (page - 1) * limit,
       take: limit,
       orderBy: { createdAt: 'desc' }
     })
     ```
   - Newest images first (DESC order)

7. **Database Response**
   - Array of image records
   - Each with id, imageUrl, prompt, hearts, createdAt
   - Empty array if no results

8. **API Response**
   - Calculate `totalPages = ceil(total / limit)`
   - Format timestamps as ISO strings
   - Return JSON:
     ```json
     {
       "images": [...],
       "total": 45,
       "page": 1,
       "totalPages": 4
     }
     ```

9. **Client-Side Display**
   - Loading state set to `false`
   - Images stored in state
   - Rendered in responsive grid (1-3 columns)
   - Each card shows:
     - Image
     - Prompt (truncated to 2 lines)
     - Heart count with button
     - Formatted date
   - "Load More" button if `page < totalPages`

10. **Load More Functionality**
    - User clicks "Load More"
    - `fetchFeed(page + 1, true)` called
    - `append=true` adds to existing images
    - Separate loading state for pagination
    - Images array grows with new results

11. **Edge Cases**
    - Empty database: Shows "No images yet" message
    - End of feed: Shows "You've reached the end" message
    - Out of range page: Returns empty images array
    - Network error: Displays error message

### Data Structure

**Request:**
```
GET /api/feed?page=1&limit=12
```

**Success Response (200):**
```typescript
{
  images: Array<{
    id: number
    imageUrl: string
    prompt: string
    hearts: number
    createdAt: string  // ISO 8601
  }>
  total: number        // Total count across all pages
  page: number         // Current page number
  totalPages: number   // Total pages available
}
```

**Error Response (5xx):**
```typescript
{
  error: string
}
```

---

## 4. Hearts Update Flow

### Overview
User likes an image, incrementing its heart count with optimistic UI updates.

### Step-by-Step Flow

1. **User Action**
   - User clicks heart button on image card
   - Current heart count passed to handler

2. **Optimistic UI Update**
   - Immediate state update (before API call)
   - New hearts = current hearts + 1
   - UI instantly reflects new count
   - Provides immediate feedback

3. **State Update**
   ```javascript
   setImages(prev => 
     prev.map(img => 
       img.id === imageId 
         ? { ...img, hearts: newHearts }
         : img
     )
   )
   ```

4. **API Request**
   - `PUT /api/feed` called with JSON body:
     ```json
     {
       "id": 5,
       "hearts": 11
     }
     ```

5. **Server-Side Validation** (`app/api/feed/route.js`)
   - Check `id` is a number and integer
   - Check `hearts` is a non-negative integer
   - Return 400 error if validation fails

6. **Database Operation**
   - Prisma atomic update:
     ```typescript
     const updatedImage = await prisma.publishedImage.update({
       where: { id },
       data: { hearts }
     })
     ```
   - Will throw `P2025` error if record not found
   - Update is atomic (safe for concurrent requests)

7. **Database Response**
   - Returns updated record
   - Includes all fields with new heart count

8. **API Response**
   - Format timestamp as ISO string
   - Return JSON:
     ```json
     {
       "id": 5,
       "imageUrl": "https://...",
       "prompt": "...",
       "hearts": 11,
       "createdAt": "2026-01-12T10:30:00.000Z"
     }
     ```
   - 404 response if image not found

9. **Client-Side Sync**
   - Update state with server response
   - Ensures consistency with database
   - Overwrites optimistic update

10. **Error Handling**
    - If API call fails:
      - Revert optimistic update
      - Restore original heart count
      - Log error to console
      - User sees count return to previous value
    - If 404:
      - Could show "Image no longer exists" message
      - Currently just reverts count

### Benefits of Optimistic Updates

- **Instant Feedback**: UI updates immediately
- **Better UX**: No waiting for network round-trip
- **Automatic Rollback**: Errors revert changes
- **Server Authority**: Final state from database

### Data Structure

**Request:**
```typescript
{
  id: number          // Required, positive integer
  hearts: number      // Required, non-negative integer
}
```

**Success Response (200):**
```typescript
{
  id: number
  imageUrl: string
  prompt: string
  hearts: number        // Updated value
  createdAt: string
}
```

**Error Response (404):**
```typescript
{
  error: "Image not found"
}
```

**Error Response (400):**
```typescript
{
  error: "id is required and must be a number"
  // or
  error: "hearts is required and must be a non-negative integer"
}
```

---

## Summary

All four flows demonstrate:
- **Clear separation of concerns** (client/API/database)
- **Comprehensive validation** (client and server-side)
- **Robust error handling** (try/catch, error states)
- **User feedback** (loading states, success/error messages)
- **Data consistency** (optimistic updates with rollback)
- **Type safety** (Prisma schema enforcement)
