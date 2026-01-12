# 📸 AI Image Sharing App — Feature List

## 1️⃣ Project & Environment Setup

- [x] Initialize Next.js app using App Router
- [x] Configure npm as package manager
- [x] Set up `.env` and `.env.example`
- [x] Add `.env` to `.gitignore`
- [x] Configure environment variables:
  - `DATABASE_URL` (Neon PostgreSQL, sslmode required)
  - `OPENAI_API_KEY`

---

## 2️⃣ Database & ORM (Prisma + Neon)

### Prisma Installation & Configuration

- [x] Install Prisma (`prisma@^7.2.0`) and `@prisma/client`
- [x] Install Neon adapter dependencies:
  - `@neondatabase/serverless`
  - `@prisma/adapter-neon`
  - `ws`
- [x] Configure `prisma.config.ts` to use Neon adapter
- [x] Enable connection pooling using Pool (not Client)
- [x] Configure WebSocket support for Node.js
- [x] Generate Prisma Client

### Database Schema: PublishedImage

- [x] Create Prisma model named `PublishedImage`
- [x] Fields:
  - `id`: auto-incrementing integer primary key
  - `imageUrl`: string (mapped to `image_url`)
  - `prompt`: string (required)
  - `hearts`: integer, default 0
  - `createdAt`: DateTime, default now() (mapped to `created_at`)
- [x] Map model to `published_images` table
- [x] Apply snake_case mappings at database level
- [x] Run migrations to create table

### Database Capabilities

- [x] Create published images
- [x] Read single image by ID
- [x] Read multiple images (feed)
- [x] Update image hearts
- [x] Delete images (optional/admin)
- [x] Count total images
- [x] Support pagination with skip and take
- [x] Order images by newest first

---

## 3️⃣ Backend API (Next.js API Routes)

### POST /api/generate

**Purpose:** Generate an AI image from a text prompt

- [x] Accept POST requests only
- [x] Validate prompt:
  - Required
  - Must be a non-empty string
- [x] Call OpenAI DALL·E 2 API
  - Model: `dall-e-2`
  - Image size: `512x512`
  - Generate 1 image
- [x] Extract `imageUrl` from OpenAI response
- [x] Return:
  ```json
  {
    "imageUrl": "https://...",
    "prompt": "..."
  }
  ```
- [x] Handle and log OpenAI errors gracefully

### POST /api/publish

**Purpose:** Save a generated image to the database

- [x] Accept POST requests only
- [x] Validate:
  - `imageUrl` (required, non-empty string)
  - `prompt` (required but may be empty string)
- [x] Persist image using Prisma
- [x] Use schema defaults for:
  - `hearts`
  - `createdAt`
- [x] Return full created object:
  ```json
  {
    "id": number,
    "imageUrl": string,
    "prompt": string,
    "hearts": number,
    "createdAt": string
  }
  ```
- [x] Handle and log database errors

### GET /api/feed

**Purpose:** Fetch paginated public image feed

- [x] Accept GET requests
- [x] Parse query params:
  - `page` (default: 1)
  - `limit` (default: 10, max: 50)
- [x] Validate pagination inputs
- [x] Calculate:
  - `skip = (page - 1) * limit`
  - `totalPages`
- [x] Fetch images ordered by newest first
- [x] Return:
  ```json
  {
    "images": [],
    "total": number,
    "page": number,
    "totalPages": number
  }
  ```
- [x] Handle empty database and out-of-range pages
- [x] Handle and log database errors

### PUT /api/feed

**Purpose:** Update heart count for an image

- [x] Accept PUT requests
- [x] Validate:
  - `id` (required number)
  - `hearts` (required non-negative integer)
- [x] Ensure image exists
- [x] Update hearts using atomic Prisma update
- [x] Return updated image object
- [x] Handle and log database errors

---

## 4️⃣ Frontend (Next.js App Router)

### Generate Page (app/page.js)

- [x] Prompt input (textarea or input)
- [x] Generate button triggers `/api/generate`
- [x] Loading state while generating
- [x] Disable button during request
- [x] Display generated image
- [x] Display prompt used
- [x] Show error messages if generation fails
- [x] Show Publish button after generation
- [x] Publish button calls `/api/publish`
- [x] Show success or error feedback

### Feed Page (app/feed/page.js)

- [x] Fetch images from `/api/feed`
- [x] Display images in grid or list
- [x] Each image shows:
  - Image
  - Prompt
  - Hearts count
  - Created date
- [x] Newest images shown first
- [x] Heart button per image
- [x] Clicking heart updates count via PUT `/api/feed`
- [x] Optimistic UI updates
- [x] Pagination controls (Load More or page numbers)
- [x] Loading state during pagination
- [x] Graceful handling of end-of-feed
- [x] Error handling for failed requests

---

## 5️⃣ Documentation

### README.md

- [x] Project overview
- [x] Tech stack
- [x] Setup instructions
- [x] Environment variable configuration
- [x] Common commands
- [x] API and architecture links
- [x] Troubleshooting section

### Architecture Diagram

- [x] Client (Next.js / React)
- [x] API routes
- [x] OpenAI DALL·E 2
- [x] Prisma ORM
- [x] Neon PostgreSQL
- [x] Data flow arrows
- [x] Saved in `docs/`

### Data Flow Documentation

- [x] Image generation flow
- [x] Publishing flow
- [x] Feed retrieval flow
- [x] Hearts update flow

### API Documentation

- [x] All 4 endpoints documented
- [x] Request/response examples
- [x] Validation rules
- [x] Status code explanations