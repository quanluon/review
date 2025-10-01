# Public Access Status

## ✅ Current Configuration

All **GET (read)** operations are **PUBLIC** - no authentication required!

### API Endpoints - Authentication Matrix

| Endpoint | Method | Auth Required? | Notes |
|----------|--------|----------------|-------|
| `/api/places` | GET | ❌ No | Anyone can browse places |
| `/api/places` | POST | ✅ Yes | Creating places requires login |
| `/api/places/[id]` | GET | ❌ No | Anyone can view place details |
| `/api/places/[id]` | PATCH | ✅ Yes | Updating places requires login |
| `/api/reviews` | GET | ❌ No* | Anyone can view reviews |
| `/api/reviews` | POST | ✅ Yes | Creating reviews requires login |
| `/api/reviews?feed=true` | GET | ✅ Yes | Personalized feed requires login |

*Exception: Feed endpoint requires auth because it's personalized

### Pages - Access Control

| Route | Auth Required? | What Users See |
|-------|----------------|----------------|
| `/` | ❌ No | Redirects to `/app` or `/login` based on auth status |
| `/login` | ❌ No | Login page |
| `/signup` | ❌ No | Signup page |
| `/app` | ❌ No | Public - anyone can browse places |
| `/app/places/[id]` | ❌ No | Public - anyone can view place & reviews |
| `/app/feed` | ❌ No* | Public page, but shows limited data without auth |

*Pages are public, but functionality is limited for unauthenticated users

### UI Behavior for Unauthenticated Users

When a user is **not logged in**:

✅ **Can Do:**
- Browse all places
- View place details
- Read all reviews
- Search and filter places
- Use the app navigation

❌ **Cannot Do (Redirects to Login):**
- Click "Add Place" button → redirects to `/login`
- Click "Write Review" button → redirects to `/login`
- View personalized feed → shows empty/login prompt

### Navigation Bar States

**Logged Out User Sees:**
```
Reviews | Places | Feed        [Sign in] [Sign up]
```

**Logged In User Sees:**
```
Reviews | Places | Feed        [Avatar Menu ▼]
                                ├─ youremail@example.com
                                └─ Sign out
```

## Implementation Details

### API Routes

#### `/api/places` (GET)
```typescript
export async function GET(request: Request) {
  // ✅ NO AUTH CHECK
  const supabase = await createClient();
  // ... public data fetching
}
```

#### `/api/reviews` (GET)
```typescript
export async function GET(request: Request) {
  const feed = searchParams.get("feed") === "true";
  
  if (feed) {
    // ✅ AUTH REQUIRED for personalized feed
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 401;
  } else {
    // ✅ NO AUTH for public reviews
    const reviews = await reviewsDb.getAll(...);
  }
}
```

#### POST/PATCH/DELETE Methods
```typescript
export async function POST(request: Request) {
  // ✅ AUTH REQUIRED for write operations
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required to create..." },
      { status: 401 }
    );
  }
  // ... authenticated operations
}
```

### Component-Level Guards

#### Create Place Dialog
```typescript
const handleOpenChange = (newOpen: boolean) => {
  if (newOpen && !isAuthenticated) {
    router.push("/login");  // ✅ Redirects to login
    return;
  }
  setOpen(newOpen);
};
```

#### Create Review Dialog
```typescript
const handleOpenChange = (newOpen: boolean) => {
  if (newOpen && !isAuthenticated) {
    router.push("/login");  // ✅ Redirects to login
    return;
  }
  setOpen(newOpen);
};
```

### App Layout

**Before (Old):**
```typescript
// ❌ Forced authentication
if (!user) {
  redirect("/login");
}
```

**After (Current):**
```typescript
// ✅ Public access
export default async function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav />
      <main>{children}</main>
    </div>
  );
}
```

## Testing Public Access

### Test as Unauthenticated User

1. **Open incognito/private window**
2. **Visit** `http://localhost:3001/app`
3. **Should see:**
   - ✅ All places listed
   - ✅ Search and filters work
   - ✅ "Sign in" and "Sign up" buttons in nav
   - ✅ Can click any place to view details
   - ✅ Can read all reviews

4. **Try to create:**
   - Click "Add Place" → redirects to `/login` ✅
   - Click "Write Review" → redirects to `/login` ✅

### Test as Authenticated User

1. **Login**
2. **Should see:**
   - ✅ Avatar/menu instead of sign in buttons
   - ✅ Can create places (dialog opens)
   - ✅ Can write reviews (dialog opens)
   - ✅ Access to personalized feed

## Why This Design?

### Benefits of Public Read Access

1. **Better UX**
   - Users can explore before committing
   - See value proposition immediately
   - Lower barrier to entry

2. **SEO & Discovery**
   - Search engines can index content
   - Social media can preview links
   - Better organic growth

3. **Social Proof**
   - New users see existing reviews
   - Builds trust and credibility
   - Encourages sign-ups

4. **Viral Growth**
   - Users can share place links
   - Recipients don't need account to view
   - Creates network effects

### Security Considerations

**What's Protected:**
- ✅ User data (email, passwords)
- ✅ Write operations (create, update, delete)
- ✅ Personalized data (feed, profile)
- ✅ RLS policies enforce data ownership

**What's Public:**
- ✅ Places (meant to be discovered)
- ✅ Reviews (social proof)
- ✅ Ratings (aggregate data)
- ✅ User names/avatars (public profiles)

This follows the **"Public by Default, Private by Choice"** pattern used by:
- Yelp (read reviews without login)
- TripAdvisor (browse content freely)
- Google Maps (view places/reviews publicly)

## Troubleshooting

### "Getting 401 Unauthorized on GET"

Check:
1. Are you using the correct endpoint?
2. Is `?feed=true` in the URL? (feed requires auth)
3. Check browser console for the actual request

### "Can't access /app without login"

Check:
1. Middleware configuration
2. App layout doesn't force auth
3. Clear cache: `rm -rf .next && npm run dev`

### "Buttons still requiring auth"

This is intentional! Buttons that **create content** should redirect to login. Only **viewing** is public.

## API Usage Examples

### Public Endpoints (No Auth)

```bash
# Get all places
curl http://localhost:3001/api/places

# Get place by ID
curl http://localhost:3001/api/places/[id]

# Get all reviews
curl http://localhost:3001/api/reviews

# Get reviews for specific place
curl http://localhost:3001/api/reviews?placeId=[id]
```

### Protected Endpoints (Require Auth)

```bash
# Create place (needs auth token)
curl -X POST http://localhost:3001/api/places \
  -H "Cookie: sb-access-token=..." \
  -H "Content-Type: application/json" \
  -d '{"name": "New Place", "type": "restaurant"}'

# Create review (needs auth token)
curl -X POST http://localhost:3001/api/reviews \
  -H "Cookie: sb-access-token=..." \
  -H "Content-Type: application/json" \
  -d '{"place_id": "...", "rating": 5, "text": "Great!"}'

# Get personalized feed (needs auth token)
curl http://localhost:3001/api/reviews?feed=true \
  -H "Cookie: sb-access-token=..."
```

## Summary

✅ **All GET endpoints are PUBLIC**
✅ **All POST/PATCH/DELETE require authentication**
✅ **UI redirects to login when user tries to create content**
✅ **Navigation shows appropriate buttons based on auth status**

**Your app follows industry best practices for public/private access!** 🎉

