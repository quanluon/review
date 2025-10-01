# 🌟 Review App - Social Review Platform

A mobile-first social review app similar to Locket/Threads, built with Next.js, Supabase, and modern web technologies.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![PWA](https://img.shields.io/badge/PWA-Ready-purple)

---

## ✨ Features

### 🔐 Authentication
- Email/password with verification
- Google & GitHub OAuth
- Public browsing (no login to view)
- Auto user synchronization

### 📍 Places
- Browse all places
- **Search** by name/address
- **Filter** by type (restaurant, cafe, bar, etc.)
- **Sort** by rating, date, review count
- Trending algorithm
- Auto-calculated ratings

### ⭐ Reviews
- 1-5 star ratings
- **Upload up to 4 images** 📸
- Text reviews (optional)
- **Realtime updates** 🔴 (live feed)
- View by place or user

### 📱 Mobile-First
- Responsive design
- Bottom navigation
- Touch-optimized
- PWA ready (offline support)

---

## 🚀 Quick Start

### 1. Install
```bash
npm install
```

### 2. Configure Supabase

Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Migrations

Go to **Supabase Dashboard → SQL Editor** and run:
1. `supabase/migrations/20241001000001_initial_schema.sql`
2. `supabase/migrations/20241001000002_fix_users_insert_policy.sql`
3. `supabase/migrations/20241001000003_storage_setup.sql`

### 4. Create Storage Bucket

**Dashboard → Storage:**
- Create bucket: `review-images`
- Make it **public**

### 5. Enable Realtime

**Dashboard → Database → Replication:**
- Toggle **ON** for `reviews` table

### 6. Run App

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 📖 Documentation

| Guide | Description |
|-------|-------------|
| [QUICK_START.md](./QUICK_START.md) | 5-minute setup |
| [SETUP.md](./SETUP.md) | Full architecture |
| [AUTHENTICATION.md](./AUTHENTICATION.md) | OAuth setup |
| [SETUP_NEW_FEATURES.md](./SETUP_NEW_FEATURES.md) | Image upload & realtime |
| [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) | How to run migrations |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Common issues |
| [FINAL_SUMMARY.md](./FINAL_SUMMARY.md) | Complete feature list |

---

## 🏗️ Architecture

**Modular Design** - Easy to separate into microservices:

### Backend (Can Extract)
```
src/app/api/          # REST API endpoints
src/lib/db/           # Database operations
src/lib/storage/      # File upload
src/lib/auth/         # Auth utilities
supabase/migrations/  # Database schema
```

### Frontend (React/Next.js)
```
src/components/       # UI components
src/hooks/            # Data fetching hooks
src/app/(pages)/      # Page routes
```

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (Email + OAuth)
- **Storage:** Supabase Storage
- **Realtime:** Supabase Realtime
- **UI:** shadcn/ui + Tailwind CSS v4
- **PWA:** Serwist
- **Language:** TypeScript
- **Deployment:** Vercel + Supabase

---

## 🎯 Key Features

### Public Access ✅
Anyone can browse without login:
- View all places and reviews
- Search and filter
- See realtime updates

### Smart Authentication ✅
Login only required for creating:
- Add places
- Write reviews
- Upload images

### Realtime Updates ✅
Live feed with WebSocket:
- New reviews appear instantly
- No page refresh needed
- "🟢 Live" indicator

### Image Upload ✅
Upload review photos:
- Up to 4 images per review
- 5MB max per image
- Preview before posting
- Secure user storage

### Mobile PWA ✅
Progressive Web App:
- Add to home screen
- Offline support
- Service worker caching

---

## 🔒 Security

- ✅ Row Level Security (RLS)
- ✅ Storage access policies
- ✅ Input validation
- ✅ Type safety (TypeScript)
- ✅ Secure sessions
- ✅ Protected API routes

---

## 📸 Screenshots

*Try the app to see:*
- Beautiful card-based UI
- Star ratings display
- Image galleries
- Mobile bottom navigation
- Realtime live badge
- Social login buttons

---

## 🚢 Deployment

### Vercel (Frontend)
```bash
npm i -g vercel
vercel
```

Add environment variables in Vercel dashboard.

### Supabase (Backend)
Already hosted! Free tier includes:
- 500MB database
- 1GB file storage
- 50,000 monthly active users
- Unlimited API requests

---

## 🤝 Contributing

Contributions welcome! This is a learning project showcasing:
- Modern Next.js patterns
- Supabase best practices
- TypeScript architecture
- Mobile-first design

---

## 📝 License

MIT

---

## 🎉 What's Included

✅ Public browsing (no login required)  
✅ Social authentication (Google, GitHub)  
✅ Email verification  
✅ **Image upload for reviews**  
✅ **Search and filter places**  
✅ **Realtime live feed**  
✅ Mobile-first PWA  
✅ Modular architecture  
✅ Full TypeScript  
✅ Tailwind CSS + shadcn/ui  

**Ready to deploy!** 🚀

---

**Built with ❤️ using Next.js and Supabase**
