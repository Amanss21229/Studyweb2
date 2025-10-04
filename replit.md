# AimAi - Your Personal AI Tutor

## Overview

**AimAi**, powered by Sansa Learn, is a premium full-stack web application that serves as an AI-powered tutor for NEET and JEE exam preparation. Students can ask questions through text, images, or audio, and receive detailed step-by-step solutions in multiple languages. The application maps questions to NCERT curriculum topics and provides relevant previous year question references.

**Core Purpose**: Provide personalized doubt-solving assistance for NEET/JEE students with multi-modal input support (text, image, audio) and multilingual explanations.

**Brand Identity**:
- Name: AimAi
- Tagline: Powered by Sansa Learn
- Mission: Your personal AI tutor for NEET & JEE
- Design: Premium golden-orange theme with dark/black backgrounds, featuring the Sansa Learn circuit tree logo
- Color Scheme: Golden (#C9943D, #D4A574) accents on dark backgrounds for a trusted, bold, and premium appearance

**Tech Stack**:
- Frontend: React with TypeScript, Vite build system
- Backend: Express.js with TypeScript
- Database: PostgreSQL (Replit Database)
- ORM: Drizzle
- UI: Shadcn/ui components with Radix UI primitives, Tailwind CSS
- AI: HuggingFace Inference API (Llama 3.1 models)
- OCR: Tesseract.js for image text extraction
- Authentication: Replit Auth (OpenID Connect)

## Setup Instructions

### Environment Variables

**Required (Manual Setup):**
- `HUGGINGFACE_API_KEY` - Get from [HuggingFace](https://huggingface.co/settings/tokens)
  - **IMPORTANT:** The application will run without this key, but AI-powered question answering will not work until you add it.

**Auto-configured in Replit:**
- `DATABASE_URL` - PostgreSQL connection string (auto-configured when database is created) ✓ Configured
- `SESSION_SECRET` - Session encryption key (auto-generated) ✓ Configured
- `REPL_ID`, `REPLIT_DOMAINS`, `ISSUER_URL` - Replit authentication config (auto-set) ✓ Auto-configured

### Initial Setup

✅ **Setup Status: Complete**

The application is ready to run in the Replit environment:

1. **Dependencies installed:** ✓ All npm packages are installed
2. **Database configured:** ✓ PostgreSQL database is provisioned and schema is pushed
3. **Workflow configured:** ✓ Development server runs on port 5000
4. **SSL configuration fixed:** ✓ Database connection works in Replit environment

### To Start Using:

1. **Set up HuggingFace API Key (Required for AI features):**
   - Get your API key from [HuggingFace](https://huggingface.co/settings/tokens)
   - Add to Replit Secrets: `HUGGINGFACE_API_KEY=your_key_here`
   - Restart the application after adding the key

2. **The app is already running:**
   - Frontend available at port 5000
   - Click the "Webview" tab to view the application

### Production Deployment

```bash
npm run build
npm start
```

### Features

- **Text Input**: Free for all users (120 minutes daily limit for guests)
- **Image Upload**: Requires login (uses OCR to extract questions from images)
- **Voice Input**: Requires login (converts speech to text for questions)
- **Multi-language Support**: English, Hindi, Hinglish, Bengali
- **Solution Sharing**: Each solution gets a unique shareable URL
- **Subject Tracking**: Automatic categorization into Physics, Chemistry, Math, Biology
- **NCERT Mapping**: Solutions mapped to specific chapters and topics
- **PYQ References**: Relevant NEET/JEE previous year questions

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Component Structure**:
- React-based SPA using functional components with hooks
- Wouter for lightweight client-side routing
- Component organization follows feature-based structure:
  - `/components` - Reusable UI components
  - `/components/ui` - Shadcn/ui base components
  - `/pages` - Route-level components
  - `/lib` - Utility functions and API client
  - `/hooks` - Custom React hooks

**State Management**:
- TanStack Query (React Query) for server state management
- Context API for global UI state (Theme, Language)
- Local component state for form inputs and UI interactions

**Styling Approach**:
- Tailwind CSS utility-first approach
- CSS custom properties for theming (light/dark mode)
- Shadcn/ui design system with neutral base color
- Custom gradient styles for branding

**Key Design Patterns**:
- Provider pattern for theme and language contexts
- Compound component pattern for UI elements
- Custom hooks for business logic encapsulation

### Backend Architecture

**API Design**:
- RESTful HTTP API using Express.js
- JSON request/response format
- Multipart form-data for file uploads
- Route handlers in `/server/routes.ts`

**Server Organization**:
- `/server/index.ts` - Application entry point and middleware setup
- `/server/routes.ts` - API route definitions
- `/server/db.ts` - Database connection configuration
- `/server/storage.ts` - Data access layer abstraction
- `/server/services/` - External service integrations (OpenAI, OCR)
- `/server/vite.ts` - Development server integration

**Middleware Stack**:
1. JSON body parser with raw body preservation (for webhooks if needed)
2. URL-encoded body parser
3. Request logging middleware
4. Vite development middleware (dev mode only)

**Data Access Layer**:
- Repository pattern via `IStorage` interface
- `DatabaseStorage` class implements CRUD operations
- Drizzle ORM for type-safe database queries
- Centralized database connection management

### Database Schema

**Tables**:

1. **users**
   - Stores user profiles and preferences
   - Fields: id, username, language, theme, createdAt
   - Language options: english, hindi, hinglish, bengali
   - Theme options: light, dark

2. **conversations**
   - Groups questions into study sessions
   - Fields: id, userId, title, createdAt, updatedAt
   - Allows guest usage (nullable userId)

3. **questions**
   - Stores student questions with metadata
   - Fields: id, conversationId, questionText, inputType, subject, chapter, topic, imageUrl, audioUrl, createdAt
   - Input types: text, image, audio
   - Subject categories: physics, chemistry, math, biology

4. **solutions**
   - Stores AI-generated solutions
   - Fields: id, questionId, solutionText, explanation, subject, chapter, topic, neetJeePyq (JSON), language, shareUrl, isPublic, createdAt
   - JSONB field for structured PYQ references
   - Shareable via unique URLs

**Relationships**:
- One-to-many: User → Conversations
- One-to-many: Conversation → Questions
- One-to-many: Question → Solutions

**Design Decisions**:
- UUID primary keys via `gen_random_uuid()` for distributed systems compatibility
- Nullable foreign keys to support guest/anonymous usage
- JSONB for flexible PYQ data structure
- Separate solutions table allows multiple AI-generated alternatives per question

### External Dependencies

**HuggingFace Inference API**:
- Models: Llama 3.1 70B Instruct (main solutions), Llama 3.1 8B Instruct (title generation)
- Purpose: Generate step-by-step solutions with NCERT curriculum mapping
- Response structure: JSON format with answer, subject, chapter, topic, and PYQ references
- Language-aware: System prompts specify output language (English, Hindi, Hinglish, Bengali)
- Guardrails: Only answers NEET/JEE-related academic questions
- Requires: `HUGGINGFACE_API_KEY` environment variable

**Tesseract.js OCR**:
- Purpose: Extract text from uploaded question images
- Supports English and Hindi language detection
- Handles handwritten and printed text
- Error handling for unclear images

**PostgreSQL Database**:
- Replit-managed PostgreSQL database
- WebSocket-based connection using `@neondatabase/serverless` driver
- Connection pooling for performance
- Requires `DATABASE_URL` environment variable (auto-configured)

**Session Management**:
- PostgreSQL-backed sessions using `connect-pg-simple`
- `sessions` table for persistent session storage
- Session TTL: 7 days
- Requires `SESSION_SECRET` environment variable (auto-configured)

**Replit Authentication**:
- OpenID Connect (OIDC) integration with Replit
- Passport.js strategy for authentication flow
- Automatic user profile sync to database
- Token refresh mechanism for extended sessions
- Requires: `REPL_ID`, `REPLIT_DOMAINS`, `ISSUER_URL` (auto-configured in Replit environment)

**File Upload**:
- Multer middleware for handling multipart/form-data
- In-memory storage with 10MB file size limit
- Image files stored in conversation context

**Additional Services**:
- Web Speech API for audio recording (client-side)
- Browser Clipboard API for copy functionality
- Browser MediaDevices API for microphone access

**Build & Development Tools**:
- Vite for frontend bundling and HMR
- esbuild for backend bundling (production)
- tsx for TypeScript execution (development)
- Drizzle Kit for database migrations
- Replit-specific plugins for development experience