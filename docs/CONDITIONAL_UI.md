# Conditional UI Based on Authentication

## ✅ Smart UI - No Forced Redirects

The app now intelligently shows/hides features based on authentication state, without forcing redirects.

---

## How It Works

### Public Users (Not Logged In)

**Can See & Do:**
- ✅ Browse all places
- ✅ View place details
- ✅ Read all reviews (with images)
- ✅ Search and filter places
- ✅ Sort by distance (with geolocation)
- ✅ See realtime updates
- ✅ View leaderboard (hidden in nav)

**Cannot See:**
- ❌ "Follow" buttons (hidden)
- ❌ "+ Add Place" button (replaced with "Sign in to Add Place")
- ❌ "Write Review" button (replaced with "Sign in to Write Review")
- ❌ "Leaderboard" in navigation (hidden)

### Authenticated Users

**Can See & Do Everything:**
- ✅ All public features above, PLUS:
- ✅ "Follow" buttons on reviews
- ✅ "+ Add Place" dialog
- ✅ "Write Review" dialog with image upload
- ✅ Location picker for new places
- ✅ "Leaderboard" page in navigation (desktop & mobile)
- ✅ Points and gamification features

---

## UI Components

### 1. Review Cards

**Public View:**
```
┌──────────────────────────────────────┐
│ 👤 John Doe · The Restaurant         │
│    ★★★★★ 2h ago                      │
│ "Great food!"                         │
└──────────────────────────────────────┘
```

**Authenticated View:**
```
┌──────────────────────────────────────┐
│ 👤 John Doe [Follow] · The Restaurant│
│    ★★★★★ 2h ago                      │
│ "Great food!"                         │
└──────────────────────────────────────┘
```

### 2. Places List Header

**Public View:**
```
Places                    [Sign in to Add Place]
```

**Authenticated View:**
```
Places                         [+ Add Place]
```

### 3. Place Details Page

**Public View:**
```
The Restaurant
★★★★★ 4.5 (12 reviews)

[Sign in to Write Review]

Reviews
...
```

**Authenticated View:**
```
The Restaurant
★★★★★ 4.5 (12 reviews)

[Write Review]

Reviews
...
```

### 4. Navigation Bar

**Public (Desktop):**
```
Reviews | Places | Feed        [Sign in] [Sign up]
```

**Authenticated (Desktop):**
```
Reviews | Places | Feed | Leaderboard    [Avatar ▼]
```

**Public (Mobile Bottom Nav):**
```
┌──────────┬──────────┐
│  Places  │   Feed   │
└──────────┴──────────┘
```

**Authenticated (Mobile Bottom Nav):**
```
┌──────────┬──────────┬──────────┐
│  Places  │   Feed   │  Points  │
└──────────┴──────────┴──────────┘
```

---

## Code Implementation

### Check Auth State in Components

```typescript
import { useAuth } from "@/hooks/use-auth";

export function MyComponent() {
  const { isAuthenticated } = useAuth();
  
  return (
    <div>
      {isAuthenticated ? (
        <InteractiveButton />
      ) : (
        <Link href="/login">
          <Button>Sign in to [Action]</Button>
        </Link>
      )}
    </div>
  );
}
```

### Review Card

```typescript
// Only show Follow button if authenticated
{isAuthenticated && (
  <FollowButton userId={review.user.id} />
)}
```

### Places Page

```typescript
// Conditional header button
{isAuthenticated ? (
  <CreatePlaceDialog />
) : (
  <Link href="/login">
    <Button>Sign in to Add Place</Button>
  </Link>
)}
```

### Place Details

```typescript
// Conditional review button
{isAuthenticated ? (
  <CreateReviewDialog placeId={place.id} />
) : (
  <Link href="/login">
    <Button>Sign in to Write Review</Button>
  </Link>
)}
```

### Navigation

```typescript
// Conditional leaderboard link
{isAuthenticated && (
  <Link href="/app/leaderboard">Leaderboard</Link>
)}
```

---

## User Flows

### Public User Journey

```
Visit /app
  ↓
Browse places (✅ no login)
  ↓
Click place
  ↓
Read reviews (✅ no login)
  ↓
See "Sign in to Write Review" button
  ↓
Click → Redirect to /login
  ↓
Sign up
  ↓
Redirected back to place
  ↓
Now sees "Write Review" button (✅)
```

### Authenticated User Journey

