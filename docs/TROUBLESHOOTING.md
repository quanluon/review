# Troubleshooting Guide

## Common Issues and Solutions

### 1. Foreign Key Constraint Error on Review Creation

**Error:**
```
insert or update on table "reviews" violates foreign key constraint "reviews_user_id_fkey"
Details: Key is not present in table "users".
```

**Cause:** User exists in `auth.users` but not in `public.users` table.

**Solution:** The app now automatically creates the user record when needed. If you still see this error:

1. **Manual Fix** - Run this in Supabase SQL Editor:
   ```sql
   -- Insert missing users from auth.users to public.users
   INSERT INTO public.users (id, email, name, avatar_url)
   SELECT 
     id,
     email,
     COALESCE(raw_user_meta_data->>'name', email),
     raw_user_meta_data->>'avatar_url'
   FROM auth.users
   WHERE id NOT IN (SELECT id FROM public.users)
   ON CONFLICT (id) DO NOTHING;
   ```

2. **Check Trigger** - Verify the trigger exists:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

3. **Recreate Trigger** if missing:
   ```sql
   CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS TRIGGER AS $$
   BEGIN
     INSERT INTO public.users (id, name, email, avatar_url)
     VALUES (
       NEW.id,
       COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
       NEW.email,
       NEW.raw_user_meta_data->>'avatar_url'
     );
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;

   CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
   ```

### 2. Tailwind CSS Not Working

**Symptoms:** Styles not applying, page looks unstyled

**Solutions:**

1. **Clear cache and restart:**
   ```bash
   rm -rf .next
   npm run dev
   ```

2. **Check imports** in `src/app/globals.css`:
   ```css
   @import "tailwindcss";
   ```

3. **Verify PostCSS config** in `postcss.config.mjs`:
   ```js
   const config = {
     plugins: ["@tailwindcss/postcss"],
   };
   export default config;
   ```

### 3. Turbopack Font Loading Error

**Error:**
```
Module not found: Can't resolve '@vercel/turbopack-next/internal/font/google/font'
```

**Solution:** Remove `--turbopack` from package.json (already done):
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build"
  }
}
```

### 4. OAuth Not Working

**Google OAuth:**

1. Check redirect URI in Google Console:
   ```
   https://[YOUR-PROJECT].supabase.co/auth/v1/callback
   ```

2. Verify Client ID and Secret in Supabase Dashboard

3. Ensure Google+ API is enabled

**GitHub OAuth:**

1. Check callback URL in GitHub App settings:
   ```
   https://[YOUR-PROJECT].supabase.co/auth/v1/callback
   ```

2. Verify Client ID and Secret in Supabase Dashboard

3. Make sure the OAuth app is not in "Development" mode

### 5. Email Verification Not Working

**Emails not being sent:**

1. **Check SMTP settings** in Supabase:
   - Go to Project Settings → Auth
   - Scroll to SMTP Settings
   - Verify configuration

2. **Development mode:**
   - Emails won't send in dev without SMTP configured
   - Manually confirm users in Dashboard → Authentication → Users

3. **Check email templates:**
   - Go to Authentication → Email Templates
   - Ensure "Confirm signup" template has `{{ .ConfirmationURL }}`

### 6. Build Errors

**"Cannot find module" errors:**

```bash
# Clean everything and rebuild
rm -rf .next node_modules/.cache
npm run build
```

**TypeScript errors with Supabase types:**

The app uses `as never` type assertions for Supabase insert/update operations due to a known type inference issue. This is intentional and safe.

### 7. Database Connection Issues

**"relation does not exist" errors:**

1. **Run migration** in Supabase SQL Editor:
   - Copy contents of `supabase/migrations/20241001000001_initial_schema.sql`
   - Paste in SQL Editor
   - Click Run

2. **Check RLS policies:**
   ```sql
   -- Verify RLS is enabled
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```

### 8. Authentication Redirects

**Stuck on login page after OAuth:**

1. **Check Site URL** in Supabase:
   - Go to Authentication → Settings
   - Set Site URL to `http://localhost:3000` (dev) or your domain (prod)

2. **Check Redirect URLs:**
   - Add `http://localhost:3000/auth/callback`
   - Add `https://yourdomain.com/auth/callback` (prod)

### 9. Rate Limiting

**"Too many requests" errors:**

1. Supabase has built-in rate limiting
2. Check Dashboard → Settings → Rate Limits
3. Adjust limits or upgrade plan if needed

### 10. Public Access Issues

**Can't view places without login:**

This should work now (all GET endpoints are public). If not:

1. **Clear cache:**
   ```bash
   rm -rf .next
   npm run dev
   ```

2. **Check middleware** - should NOT block `/app` routes

3. **Check API routes** - GET methods should not require auth

## Debugging Tips

### 1. Check Logs

**Supabase Logs:**
- Dashboard → Logs
- Filter by "postgres" for database errors
- Filter by "auth" for auth issues

**Next.js Logs:**
- Check terminal where dev server is running
- Check browser console (F12)

### 2. Database Inspection

```sql
-- Check if user exists
SELECT * FROM public.users WHERE email = 'your@email.com';

-- Check reviews
SELECT r.*, u.name, p.name as place_name
FROM reviews r
JOIN users u ON r.user_id = u.id
JOIN places p ON r.place_id = p.id;

-- Check follows
SELECT 
  f1.name as follower,
  f2.name as following
FROM follows f
JOIN users f1 ON f.follower_id = f1.id
JOIN users f2 ON f.following_id = f2.id;
```

### 3. Test API Endpoints

```bash
# Get places (should work without auth)
curl http://localhost:3000/api/places

# Get reviews
curl http://localhost:3000/api/reviews

# Create review (requires auth - will fail without token)
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{"place_id": "...", "rating": 5, "text": "Great!"}'
```

## Getting Help

1. **Check Documentation:**
   - [SETUP.md](./SETUP.md)
   - [AUTHENTICATION.md](./AUTHENTICATION.md)
   - [QUICK_START.md](./QUICK_START.md)

2. **Supabase Documentation:**
   - [Auth Guide](https://supabase.com/docs/guides/auth)
   - [Database Guide](https://supabase.com/docs/guides/database)
   - [Troubleshooting](https://supabase.com/docs/guides/platform/troubleshooting)

3. **Next.js Documentation:**
   - [App Router](https://nextjs.org/docs/app)
   - [API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

4. **Check Supabase Dashboard:**
   - Recent errors in Logs
   - User list in Authentication
   - Table data in Table Editor
   - Query history in SQL Editor

## Quick Fixes

### Reset Everything

```bash
# 1. Stop dev server (Ctrl+C)
# 2. Clean everything
rm -rf .next node_modules/.cache

# 3. Rebuild
npm run build

# 4. Restart
npm run dev
```

### Reset Database (CAUTION: Deletes all data)

```sql
-- Run in Supabase SQL Editor
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Then run the migration again from:
-- supabase/migrations/20241001000001_initial_schema.sql
```

### Reset Auth (CAUTION: Deletes all users)

Don't do this in production! Instead, manually delete users from Dashboard → Authentication → Users

## Still Having Issues?

1. Check that all environment variables are set correctly in `.env.local`
2. Verify Supabase project is not paused (free tier pauses after inactivity)
3. Check that you're using the correct Supabase project URL and keys
4. Try creating a new test account to isolate the issue

