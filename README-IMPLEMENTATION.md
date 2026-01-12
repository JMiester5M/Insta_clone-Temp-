# 📸 AI Image Sharing App - Implementation Guide

A full-stack Next.js application that generates AI images using OpenAI's DALL·E 2 API and allows users to share them in a community gallery with interactive features.

---

## 🎯 Project Overview

This application enables users to:
- Generate unique AI images from text prompts using DALL·E 2
- Publish generated images to a public gallery
- Browse and interact with community-generated images
- Like images with an optimistic UI heart system
- View paginated feeds with newest images first

Built with modern web technologies and best practices for full-stack development.

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16.1.1** (App Router) - React framework
- **React 19.2.3** - UI library
- **Tailwind CSS 4** - Styling
- **Client-side state management** - React hooks

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM 6.19.1** - Database toolkit
- **Neon PostgreSQL** - Serverless database
- **OpenAI SDK** - DALL·E 2 integration

### Database & ORM
- **PostgreSQL** via Neon (serverless, connection pooling)
- **Prisma Client** with Neon adapter
- **WebSocket support** for optimal performance

### AI Service
- **OpenAI DALL·E 2** - Image generation model
- **512x512 resolution** images

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ installed
- npm package manager
- OpenAI API account with DALL·E access
- Neon PostgreSQL database account

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd "Insta Clone"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variable Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration (Neon PostgreSQL)
DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require"

# OpenAI API Configuration
OPENAI_API_KEY="sk-..."
```

**Important Notes:**
- The `DATABASE_URL` must include `?sslmode=require` for Neon
- Get your Neon database URL from https://neon.tech
- Get your OpenAI API key from https://platform.openai.com/api-keys
- Never commit the `.env` file to version control

### 4. Set Up the Database

Generate Prisma Client and run migrations:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Run the Development Server

```bash
npm run dev
```

The app will be available at http://localhost:3000

---

## 📦 Common Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database
```bash
npx prisma generate           # Generate Prisma Client
npx prisma migrate dev        # Run migrations in development
npx prisma migrate deploy     # Run migrations in production
npx prisma studio             # Open Prisma Studio (database GUI)
```

---

## 📐 Architecture & API

### Architecture
See [docs/architecture.md](docs/architecture.md) for a visual architecture diagram and system overview.

### Data Flow
See [docs/data-flow.md](docs/data-flow.md) for detailed explanations of:
- Image generation flow
- Publishing flow
- Feed retrieval flow
- Hearts update flow

### API Documentation
See [docs/api.md](docs/api.md) for complete API endpoint documentation including:
- Request/response formats
- Validation rules
- Status codes
- Error handling

---

## 🔧 Troubleshooting

### Database Connection Issues

**Problem**: `Can't reach database server`
- **Solution**: Verify DATABASE_URL includes `?sslmode=require`
- Check your Neon database is active and accessible
- Ensure network connectivity

### OpenAI API Errors

**Problem**: `Invalid API key` or `401 Unauthorized`
- **Solution**: Verify OPENAI_API_KEY is correctly set in `.env`
- Check your API key is valid at https://platform.openai.com
- Ensure you have DALL·E 2 API access enabled

**Problem**: `Rate limit exceeded`
- **Solution**: Wait before making more requests
- Consider implementing request throttling
- Check your OpenAI usage limits

### Prisma Issues

**Problem**: `@prisma/client did not initialize yet`
- **Solution**: Run `npx prisma generate`
- Restart your development server

**Problem**: Migration failures
- **Solution**: Check database connectivity
- Verify DATABASE_URL is correct
- Try `npx prisma migrate reset` (warning: deletes all data)

### Build/Runtime Errors

**Problem**: Module not found or import errors
- **Solution**: Delete `node_modules` and `.next` folders
- Run `npm install` again
- Restart dev server

---

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── generate/
│   │   │   └── route.js       # POST - Generate AI images
│   │   ├── publish/
│   │   │   └── route.js       # POST - Save images to DB
│   │   └── feed/
│   │       └── route.js       # GET/PUT - Fetch feed & update hearts
│   ├── feed/
│   │   └── page.js            # Feed/gallery page
│   ├── layout.js              # Root layout
│   ├── page.js                # Generate page (home)
│   └── globals.css            # Global styles
├── docs/
│   ├── architecture.md        # System architecture diagram
│   ├── data-flow.md          # Data flow documentation
│   └── api.md                # API endpoint documentation
├── lib/
│   └── prisma.ts             # Prisma client configuration
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Database migrations
├── .env                      # Environment variables (not in git)
├── .env.example              # Environment template
├── package.json              # Dependencies
└── README.md                 # This file
```

---

## 🎨 Features

### Image Generation
- Text-to-image using DALL·E 2
- 512x512 resolution
- Real-time generation feedback
- Error handling with user-friendly messages

### Publishing System
- One-click publish to gallery
- Automatic metadata storage
- Success confirmation

### Gallery/Feed
- Responsive grid layout (1-3 columns)
- Paginated results (12 images per page)
- Newest images first
- Load more functionality

### Interactive Features
- Heart/like system with optimistic updates
- Automatic rollback on errors
- Real-time UI updates
- Total heart counts per image

---

## 🔐 Security Notes

- Never commit `.env` file
- API keys should be kept secret
- Database URL contains credentials
- Use environment variables for all secrets
- Validate all user inputs
- Sanitize database queries (Prisma handles this)

---

## 📄 License

This project is for educational purposes.

---

## 🤝 Contributing

This is a learning project. Feel free to fork and experiment!

---

## 📞 Support

For issues or questions:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Review [API Documentation](docs/api.md)
3. Check [Data Flow](docs/data-flow.md) for logic understanding
