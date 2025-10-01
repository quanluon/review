# Debug: "No Reviews Yet" Issue

## Possible Causes & Fixes

### 1. Database is Empty (Most Common)

**Check in Supabase Dashboard → Table Editor:**

- Do you have any **users**?
- Do you have any **places**?
- Do you have any **reviews**?

**Fix:** You need to create data first!

#### Option A: Create Data Manually

1. **Sign up** at http://localhost:3001/signup
2. **Log in**
3. **Go to** `/app`
4. Click **"+ Add Place"**
5. Create a place (e.g., "Test Restaurant")
6. Click on the place
7. Click **"Write Review"**
8. Submit a review with rating

#### Option B: Use Seed Data

1. **Go to Supabase Dashboard → SQL Editor**
2. **Copy and run** `supabase/seed.sql`
3. This creates:
   - 5 test places
   - 5 test reviews
   - Uses your existing user

---

### 2. API Call Failing

**Check browser console (F12):**

Look for errors like:
```
Failed to fetch reviews
Error 401 Unauthorized
Network error
```

**Debug API:**
```bash
# Test API directly
curl http://localhost:3001/api/reviews
```

**Should return:**
```json
{
  "data": [...],
  "error": null
}
```

**If you see error:**
- Check `.env.local` is configured
- Check Supabase URL and keys are correct
- Check migrations were run

---

### 3. React Hook Not Fetching

**Check browser console for:**
```
useReviews hook error
Failed to fetch
```

**Add debug logging temporarily:**

In `src/hooks/use-reviews.ts`, add:
```typescript
useEffect(() => {
  const fetchReviews = async () => {
    console.log('Fetching reviews...', options);
    // ... existing code
    console.log('Reviews fetched:', result.data);
  };
  fetchReviews();
}, [...]);
```

---

### 4. Review List Not Rendering

**Check if data exists but not showing:**

```typescript
// Add to feed page temporarily
console.log('Reviews:', reviews);
console.log('Loading:', loading);
console.log('Error:', error);
```

**If reviews array has data but page shows "No reviews":**
- Check ReviewCard component
- Check array mapping
- Check conditional rendering

---

## Quick Diagnosis

### Run This Test

**In browser console (F12) on `/app/feed` page:**

```javascript
// Test API directly
fetch('/api/reviews')
  .then(r => r.json())
  .then(data => console.log('API Response:', data));
```

**Expected output:**
```javascript
API Response: {
  data: [
    { id: '...', rating: 5, text: '...', user: {...}, place: {...} }
  ],
  error: null
}
```

**If data is empty array `[]`:**
→ Database has no reviews. Create some!

**If error message:**
→ API/Database issue. Check migrations.

---

## Create Test Data Now

### Easiest Way: Sign Up & Create Review

1. **Go to** http://localhost:3001/signup
2. **Create account**
3. **Confirm email** (or manually in Dashboard → Auth → Users → Confirm)
4. **Log in**
5. **Add a place:** Click "+ Add Place"
   - Name: "Test Restaurant"
   - Type: Restaurant
   - Create
6. **Click the place** you just created
7. **Write review:** Click "Write Review"
   - Rating: 5 stars
   - Text: "Great food!"
   - Submit
8. **Go to feed:** http://localhost:3001/app/feed
9. **Should see your review!** ✅

---

### Alternative: Use Seed SQL

**Faster if you already have a user:**

1. **Supabase Dashboard → SQL Editor**
2. **Run** `supabase/seed.sql`
3. **Refresh** your app
4. **Should see 5 places and 5 reviews!** ✅

---

## Verification Steps

### Step 1: Check Database

**Run in SQL Editor:**
```sql
-- Check what data exists
SELECT 
  'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Places', COUNT(*) FROM places
UNION ALL
SELECT 'Reviews', COUNT(*) FROM reviews;
```

**Expected:**
- Users: At least 1 (your account)
- Places: At least 1
- Reviews: At least 1

**If any are 0:**
- Users = 0: Sign up first!
- Places = 0: Create a place
- Reviews = 0: Create a review

### Step 2: Check API Response

**In browser console:**
```javascript
fetch('/api/reviews').then(r => r.json()).then(console.log)
```

**Should return:**
```json
{
  "data": [ /* array of reviews */ ],
  "error": null
}
```

### Step 3: Check Page State

**Add to FeedPage temporarily:**
```typescript
console.log({
  initialReviews,
  reviews,
  loading,
  error,
  reviewCount: reviews.length
});
```

---

## Common Scenarios

### Scenario 1: Brand New App

**Symptoms:**
- No data in database
- Just finished setup
- Haven't created anything yet

**Fix:**
1. Sign up
2. Create a place
3. Create a review

### Scenario 2: Migrations Not Run

**Symptoms:**
- "Relation does not exist" errors
- 500 errors in API
- Console shows database errors

**Fix:**
1. Run all 3 migrations in SQL Editor
2. See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)

### Scenario 3: RLS Blocking Reads

**Symptoms:**
- Database has data
- API returns empty array
- No errors shown

**Fix:**
Run in SQL Editor:
```sql
-- Check RLS policies allow SELECT
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'reviews' AND cmd = 'SELECT';

-- Should see: "Reviews are viewable by everyone"
```

---

## Quick Win: Create Sample Data

**Run this SQL to instant test data:**

```sql
-- First sign up at /signup, then run this:

-- Create places
INSERT INTO places (name, address, type) VALUES
('Coffee House', '123 Main St', 'cafe'),
('Pizza Place', '456 Oak Ave', 'restaurant'),
('Sunset Lounge', '789 Beach Rd', 'bar');

-- Create reviews (uses your user ID)
INSERT INTO reviews (user_id, place_id, rating, text)
SELECT 
  (SELECT id FROM users LIMIT 1),
  id,
  5,
  'Test review for ' || name
FROM places;

-- Check
SELECT COUNT(*) FROM reviews;
```

Refresh app → Should see 3 reviews! ✅

---

## Still Seeing "No Reviews Yet"?

**Next steps:**

1. **Check browser console (F12)** - Any errors?
2. **Check Network tab** - Is `/api/reviews` being called?
3. **Run seed.sql** - Creates test data
4. **Share console errors** - If you see any

**The app works when there's data!** You just need to create your first place and review. 🎯

See **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)** → "Test Everything" section for step-by-step testing.
