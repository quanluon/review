# RLS Policy Fix for Users Table

## Problem

Getting this error when creating reviews:
```
Error: new row violates row-level security policy for table "users"
```

## Root Cause

The `users` table has RLS enabled but is missing an **INSERT policy**. 

Current policies only allow:
- ✅ SELECT (read) - anyone can view users
- ✅ UPDATE - users can update their own profile
- ❌ INSERT - **MISSING!** Can't create user records

## Solution

Add INSERT policies to allow:
1. Users to create their own record (when auth.uid() = id)
2. Service role to create users (for triggers and background jobs)

### SQL Migration

Run this in **Supabase SQL Editor**:

```sql
-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Allow service role to insert users (for triggers)
CREATE POLICY "Service role can insert users" ON public.users
  FOR INSERT 
  WITH CHECK (true);
```

Or run the migration file: `supabase/migrations/20241001000002_fix_users_insert_policy.sql`

## How to Apply

### Option 1: Run Migration in Supabase Dashboard

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy the SQL from `supabase/migrations/20241001000002_fix_users_insert_policy.sql`
3. Paste and click **Run**

### Option 2: Use Supabase CLI

```bash
supabase db push
```

## Verify the Fix

After running the migration, check policies:

```sql
-- View all policies on users table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'users';
```

You should see:
- ✅ "Users are viewable by everyone" (SELECT)
- ✅ "Users can update own profile" (UPDATE)
- ✅ "Users can insert own profile" (INSERT) - **NEW**
- ✅ "Service role can insert users" (INSERT) - **NEW**

## Test It

1. **Run the migration** (see above)
2. **Try creating a review again** - should work now!
3. **Check user was created**:
   ```sql
   SELECT * FROM public.users WHERE email = 'your@email.com';
   ```

## Why This Matters

Row Level Security (RLS) is crucial for security:
- Protects data from unauthorized access
- Ensures users can only modify their own data
- Prevents SQL injection attacks

But RLS needs proper policies for INSERT, UPDATE, DELETE, and SELECT operations.

## Understanding RLS Policies

### Current Policies Breakdown

**SELECT Policy** - Anyone can view users:
```sql
CREATE POLICY "Users are viewable by everyone" 
ON public.users FOR SELECT 
USING (true);  -- No restrictions
```

**UPDATE Policy** - Users can only update themselves:
```sql
CREATE POLICY "Users can update own profile" 
ON public.users FOR UPDATE 
USING (auth.uid() = id);  -- Check current user matches record
```

**INSERT Policy** - Users can create their own record:
```sql
CREATE POLICY "Users can insert own profile" 
ON public.users FOR INSERT 
WITH CHECK (auth.uid() = id);  -- New record must match current user
```

**INSERT Policy** - Service role can create any user:
```sql
CREATE POLICY "Service role can insert users" 
ON public.users FOR INSERT 
WITH CHECK (true);  -- No restrictions for service role
```

## Alternative: Disable RLS (NOT RECOMMENDED)

If you're just testing and want to bypass RLS temporarily:

```sql
-- CAUTION: Only for development/testing!
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
```

**Don't do this in production!** It removes all security protections.

## Related Files

- Migration: `supabase/migrations/20241001000002_fix_users_insert_policy.sql`
- User sync: `src/lib/auth/ensure-user.ts`
- Troubleshooting: `TROUBLESHOOTING.md`

## After the Fix

Once the migration is applied:
- ✅ Users can sign up (email or social)
- ✅ User records auto-created in `public.users`
- ✅ Reviews and places can be created
- ✅ No more RLS violations
- ✅ Data remains secure

🎉 **Ready to test!**

