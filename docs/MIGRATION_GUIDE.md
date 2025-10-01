# Migration Guide

## Quick Start: Run the RLS Fix Migration

You need to add INSERT policies to the `users` table. Here's how:

### ✅ Method 1: Copy & Paste (Easiest)

1. **Open** `supabase/migrations/20241001000002_fix_users_insert_policy.sql`

2. **Copy all the SQL** (Cmd+A, Cmd+C)

3. **Go to Supabase Dashboard:**
   - Visit [app.supabase.com](https://app.supabase.com)
   - Select your project
   - Click **SQL Editor** in sidebar
   - Click **New Query**

4. **Paste and Run:**
   - Paste the SQL (Cmd+V)
   - Click **Run** or press Cmd+Enter
   - You should see "Success"

5. **Test:** Try creating a review - should work now! ✅

---

## Method 2: Using Supabase CLI

### Install Supabase CLI

**macOS:**
```bash
brew install supabase/tap/supabase
```

**npm (cross-platform):**
```bash
npm install -g supabase
```

**Other methods:**
- [Official Installation Guide](https://supabase.com/docs/guides/cli/getting-started#installing-the-supabase-cli)

### Link Your Project

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF
```

**Find your project ref:**
- Go to Project Settings → General
- Copy "Reference ID"

### Run Migrations

```bash
# Push all migrations to remote database
supabase db push

# Or apply a specific migration
supabase db push --include-all
```

---

## Running Migrations: All Methods

### Option A: Supabase Dashboard (GUI)

**Pros:**
- ✅ No installation needed
- ✅ Visual interface
- ✅ Works from anywhere
- ✅ Can edit SQL before running

**Steps:**
1. Copy migration SQL
2. Paste in SQL Editor
3. Click Run

### Option B: Supabase CLI

**Pros:**
- ✅ Automated
- ✅ Version controlled
- ✅ Can run multiple migrations
- ✅ Integrates with CI/CD

**Steps:**
```bash
supabase db push
```

### Option C: Direct SQL Client

If you have `psql` or another PostgreSQL client:

```bash
# Get connection string from Supabase Dashboard
# Project Settings → Database → Connection string

psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \
  -f supabase/migrations/20241001000002_fix_users_insert_policy.sql
```

---

## Migration Files in This Project

### 1. Initial Schema
**File:** `supabase/migrations/20241001000001_initial_schema.sql`

Creates:
- All tables (users, places, reviews, etc.)
- Indexes for performance
- RLS policies
- Triggers for auto-updates
- Functions for business logic

**Status:** ✅ Should already be run

### 2. Users INSERT Policy Fix
**File:** `supabase/migrations/20241001000002_fix_users_insert_policy.sql`

Adds:
- INSERT policy for users table
- Allows users to create their own record
- Fixes RLS violation error

**Status:** ⏳ Need to run this now

---

## How to Check if Migration Ran Successfully

### Method 1: Query Policies

Run in SQL Editor:

```sql
SELECT 
  policyname,
  cmd,
  with_check
FROM pg_policies 
WHERE tablename = 'users';
```

**Should see:**
- `Users are viewable by everyone` (SELECT)
- `Users can update own profile` (UPDATE)
- `Users can insert own profile` (INSERT) ← **NEW**
- `Service role can insert users` (INSERT) ← **NEW**

### Method 2: Test the App

1. Try creating a review
2. Should work without RLS errors
3. Check `users` table - your user should be there

---

## Troubleshooting

### "Policy already exists"

If you get this error:
```
ERROR: policy "Users can insert own profile" for table "users" already exists
```

**Solution:** The migration already ran! You're good to go. ✅

### "Permission denied"

Make sure you're:
- Logged into the correct Supabase project
- Using the correct project ref
- Have owner/admin permissions

### "Relation does not exist"

The initial schema migration hasn't run yet:

1. Run `20241001000001_initial_schema.sql` first
2. Then run `20241001000002_fix_users_insert_policy.sql`

---

## Best Practices

### 1. Never Modify Existing Migrations

Once a migration runs in production, **never change it**.

❌ **Bad:**
```bash
# Editing old migration
vim supabase/migrations/20241001000001_initial_schema.sql
```

✅ **Good:**
```bash
# Create new migration
touch supabase/migrations/20241001000003_add_comments_table.sql
```

### 2. Test Locally First

If using Supabase CLI:

```bash
# Start local Supabase
supabase start

# Test migrations locally
supabase db reset

# If successful, push to remote
supabase db push
```

### 3. Keep Migrations Small

One migration = one logical change

✅ Good: Separate migrations for each feature
❌ Bad: One giant migration for everything

### 4. Name Migrations Clearly

```
YYYYMMDDHHMMSS_descriptive_name.sql

Examples:
20241001000001_initial_schema.sql
20241001000002_fix_users_insert_policy.sql
20241001000003_add_comments_table.sql
20241001000004_add_geolocation_to_places.sql
```

---

## Creating New Migrations

### Manual

```bash
# Create file with timestamp
touch supabase/migrations/$(date +%Y%m%d%H%M%S)_your_change_name.sql

# Edit the file
vim supabase/migrations/[timestamp]_your_change_name.sql
```

### With Supabase CLI

```bash
# Automatically creates timestamped file
supabase migration new your_change_name
```

---

## Quick Reference

| Task | Command/Action |
|------|----------------|
| Run migration (manual) | Copy SQL → Supabase Dashboard → SQL Editor → Run |
| Run migration (CLI) | `supabase db push` |
| Create new migration | `supabase migration new name` |
| Check policies | See SQL query above |
| View migration status | Check Table Editor for expected changes |
| Rollback (not supported) | Create new migration that reverses changes |

---

## Next Steps

1. **Run the RLS fix migration** (see Method 1 above)
2. **Test creating a review** - should work now
3. **Verify in database:**
   ```sql
   SELECT * FROM public.users;
   SELECT * FROM public.reviews;
   ```

Need help? See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
