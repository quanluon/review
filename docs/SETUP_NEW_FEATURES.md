# Setup Guide: New Features

## 🎉 3 New Features Added

1. ✅ **Image Upload** - Upload photos with reviews
2. ✅ **Search & Filter** - Already working (enhanced)
3. ✅ **Realtime Feed** - Live updates without refresh

---

## Quick Setup (5 Minutes)

### Step 1: Create Storage Bucket

1. **Go to Supabase Dashboard** → **Storage**
2. Click **New bucket**
3. Enter details:
   - **Name:** `review-images`
   - **Public bucket:** ✅ Yes
   - Click **Create bucket**

### Step 2: Set Storage Policies

1. **Stay in Storage** → Click `review-images` bucket → **Policies** tab
2. **Go to SQL Editor** instead
3. **Copy and run** this SQL:

```sql
-- Allow authenticated users to upload their own images
CREATE POLICY "Users can upload review images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'review-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow anyone to view images (public bucket)
CREATE POLICY "Anyone can view review images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'review-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'review-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own images
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'review-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Step 3: Enable Realtime

1. **Go to Database** → **Replication**
2. Find the **`reviews` table**
3. **Toggle ON** the switch next to it
4. Should say "Realtime is enabled" ✅

### Step 4: Test!

**Test Image Upload:**
1. Log in to your app
2. Click any place
3. Click "Write Review"
4. Click "Choose files" under Photos
5. Select up to 4 images
6. See preview
7. Submit review
8. Images should appear in the review! ✅

**Test Realtime:**
1. Open app in **two browser windows**
2. In Window 1: Create a review
3. In Window 2: Watch it appear **instantly** without refresh! ✨

**Test Search:**
1. Go to `/app`
2. Type in search box (e.g., "coffee")
3. Click type badges (cafe, restaurant, etc.)
4. Results filter in real-time ✅

---

## Feature Details

### 1. 📸 Image Upload

**What's New:**
- Upload up to 4 images per review
- Preview images before posting
- Remove images before submitting
- Images stored in Supabase Storage
- Fast CDN delivery

**File Limits:**
- Max 5MB per image
- Formats: JPEG, PNG, WebP, GIF
- Max 4 images per review

**UI Location:**
- Create Review dialog
- New "Photos" section
- Image previews with × remove button

**Backend:**
- `src/lib/storage/upload.ts` - Upload utilities
- Images stored: `{userId}/{timestamp}-{random}.ext`
- Public URLs for fast access

### 2. 🔍 Search & Filter

**Already Working:**
- ✅ Real-time search as you type
- ✅ Filter by type (restaurant, cafe, bar, shop, hotel)
- ✅ Sort by rating, date, review count
- ✅ Trending algorithm

**UI Features:**
- Search bar at top of `/app` page
- Type filter badges (click to toggle)
- Live results update

**Database:**
- Full-text search index
- Optimized queries
- Fast results

### 3. 🔴 Realtime Feed

**What's New:**
- Live review updates
- No page refresh needed
- Works on Feed page (`/app/feed`)
- Works on Place Details (`/app/places/[id]`)
- "🟢 Live" indicator badge

**How It Works:**
- Subscribes to database changes
- New reviews appear at top instantly
- Updated reviews refresh in place
- Deleted reviews removed automatically

**Visual Indicator:**
```
Latest Reviews [🟢 Live]
```

Animated green dot shows it's connected!

---

## Testing Checklist

### Image Upload
- [ ] Create bucket in Storage
- [ ] Run storage policies SQL
- [ ] Try uploading 1 image
- [ ] Try uploading 4 images
- [ ] Try removing an image before submit
- [ ] Check image appears in review card
- [ ] Verify image loads from CDN

### Search & Filter
- [ ] Search for "coffee" - see cafes
- [ ] Click "cafe" badge - filter to cafes only
- [ ] Click "all" - see all places
- [ ] Search for address
- [ ] Try empty search

### Realtime
- [ ] Enable replication for reviews table
- [ ] Open app in 2 windows
- [ ] Create review in Window 1
- [ ] See it appear in Window 2 instantly
- [ ] Check "Live" badge is showing
- [ ] Check browser console for "New review received!"

---

## Troubleshooting

### Images Not Uploading

**Check:**
1. Bucket `review-images` exists
2. Bucket is **public**
3. Storage policies are created
4. User is authenticated
5. File size < 5MB
6. File type is valid

**Common errors:**
```
"Policy violation" → Check storage policies
"File too large" → Reduce image size
"Invalid file type" → Use JPEG/PNG/WebP/GIF
```

### Realtime Not Working

**Check:**
1. **Database → Replication** → `reviews` is ON
2. Browser console shows "Realtime subscription status: SUBSCRIBED"
3. No browser extensions blocking WebSocket
4. Try in incognito mode

**Debug:**
```javascript
// Open browser console
// Should see:
"Realtime subscription status: SUBSCRIBED"
"New review received!" // when review is created
```

### Search Not Working

**Check:**
1. Database index exists (from initial migration)
2. Places have data in `name` and `address` fields
3. Try broader search terms
4. Check browser console for errors

---

## Code Examples

### Upload Image
```typescript
import { uploadReviewImages } from "@/lib/storage/upload";

