# ✅ Foreign Key Constraint Error - FIXED

## Problem

When creating a review, you got this error:
```
Error: insert or update on table "reviews" violates foreign key constraint "reviews_user_id_fkey"
Details: Key is not present in table "users".
```

## Root Cause

The user exists in `auth.users` (Supabase authentication) but not in `public.users` (our application database). This happens when:

1. **Social OAuth signup** (Google/GitHub) - The database trigger may not have fired
2. **User created before trigger** - If the user signed up before the migration was run
3. **Manual user creation** - User created directly in Supabase Dashboard

## Solution Implemented

Created an **automatic user sync** system that ensures users exist before creating reviews or places.

### New Helper Function

`src/lib/auth/ensure-user.ts`:
- Checks if user exists in `public.users`
- If not, automatically creates them with data from `auth.users`
- Handles name extraction from metadata or email
- Handles avatar URLs from OAuth providers

### Updated API Routes

**`/api/reviews` (POST)**:
- Now calls `ensureUserExists()` before creating review
- Automatically syncs user if missing

**`/api/places` (POST)**:
- Now calls `ensureUserExists()` before creating place
- Automatically syncs user if missing

## How It Works

```typescript
// Before creating review/place:
await ensureUserExists(supabase, user);

// This function:
// 1. Checks if user exists in public.users
// 2. If not, creates them with:
//    - id from auth.users
//    - email from auth.users
//    - name from user_metadata or email
//    - avatar_url from user_metadata (for OAuth)
```

## Test It

1. **Dev server should auto-reload** (running on port 3001)
2. **Try creating a review again** - should work now!
3. **Check the user was created**:
   - Go to Supabase Dashboard
   - Table Editor → users
   - You should see your user

## Manual Fix (if needed)

If you want to sync all existing users right now:

```sql
-- Run in Supabase SQL Editor
INSERT INTO public.users (id, email, name, avatar_url)
SELECT 
  id,
  email,
  COALESCE(
    raw_user_meta_data->>'name',
    raw_user_meta_data->>'full_name', 
    email
  ) as name,
  raw_user_meta_data->>'avatar_url' as avatar_url
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;
```

## Why This Happened

The database trigger should automatically create users:

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

But triggers can fail if:
- Migration wasn't run yet
- Trigger was created after users
- Social OAuth edge case

The new automatic sync fixes this **permanently** - no more foreign key errors! 

## Verification

Check the terminal where dev server is running. When you create a review, you should see:
- No more constraint errors ✅
- Review created successfully ✅
- User auto-created if missing ✅

## Documentation

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more common issues and solutions.