```
Visit /app (already logged in)
  ↓
Browse places
  ↓
Click "+ Add Place" → Dialog opens directly ✅
  ↓
Click place
  ↓
Click "Write Review" → Dialog opens directly ✅
  ↓
Click "Follow" on reviews → Follows immediately ✅
  ↓
Check "Leaderboard" → See points & rankings ✅
```

---

## Benefits of This Approach

### 1. Better UX
- No frustrating redirects while browsing
- Clear call-to-action buttons
- Users see value before signing up

### 2. Higher Conversion
- Users explore first
- Understand what they can do
- Sign up when ready to participate

### 3. SEO Friendly
- All content is public
- Search engines can index
- Social sharing works

### 4. Progressive Enhancement
- Basic browsing works for everyone
- Enhanced features for authenticated users
- Graceful degradation

---

## Authentication State Management

The `useAuth` hook provides:

```typescript
const {
  user,              // User object (null if not logged in)
  loading,           // Initial auth check loading
  isAuthenticated,   // Boolean: true if logged in
  signIn,            // Login function
  signUp,            // Signup function
  signOut,           // Logout function
} = useAuth();
```

**Usage pattern:**
```typescript
// Check authentication
{isAuthenticated && <AuthenticatedFeature />}

// Show alternative
{isAuthenticated ? (
  <CreateButton />
) : (
  <SignInButton />
)}

// Hide completely
{isAuthenticated && <FollowButton />}
```

---

## Features by Auth State

| Feature | Public | Authenticated |
|---------|--------|---------------|
| Browse places | ✅ Yes | ✅ Yes |
| Search places | ✅ Yes | ✅ Yes |
| Filter by type | ✅ Yes | ✅ Yes |
| Sort by distance | ✅ Yes | ✅ Yes |
| View reviews | ✅ Yes | ✅ Yes |
| Realtime feed | ✅ Yes | ✅ Yes |
| Follow users | ❌ No | ✅ Yes |
| Create place | ❌ Button → Login | ✅ Opens dialog |
| Write review | ❌ Button → Login | ✅ Opens dialog |
| Upload images | ❌ No | ✅ Yes |
| View leaderboard | ❌ Direct URL only | ✅ In navigation |
| Earn points | ❌ No | ✅ Yes |

---

## Testing

### Test as Public User

1. **Open incognito window**
2. **Visit** http://localhost:3001/app
3. **Expected:**
   - ✅ See all places
   - ✅ Can click and view details
   - ✅ Can read reviews
   - ✅ NO "Follow" buttons visible
   - ✅ "Sign in to Add Place" button shows
   - ✅ "Sign in to Write Review" on place pages
   - ✅ Mobile nav shows 2 tabs (Places, Feed)

### Test as Authenticated User

1. **Log in**
2. **Visit** http://localhost:3001/app
3. **Expected:**
   - ✅ See all places (same as public)
   - ✅ "+ Add Place" button shows
   - ✅ "Follow" buttons on reviews
   - ✅ "Write Review" button on place pages
   - ✅ "Leaderboard" in desktop nav
   - ✅ Mobile nav shows 3 tabs (Places, Feed, Points)

---

## Code Locations

### Components with Conditional UI

| File | What's Conditional |
|------|-------------------|
| `src/components/reviews/review-card.tsx` | Follow button |
| `src/app/app/page.tsx` | Add Place button |
| `src/app/app/places/[id]/page.tsx` | Write Review button |
| `src/components/layout/app-nav.tsx` | Leaderboard link, mobile nav |
| `src/components/places/create-place-dialog.tsx` | Redirects if not auth |
| `src/components/reviews/create-review-dialog.tsx` | Redirects if not auth |

### Dialogs Still Redirect (Safety Check)

Even though buttons are conditional, dialogs still check auth:

```typescript
const handleOpenChange = (newOpen: boolean) => {
  if (newOpen && !isAuthenticated) {
    router.push("/login");  // Safety check
    return;
  }
  setOpen(newOpen);
};
```

This handles edge cases (direct URL access, etc.)

---

## Summary

✅ **No forced redirects** - browse freely without login  
✅ **Conditional buttons** - UI adapts to auth state  
✅ **Clear CTAs** - "Sign in to [Action]" buttons  
✅ **Progressive enhancement** - more features when logged in  
✅ **Seamless transition** - from browsing to creating  

**Best of both worlds:** Public browsing + authenticated features! 🎉