const files = [/* File objects */];
const uploads = await uploadReviewImages(supabase, files, userId);
const imageUrls = uploads.map(u => u.url);
```

### Realtime Subscribe
```typescript
import { useRealtimeReviews } from "@/hooks/use-realtime-reviews";

const { reviews } = useRealtimeReviews({
  placeId: "optional-filter-by-place",
  initialReviews: existingReviews
});
```

### Search Places
```typescript
import { usePlaces } from "@/hooks/use-places";

const { places } = usePlaces({
  search: "pizza",
  type: "restaurant",
  orderBy: "avg_rating",
  limit: 50
});
```

---

## Security

### Storage
- ✅ User-specific folders (can't overwrite others)
- ✅ File type validation
- ✅ Size limits enforced
- ✅ RLS policies on storage bucket

### Realtime
- ✅ RLS policies enforced
- ✅ Users can only modify own reviews
- ✅ Public read access
- ✅ No sensitive data in realtime events

---

## Performance

### Image Optimization
- Images served from Supabase CDN
- Automatic caching
- Consider using `next/image` for optimization
- Future: Add image compression

### Realtime
- Lightweight WebSocket connection
- Only changed data sent
- Automatic reconnection
- Subscription cleanup on unmount

### Search
- Database indexes for fast queries
- Debounced input (reduces API calls)
- Limited results (50 max)
- Efficient full-text search

---

## What's Next?

### Suggested Enhancements

**Images:**
- [ ] Image compression before upload
- [ ] Drag & drop upload
- [ ] Image carousel/lightbox
- [ ] Image editing/cropping

**Search:**
- [ ] Autocomplete suggestions
- [ ] Search history
- [ ] Advanced filters (price range, rating)
- [ ] Geolocation search

**Realtime:**
- [ ] Push notifications
- [ ] Toast notifications for new reviews
- [ ] Online user indicators
- [ ] Typing indicators for comments

---

## Summary

✅ **Image Upload** - Upload photos, preview, store securely  
✅ **Search & Filter** - Find places fast, filter by type  
✅ **Realtime Feed** - Live updates, no refresh needed  

**Run the setup steps above and you're ready to go!** 🚀

Files modified:
- `src/components/reviews/create-review-dialog.tsx` - Image upload UI
- `src/app/app/feed/page.tsx` - Realtime feed
- `src/app/app/places/[id]/page.tsx` - Realtime place reviews
- `src/lib/storage/upload.ts` - Upload utilities (new)
- `src/hooks/use-realtime-reviews.ts` - Realtime hook (new)
- `supabase/migrations/20241001000003_storage_setup.sql` - Storage setup (new)

