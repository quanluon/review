# Debugging Realtime - Step by Step

## Why Realtime Might Not Be Working

There are 3 common reasons:

### 1. Realtime Not Enabled in Supabase ⚠️

**Check:**
- Go to **Supabase Dashboard**
- **Database** → **Replication**
- Find `reviews` table
- Is the toggle **ON** (green)?

**Fix:**
- Toggle it ON
- Wait a few seconds for it to activate
- Refresh your app

---

### 2. Browser Console Errors

**Check:**
1. Open browser **DevTools** (F12)
2. Go to **Console** tab
3. Look for these messages:

**Good Signs (Working):**
```
Realtime subscription status: SUBSCRIBED
```

**Bad Signs (Not Working):**
```
Realtime subscription status: CHANNEL_ERROR
Realtime subscription status: TIMED_OUT
WebSocket connection failed
```

**Fix:**
- If CHANNEL_ERROR: Check Realtime is enabled
- If TIMED_OUT: Check internet connection
- If WebSocket failed: Disable browser extensions

---

### 3. Supabase Project Settings

**Check API URL:**
1. Your `.env.local` has correct Supabase URL
2. Format should be: `https://xxxxx.supabase.co`
3. No trailing slash

**Check Anon Key:**
- Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- Copy from **Project Settings → API**

---

## How to Test Realtime

### Step-by-Step Test

1. **Open your app:** http://localhost:3001/app/feed

2. **Check connection:**
   - Look for "🟢 Live" badge (green = connected)
   - If gray "Connecting..." = not connected

3. **Open browser console (F12):**
   ```
   Should see:
   "Realtime subscription status: SUBSCRIBED"
   ```

4. **Open a second browser tab/window:**
   - Same URL: http://localhost:3001/app/feed

5. **In Tab 1:**
   - Click a place
   - Create a review
   - Submit it

6. **In Tab 2:**
   - Should see the new review appear **instantly**
   - Console shows: "New review received!"

---

## Quick Fixes

### Fix 1: Enable Realtime in Supabase

```
Dashboard → Database → Replication → Toggle reviews ON
```

### Fix 2: Restart Dev Server

```bash
# Stop server (Ctrl+C)
cd /Users/quill/Workspace/work-space/review
rm -rf .next
npm run dev
```

### Fix 3: Check Browser Console

Open F12 and look for errors. Common issues:
- CORS errors → Check Supabase URL
- WebSocket errors → Check firewall/extensions
- Auth errors → Check anon key

### Fix 4: Test Direct SQL

Run in **SQL Editor** to manually trigger event:

```sql
-- Insert a test review (replace with real IDs)
INSERT INTO reviews (user_id, place_id, rating, text)
VALUES (
  (SELECT id FROM users LIMIT 1),
  (SELECT id FROM places LIMIT 1),
  5,
  'Test realtime review'
);
```

Watch your app - should appear immediately if realtime is working.

---

## Detailed Debugging

### Check 1: Verify Realtime Configuration

**Run in SQL Editor:**
```sql
-- Check if realtime is enabled for reviews table
SELECT 
  schemaname,
  tablename,
  wal2json 
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';
```

Should show `reviews` table if enabled.

### Check 2: Verify Supabase Client

**Add to page temporarily:**
```typescript
useEffect(() => {
  const test = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getSession();
    console.log('Supabase client:', { 
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      session: data.session 
    });
  };
  test();
}, []);
```

### Check 3: Monitor WebSocket Connection

**In browser DevTools:**
1. Go to **Network** tab
2. Filter by **WS** (WebSocket)
3. Should see connection to Supabase
4. Status should be "101 Switching Protocols"

---

## Alternative: Polling Fallback

If realtime still doesn't work, add polling as fallback:

```typescript
// In feed page
useEffect(() => {
  if (!isConnected) {
    // Poll every 10 seconds if realtime isn't connected
    const interval = setInterval(() => {
      refresh(); // Refresh reviews
    }, 10000);
    
    return () => clearInterval(interval);
  }
}, [isConnected, refresh]);
```

---

## Troubleshooting Checklist

- [ ] Realtime enabled in Dashboard → Database → Replication
- [ ] Toggle is **green/ON** for `reviews` table
- [ ] Dev server restarted after enabling
- [ ] Browser console shows "SUBSCRIBED"
- [ ] No browser extensions blocking WebSocket
- [ ] Correct Supabase URL in .env.local
- [ ] Correct anon key in .env.local
- [ ] Badge shows "🟢 Live" (green)
- [ ] Test with two browser windows works

---

## Still Not Working?

### Option 1: Manual SQL Insert Test

```sql
-- In SQL Editor
INSERT INTO reviews (user_id, place_id, rating, text)
SELECT 
  u.id,
  p.id,
  5,
  'Realtime test review - ' || NOW()::text
FROM users u, places p
LIMIT 1;
```

If this appears in your feed immediately → Realtime works!
If not → Check Supabase project status (not paused)

### Option 2: Check Supabase Status

- Is your project **paused**? (Free tier pauses after 1 week inactivity)
- Go to **Project Settings** → Check status
- Unpause if needed

### Option 3: Recreate Channel

Try different channel name:
```typescript
const channel = supabase
  .channel(`reviews-realtime-${Math.random()}`)
```

---

## Expected Console Output

When working correctly:

```
Realtime subscription status: SUBSCRIBED
(when review created in another tab)
New review received! { new: {...}, old: null }
```

When NOT working:

```
Realtime subscription status: CHANNEL_ERROR
or
Realtime subscription status: TIMED_OUT
```

---

## Contact Support

If still having issues after all checks:
1. Check [Supabase Status](https://status.supabase.com/)
2. Check [Supabase Discord](https://discord.supabase.com/)
3. Review [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)

---

## Quick Test Script

Run this in browser console on the feed page:

```javascript
// Test realtime connection
const { createClient } = await import('/src/lib/supabase/client.ts');
const supabase = createClient();

const channel = supabase
  .channel('test-channel')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'reviews'
  }, (payload) => {
    console.log('✅ REALTIME WORKING!', payload);
  })
  .subscribe((status) => {
    console.log('Connection status:', status);
  });

// Then create a review and watch console
```

---

**TL;DR:**
1. Enable Realtime in Dashboard → Database → Replication
2. Restart dev server
3. Check console for "SUBSCRIBED"
4. Test with two windows

