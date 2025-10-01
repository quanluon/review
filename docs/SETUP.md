# Review App - Setup Guide

A mobile-first social review app built with Next.js, Supabase, and shadcn/ui.

## 🏗️ Architecture

This app is built with **modular separation** between frontend and backend, making it easy to scale and potentially separate into microservices later.

### Project Structure

```
/Users/quill/Workspace/work-space/review/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── (auth)/              # Authentication pages (login/signup)
│   │   ├── api/                 # 🔴 BACKEND: API routes (REST endpoints)
│   │   └── app/                 # Protected app pages
│   ├── components/              # 🟢 FRONTEND: React components
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── auth/                # Authentication forms
│   │   ├── places/              # Place-related components
│   │   ├── reviews/             # Review-related components
│   │   └── layout/              # Layout components
│   ├── hooks/                   # 🟢 FRONTEND: Custom React hooks
│   ├── lib/
│   │   ├── db/                  # 🔴 BACKEND: Database operations
│   │   ├── supabase/            # Supabase client utilities
│   │   └── utils.ts             # Utility functions
│   ├── types/                   # TypeScript type definitions
│   └── middleware.ts            # Next.js middleware (auth)
├── supabase/
│   └── migrations/              # Database migration files
└── public/                      # Static assets
```

### Backend (Can be extracted to separate service)

- **API Routes** (`src/app/api/`): REST endpoints
  - `/api/auth/*` - Authentication
  - `/api/places` - Place CRUD operations
  - `/api/reviews` - Review CRUD operations
  
- **Database Layer** (`src/lib/db/`): Business logic
  - `places.ts` - Place operations
  - `reviews.ts` - Review operations
  - `users.ts` - User operations

### Frontend (React/Next.js)

- **Hooks** (`src/hooks/`): Data fetching and state management
  - `use-auth.ts` - Authentication state
  - `use-places.ts` - Places data
  - `use-reviews.ts` - Reviews data

- **Components** (`src/components/`): UI components using shadcn/ui

## 🚀 Getting Started

### 1. Prerequisites

- Node.js 18+ and npm
- A Supabase account ([signup free](https://supabase.com))

### 2. Set up Supabase Project

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy your:
   - Project URL
   - `anon` public key
   - `service_role` secret key

### 3. Run Database Migration

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link to your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. Push the migration:
   ```bash
   supabase db push
   ```

   Or manually run the SQL in `supabase/migrations/20241001000001_initial_schema.sql` in the Supabase SQL Editor.

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
   
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. Generate `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

### 5. Install Dependencies

```bash
npm install
```

### 6. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📱 Features

### ✅ Implemented

- **Authentication**: 
  - Email/password signup with email verification
  - Social auth (Google, GitHub)
  - OAuth callback handling
- **Places Management**:
  - View all places
  - Search places by name/address
  - Filter by type (restaurant, cafe, bar, etc.)
  - Create new places
  - View place details with reviews
  
- **Reviews**:
  - Create reviews with 1-5 star rating
  - Add text reviews
  - View all reviews (feed)
  - View reviews by place
  
- **Mobile-First Design**: Optimized for mobile with bottom navigation
- **PWA Ready**: Service worker configured with Serwist

### 🔮 Future Features

- [ ] Review images upload (Supabase Storage)
- [ ] User profiles
- [ ] Follow/unfollow users
- [ ] Personalized feed (reviews from followed users)
- [ ] Comments on reviews
- [ ] Real-time updates (Supabase Realtime)
- [ ] Push notifications for new reviews
- [ ] Geolocation for nearby places
- [ ] Maps integration

## 🎨 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI**: shadcn/ui + Tailwind CSS
- **PWA**: Serwist
- **TypeScript**: Full type safety

## 📊 Database Schema

```
Users (extends Supabase auth.users)
├── id (PK, FK to auth.users)
├── name
├── email
└── avatar_url

Places
├── id (PK)
├── name
├── address
├── type (restaurant, cafe, etc.)
├── lat, lng
├── avg_rating (auto-calculated)
└── review_count (auto-calculated)

Reviews
├── id (PK)
├── user_id (FK → Users)
├── place_id (FK → Places)
├── rating (1-5)
└── text

ReviewImages
├── id (PK)
├── review_id (FK → Reviews)
└── image_url

Comments
├── id (PK)
├── review_id (FK → Reviews)
├── user_id (FK → Users)
└── text

Follows
├── follower_id (FK → Users)
└── following_id (FK → Users)
```

## 🔐 Row Level Security (RLS)

All tables have RLS enabled with policies:

- **Public read** for all content
- **Authenticated write** (users can only modify their own data)
- Automatic triggers for:
  - Calculating average ratings
  - Updating timestamps
  - Creating user profiles on signup

## 🚀 Deployment

### Vercel (Recommended for Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

### Supabase (Database & Auth)

- Already hosted on Supabase
- Free tier includes:
  - 500MB database
  - 1GB file storage
  - 50,000 monthly active users

### Environment Variables for Production

Add these in Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=...
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## 🔧 Development

### Add a new shadcn/ui component

```bash
npx shadcn@latest add [component-name]
```

### Database changes

1. Create a new migration file in `supabase/migrations/`
2. Run: `supabase db push`

### Type generation

After database changes, regenerate types:

```bash
supabase gen types typescript --local > src/types/supabase.ts
```

## 📝 API Routes

All API routes follow REST conventions:

- `GET /api/places` - List places
- `POST /api/places` - Create place
- `GET /api/places/[id]` - Get place details
- `PATCH /api/places/[id]` - Update place

- `GET /api/reviews` - List reviews
- `POST /api/reviews` - Create review

- `POST /api/auth/signup` - Register
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout

## 🎯 Scaling to Separate Backend

When ready to separate backend:

1. **Extract API layer**:
   - Move `src/app/api/` to a new Express/Fastify server
   - Move `src/lib/db/` to the new server
   
2. **Update frontend**:
   - Change `fetch("/api/...")` to `fetch("https://api.yourdomain.com/...")`
   - Add CORS configuration

3. **Deploy separately**:
   - Frontend: Vercel/Netlify
   - Backend: Railway/Render/AWS

## 📄 License

MIT

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

