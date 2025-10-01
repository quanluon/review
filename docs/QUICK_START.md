# Quick Start Guide

## 🚀 Get Up and Running in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Supabase

1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Run the migration:
   - Go to **SQL Editor**
   - Copy/paste contents of `supabase/migrations/20241001000001_initial_schema.sql`
   - Click **Run**

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run the App

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 5. Enable Email Confirmation (Recommended)

In Supabase Dashboard:
1. **Authentication** → **Settings**
2. Enable "Email confirmations"
3. Set Site URL to `http://localhost:3000`
4. Add Redirect URL: `http://localhost:3000/auth/callback`

### 6. Test It Out!

1. Go to `/signup`
2. Create an account
3. Check your email (or Supabase Dashboard → Users → Confirm manually)
4. Login and explore!

## 📖 Next Steps

- Read [SETUP.md](./SETUP.md) for detailed architecture
- Read [AUTHENTICATION.md](./AUTHENTICATION.md) for OAuth setup
- Check [PWA_SETUP.md](./PWA_SETUP.md) for PWA configuration

## 🎨 Tailwind CSS is Working!

The app uses Tailwind CSS v4 with shadcn/ui components. All styles should render correctly. If you see unstyled content:

1. Clear browser cache
2. Restart dev server
3. Check `src/app/globals.css` imports Tailwind

## ✅ What's Included

- ✅ Mobile-first responsive design
- ✅ Authentication (email + social)
- ✅ Places CRUD
- ✅ Reviews with ratings
- ✅ PWA ready
- ✅ Modular architecture (easy to separate BE/FE)

Happy coding! 🎉
