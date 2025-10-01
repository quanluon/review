# ✅ Setup Checklist - Run These in Supabase

Complete these steps in your Supabase Dashboard to enable all features.

---

## 🗄️ Step 1: Run Database Migrations

Go to **Supabase Dashboard → SQL Editor → New Query**

### Migration 1: Initial Schema
Copy and run: `supabase/migrations/20241001000001_initial_schema.sql`

**Creates:**
- ✅ All tables (users, places, reviews, etc.)
- ✅ Indexes for performance
- ✅ RLS policies
- ✅ Triggers for auto-updates

### Migration 2: Users INSERT Policy
Copy and run: `supabase/migrations/20241001000002_fix_users_insert_policy.sql`

**Fixes:**
- ✅ Allows users to create their own records
- ✅ Fixes "RLS violation" error

### Migration 3: Storage Setup
Copy and run: `supabase/migrations/20241001000003_storage_setup.sql`

**Creates:**
- ✅ Storage policies for images
- ✅ Upload/view/delete permissions

---

## 📦 Step 2: Create Storage Bucket

Go to **Storage** → **New bucket**

**Settings:**
- **Name:** `review-images`
- **Public bucket:** ✅ **Yes** (important!)
- Click **Create bucket**

**Verify:** You should see `review-images` in the bucket list

---

## 🔴 Step 3: Enable Realtime

Go to **Database → Replication**

**Enable for:**
- ✅ Toggle **ON** next to `reviews` table

**Verify:** Should say "Realtime is enabled"

---

## 🔐 Step 4: Configure Authentication

Go to **Authentication → Settings**

**Enable:**
- ✅ **Enable email signups**
- ✅ **Enable email confirmations** (recommended)

**Set URLs:**
- **Site URL:** `http://localhost:3000` (dev) or `https://yourdomain.com` (prod)
- **Redirect URLs:** Add both:
  - `http://localhost:3000/auth/callback`
  - `https://yourdomain.com/auth/callback` (when deployed)

---

## 🌐 Step 5: Enable OAuth (Optional but Recommended)

### Google OAuth

**Setup:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 Client ID
3. Add redirect URI: `https://[YOUR-PROJECT].supabase.co/auth/v1/callback`
4. Copy Client ID and Secret

**In Supabase:**
1. **Authentication → Providers**
2. Find **Google**
3. Toggle **Enabled**
4. Paste Client ID and Secret
5. **Save**

### GitHub OAuth

**Setup:**
1. Go to [GitHub Settings → Developer Settings](https://github.com/settings/developers)
2. **New OAuth App**
3. Callback URL: `https://[YOUR-PROJECT].supabase.co/auth/v1/callback`
4. Copy Client ID and Secret

**In Supabase:**
1. **Authentication → Providers**
2. Find **GitHub**
3. Toggle **Enabled**
4. Paste Client ID and Secret
5. **Save**

---

## 📧 Step 6: SMTP (Optional - For Production)

For sending verification emails in production:

Go to **Project Settings → Auth → SMTP Settings**

**Recommended Providers:**
- SendGrid (100 emails/day free)
- Mailgun (5,000/month free)
- Resend (3,000/month free)

**Configure:**
```
Host: smtp.sendgrid.net
Port: 587
User: apikey
Password: YOUR_API_KEY
Sender: noreply@yourdomain.com
```

---

## ✅ Verification Checklist

After completing setup, verify:

### Database
```sql
-- Run in SQL Editor to verify tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Should see: users, places, reviews, review_images, comments, follows
```

### Storage
- [ ] Bucket `review-images` exists
- [ ] Bucket is **public**
- [ ] Can upload a test file

### Realtime
- [ ] Replication enabled for `reviews`
- [ ] Green indicator next to table

### Authentication
- [ ] Email signups enabled
- [ ] Site URL configured
- [ ] Redirect URLs added
- [ ] (Optional) Google OAuth enabled
- [ ] (Optional) GitHub OAuth enabled

### Policies
```sql
-- Check RLS policies
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename;

-- Should see policies for all tables
```

---

## 🧪 Test Everything

### 1. Test Public Access
- [ ] Open incognito window
- [ ] Visit `http://localhost:3001/app`
- [ ] Can see places without login ✅
- [ ] Can view place details ✅
- [ ] Can see reviews ✅

### 2. Test Authentication
- [ ] Click "Sign up"
- [ ] Create account with email/password
- [ ] (Check email for verification - or confirm manually)
- [ ] Can login ✅
- [ ] Try Google login (if configured)
- [ ] Try GitHub login (if configured)

### 3. Test Places
- [ ] Can view all places ✅
- [ ] Search works ✅
- [ ] Filter by type works ✅
- [ ] Click "Add Place" (while logged in)
- [ ] Create a place ✅
- [ ] See it in the list ✅

### 4. Test Reviews
- [ ] Click on a place
- [ ] Click "Write Review" (while logged in)
- [ ] Select rating (1-5 stars) ✅
- [ ] Add text ✅
- [ ] Upload 1-4 images ✅
- [ ] Preview images ✅
- [ ] Submit review ✅
- [ ] See images in review card ✅

### 5. Test Realtime
- [ ] Open app in two browser tabs
- [ ] In Tab 1: Create a review
- [ ] In Tab 2: See it appear instantly ✅
- [ ] Check for "🟢 Live" badge ✅

### 6. Test PWA
- [ ] Build: `npm run build`
- [ ] Start: `npm start`
- [ ] Check DevTools → Application → Service Workers
- [ ] Service worker registered ✅

---

## ⚠️ Common Issues

### "RLS violation" when creating review
**Fix:** Run migration `20241001000002_fix_users_insert_policy.sql`

### Images not uploading
**Fix:** Create `review-images` bucket (must be public)

### Realtime not working
**Fix:** Enable replication for `reviews` table

### OAuth not working
**Fix:** Check redirect URIs match exactly

### Page redirects to login
**Fix:** Already fixed in `src/lib/supabase/middleware.ts`

---

## 📊 Expected Results

After setup:
- ✅ 6 tables created
- ✅ 1 storage bucket
- ✅ 20+ RLS policies
- ✅ 5+ triggers
- ✅ Realtime enabled
- ✅ Authentication working
- ✅ All features functional

---

## 🎯 You're Done When...

- [ ] All migrations run successfully
- [ ] Storage bucket created
- [ ] Realtime enabled
- [ ] Can browse without login
- [ ] Can create review with images
- [ ] Realtime updates work
- [ ] No console errors

---

## 🚀 Next: Deploy to Production

See [SETUP.md](./SETUP.md) for deployment instructions.

**Your app is ready!** 🎉
