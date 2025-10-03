# NEET JEE AI Tutor

## Overview

A full-stack web application that serves as an AI-powered tutor for NEET and JEE exam preparation. Students can ask questions through text, images, or audio, and receive detailed step-by-step solutions in multiple languages. The application maps questions to NCERT curriculum topics and provides relevant previous year question references.

**Core Purpose**: Provide personalized doubt-solving assistance for NEET/JEE students with multi-modal input support (text, image, audio) and multilingual explanations.

**Tech Stack**:
- Frontend: React with TypeScript, Vite build system
- Backend: Express.js with TypeScript
- Database: PostgreSQL via Neon (serverless)
- ORM: Drizzle
- UI: Shadcn/ui components with Radix UI primitives, Tailwind CSS
- AI: OpenAI API (GPT-5 model)
- OCR: Tesseract.js for image text extraction

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

**OpenAI API Integration**:
- Model: GPT-5 (configured in `/server/services/openai.ts`)
- Purpose: Generate step-by-step solutions with NCERT curriculum mapping
- Response structure: JSON format with answer, subject, chapter, topic, and PYQ references
- Language-aware: System prompts specify output language
- Guardrails: Only answers NEET/JEE-related academic questions

**Tesseract.js OCR**:
- Purpose: Extract text from uploaded question images
- Supports English and Hindi language detection
- Handles handwritten and printed text
- Error handling for unclear images

**Neon Database**:
- Serverless PostgreSQL database
- WebSocket-based connection using `@neondatabase/serverless`
- Connection pooling for performance
- Requires `DATABASE_URL` environment variable

**Session Management**:
- `connect-pg-simple` for PostgreSQL-backed sessions (referenced but not fully implemented in visible code)
- Future consideration for user authentication

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