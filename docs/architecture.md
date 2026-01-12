# System Architecture

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│                     (Next.js / React 19)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────┐      ┌─────────────────────────┐   │
│  │   Generate Page        │      │      Feed Page          │   │
│  │   (app/page.js)        │      │   (app/feed/page.js)    │   │
│  │                        │      │                         │   │
│  │  • Prompt Input        │      │  • Image Grid           │   │
│  │  • Generate Button     │      │  • Heart Buttons        │   │
│  │  • Image Display       │      │  • Pagination           │   │
│  │  • Publish Button      │      │  • Optimistic UI        │   │
│  └────────────────────────┘      └─────────────────────────┘   │
│           │                                    │                 │
└───────────┼────────────────────────────────────┼─────────────────┘
            │                                    │
            │ HTTP/JSON                          │ HTTP/JSON
            ▼                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API ROUTES LAYER                              │
│                  (Next.js API Routes)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │ POST /api/generate│  │ POST /api/publish│  │GET/PUT       │  │
│  │                  │  │                  │  │ /api/feed    │  │
│  │ • Validate prompt│  │ • Validate data  │  │              │  │
│  │ • Call OpenAI    │  │ • Save to DB     │  │• Fetch images│  │
│  │ • Return image   │  │ • Return saved   │  │• Update ❤️  │  │
│  └────────┬─────────┘  └────────┬─────────┘  └──────┬───────┘  │
│           │                     │                    │           │
└───────────┼─────────────────────┼────────────────────┼───────────┘
            │                     │                    │
            │                     │                    │
            │                     ▼                    ▼
            │            ┌─────────────────────────────────┐
            │            │      PRISMA ORM LAYER           │
            │            │    (lib/prisma.ts)              │
            │            │                                 │
            │            │  • Neon Adapter                │
            │            │  • Connection Pool             │
            │            │  • WebSocket Support           │
            │            │  • Query Builder               │
            │            └────────────┬────────────────────┘
            │                         │
            │                         │ SQL Queries
            │                         ▼
            │            ┌─────────────────────────────────┐
            │            │   DATABASE LAYER                │
            │            │   (Neon PostgreSQL)             │
            │            │                                 │
            │            │  published_images table:        │
            │            │  • id (PK)                      │
            │            │  • image_url                    │
            │            │  • prompt                       │
            │            │  • hearts                       │
            │            │  • created_at                   │
            │            └─────────────────────────────────┘
            │
            │ HTTPS API Call
            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                   ┌──────────────────────┐                      │
│                   │   OpenAI DALL·E 2    │                      │
│                   │                      │                      │
│                   │  • Model: dall-e-2   │                      │
│                   │  • Size: 512x512     │                      │
│                   │  • Returns: Image URL│                      │
│                   └──────────────────────┘                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Overview

### Client Layer (Frontend)
- **Framework**: Next.js 16 with React 19
- **Rendering**: Client-side components (`'use client'`)
- **State Management**: React hooks (useState, useEffect)
- **Styling**: Tailwind CSS with responsive design
- **Navigation**: Next.js Link component

### API Routes Layer (Backend)
- **Runtime**: Node.js via Next.js serverless functions
- **Routes**:
  - `POST /api/generate` - Image generation endpoint
  - `POST /api/publish` - Image persistence endpoint
  - `GET /api/feed` - Feed retrieval with pagination
  - `PUT /api/feed` - Heart count updates

### Data Access Layer (ORM)
- **ORM**: Prisma Client 6.19.1
- **Adapter**: @prisma/adapter-neon for Neon PostgreSQL
- **Connection**: Pooled connections for performance
- **Transport**: WebSocket for serverless optimization

### Database Layer
- **Database**: PostgreSQL (via Neon serverless)
- **Schema**: Single table (`published_images`)
- **Features**: Auto-increment IDs, timestamps, default values
- **Naming**: Snake_case in DB, camelCase in application

### External Services
- **OpenAI API**: DALL·E 2 model for image generation
- **Authentication**: API key in request headers
- **Response**: Temporary image URLs (expire after some time)

---

## Data Flow Arrows

### Generation Flow
```
User Input → Generate Page → POST /api/generate → OpenAI API
                                      ↓
                                  Image URL
                                      ↓
                              Generate Page Display
```

### Publishing Flow
```
Publish Button → POST /api/publish → Prisma Client → PostgreSQL
                                          ↓
                                   Saved Record
                                          ↓
                                  Success Message
```

### Feed Flow
```
Feed Page Load → GET /api/feed → Prisma Client → PostgreSQL
                                       ↓
                                 Image Array
                                       ↓
                                  Grid Display
```

### Heart Flow
```
Heart Click → Optimistic Update → PUT /api/feed → Prisma Client → PostgreSQL
                    ↓                                  ↓
              UI Updates                         Server Sync
                                                       ↓
                                              Rollback if Error
```

---

## Key Design Decisions

### 1. Next.js App Router
- Modern routing approach
- Simplified API routes
- Better performance with RSC support
- File-based routing convention

### 2. Prisma with Neon Adapter
- Type-safe database queries
- Automatic migrations
- Serverless-optimized connections
- Connection pooling for performance

### 3. Client-Side Rendering for Interactive Pages
- Real-time UI updates
- Optimistic updates for better UX
- State management with React hooks
- Fast client-side navigation

### 4. RESTful API Design
- Clear endpoint purposes
- Standard HTTP methods
- JSON request/response format
- Proper status codes

### 5. Optimistic UI Updates
- Immediate user feedback
- Automatic rollback on errors
- Better perceived performance
- Enhanced user experience

---

## Scalability Considerations

### Current Architecture
- Serverless functions (auto-scaling)
- Connection pooling (handles concurrent requests)
- Paginated queries (efficient data loading)
- Optimized images (512x512 fixed size)

### Potential Improvements
- Image CDN for faster loading
- Caching layer (Redis) for feed
- Rate limiting for API endpoints
- Image thumbnail generation
- Full-text search for prompts
- User authentication system
- Image moderation/filtering

---

## Security Measures

### Implemented
- Environment variable isolation
- Input validation on all endpoints
- SQL injection prevention (Prisma parameterization)
- Type checking (implicit via Prisma)
- Error message sanitization

### Future Considerations
- Rate limiting per IP
- Content moderation for prompts
- CORS configuration
- API key rotation
- Request authentication
- Image content filtering
