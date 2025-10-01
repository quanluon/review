# 🚀 Advanced Features Guide

## New Features Summary

1. ✅ **Follow Users** - Follow reviewers you trust
2. ✅ **Geolocation** - Find places near you
3. ✅ **Location Picker** - Add location when creating places
4. ✅ **Notifications** - Get notified of new reviews
5. ✅ **Gamification** - Earn points and level up
6. ✅ **Leaderboard** - See top reviewers

---

## 1. Follow Users 👥

### Features
- Follow users from review cards
- Get notifications when they post
- Build your personal network
- Follow button only shown to authenticated users

### Usage

**In Review Feed:**
- See a review you like
- Click **"Follow"** button next to username
- Unfollow by clicking again
- Button shows current state (Follow / Following)

**Backend:**
- Triggers notification to followed user
- Updates follower counts
- Awards points (+5 for being followed)

### API
```
POST /api/users/[id]/follow    # Follow user
DELETE /api/users/[id]/follow  # Unfollow user
GET /api/users/[id]/follow     # Check if following
```

---

## 2. Geolocation 📍

### Features
- Request user's current location
- Sort places by distance
- Show distance on place cards
- Works with browser geolocation API

### Usage

**On Places Page:**
1. Click **"📍 Sort by distance"** button
2. Allow location access when prompted
3. Places sorted by proximity
4. Distance shown (e.g., "500m" or "2.3km")

**Permission Required:**
- Browser will ask for location permission
- Works on HTTPS only (or localhost)
- Can be denied by user

### Implementation

```typescript
const { location, requestLocation } = useGeolocation();

// Request location
requestLocation();

// Calculate distance
const distance = calculateDistance(userLocation, placeLocation);
```

---

## 3. Location Picker 🗺️

### Features
- Add location when creating places
- Use current location (default)
- Manual coordinate entry
- Optional (can skip)

### Usage

**Creating a Place:**
1. Click "+ Add Place"
2. Fill in name, address, type
3. **Location section:**
   - Click "📍 Use Current Location" (automatic)
   - OR click "Enter Manually" (input lat/lng)
   - OR skip (leave empty)
4. See location preview
5. Create place

**Location Storage:**
- Stored as latitude/longitude
- Used for distance calculations
- Used for map display (future)

---

## 4. Notifications 🔔

### Features
- Get notified when:
  - Someone you follow posts a review
  - Someone follows you
  - Your review gets liked (future)
- Mark as read/unread
- Notification center (future UI)

### Database Triggers

**Auto-created notifications:**
- New follower → Notifies the followed user
- New review → Notifies all followers

### API
```
GET /api/notifications              # Get all notifications
GET /api/notifications?unread=true  # Unread only
PATCH /api/notifications            # Mark as read
```

### Implementation

```typescript
// Trigger on follow
INSERT INTO notifications (user_id, type, title, message)
VALUES (
  following_user_id,
  'new_follower',
  'New Follower',
  '[Name] started following you'
);

// Trigger on review
INSERT INTO notifications ...
SELECT follower_id FROM follows WHERE following_id = reviewer_id;
```

---

## 5. Gamification 🎮

### Point System

**Earn Points:**
- ⭐ Write a review: **+10 points**
- 👥 Get a follower: **+5 points**
- 📍 Add a place: **+20 points** (future)
- 📸 Upload images: **+2 points** per image (future)

**Levels:**
- 🌱 **Beginner** (0-99 points)
- 🌟 **Pro** (100-499 points)
- ⭐ **Expert** (500-999 points)
- 🏆 **Master** (1000+ points)

### User Stats Tracking

**Auto-updated on actions:**
```sql
user_stats table:
- total_reviews
- total_places_added
- total_followers
- total_following
- points
- level
- badges (JSON array)
```

### Leaderboard

**View at** `/app/leaderboard`:
- Top 100 reviewers
- Sorted by points
- Shows:
  - Rank (#1, #2, #3...)
  - Name & avatar
  - Level badge
  - Total reviews
  - Total followers
  - Total points

**Top 3 highlighted:**
- Gold border for top 3
- Special badges

---

## 6. Admin Dashboard (Database Ready)

### Moderation System

**Database tables created:**
- `reported_content` - User-reported issues
- `users.role` - User roles (user, moderator, admin)

**Report Types:**
- Spam reviews
- Inappropriate content
- Fake places
- Abusive users

**Moderation Workflow:**
1. User reports content
2. Report goes to `reported_content` table
3. Moderators review in dashboard (UI to be built)
4. Mark as: resolved, dismissed, or take action

### Roles

**User (default):**
- Can report content
- Can view own reports

**Moderator:**
- Can view all reports
- Can update report status
- Can add moderator notes

**Admin:**
- All moderator permissions
- Can assign roles
- Can manage users

### Future UI

Dashboard will include:
- Pending reports list
- Content preview
- Action buttons (delete, warn, dismiss)
- User history
- Statistics

---

## Setup Instructions

### Run Migration

**Supabase Dashboard → SQL Editor:**

Run `supabase/migrations/20241001000004_advanced_features.sql`

**This creates:**
- ✅ Notifications table
- ✅ User stats table
- ✅ Reported content table
- ✅ Triggers for auto-notifications
- ✅ Triggers for points/stats
- ✅ Leaderboard view
- ✅ Role column on users

### Enable Features

**All features work automatically after migration!**

No additional configuration needed. Just:
1. Run the migration
2. Restart your app
3. Features are live ✅

---

## Testing

### Test Following

1. **Window 1:** Log in as User A
2. **Window 2:** Log in as User B (incognito)
3. **User B:** Create a review
4. **User A:** Click "Follow" on User B's review
5. **Check:** User B's database has notification
6. **User A:** See "Following" button state

### Test Geolocation

1. Go to `/app`
2. Click "📍 Sort by distance"
3. Allow location when browser asks
4. Places reorder by distance
5. See distance badges (e.g., "1.2km")

### Test Points System

1. Log in
2. Create a review
3. Go to `/app/leaderboard`
4. See your name with +10 points
5. Create more reviews → Points increase
6. Level up at 100, 500, 1000 points

### Test Location Picker

1. Click "+ Add Place"
2. Click "📍 Use Current Location"
3. Allow permission
4. See location set (lat/lng)
5. OR click "Enter Manually"
6. Input custom coordinates
7. Create place with location

---

## Database Schema Updates

### New Tables

```sql
notifications
├── id (PK)
├── user_id (FK)
├── type
├── title
├── message
├── data (JSONB)
├── read
└── created_at

user_stats
├── user_id (PK)
├── total_reviews
├── total_places_added
├── total_followers
├── total_following
├── points
├── level
└── badges (JSONB)

reported_content
├── id (PK)
├── reporter_id (FK)
├── content_type
├── content_id
├── reason
├── status
├── moderator_id
└── moderator_notes
```

### Updated Tables

```sql
users
└── + role (user, moderator, admin)
```

---

## API Endpoints Added

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/users/[id]/follow` | POST | Follow user |
| `/api/users/[id]/follow` | DELETE | Unfollow user |
| `/api/users/[id]/follow` | GET | Check follow status |
| `/api/notifications` | GET | Get notifications |
| `/api/notifications` | PATCH | Mark as read |
| `/api/leaderboard` | GET | Get top users |

---

## Security

### RLS Policies

**Notifications:**
- ✅ Users can only view own notifications
- ✅ System can create notifications (triggers)
- ✅ Users can update own notifications (mark read)

**User Stats:**
- ✅ Public view for leaderboard
- ✅ System manages updates (triggers)

**Reported Content:**
- ✅ Users can create reports
- ✅ Users can view own reports
- ✅ Moderators can view all
- ✅ Moderators can update status

---

## Future Enhancements

### Notifications UI
- [ ] Notification bell icon in nav
- [ ] Unread count badge
- [ ] Notification dropdown
- [ ] Mark all as read
- [ ] Push notifications

### Gamification
- [ ] Achievement badges
- [ ] Streaks (daily reviews)
- [ ] Challenges
- [ ] Rewards

### Admin Dashboard
- [ ] Moderation panel
- [ ] Content review queue
- [ ] User management
- [ ] Analytics dashboard
- [ ] Bulk actions

### Maps
- [ ] Interactive map view
- [ ] Place picker on map
- [ ] Nearby places
- [ ] Directions
- [ ] Street view integration

---

## Troubleshooting

### Geolocation Not Working

**Check:**
- Using HTTPS or localhost (required)
- Browser has location permission
- Not blocked by corporate firewall
- Try different browser

### Follow Not Working

**Check:**
- Migration #4 ran successfully
- RLS policies created
- User is authenticated
- Not trying to follow self

### Points Not Updating

**Check:**
- Migration #4 ran
- Triggers were created
- Check `user_stats` table exists
- Create a review to test

### Leaderboard Empty

**Check:**
- Users have created reviews
- `user_stats` table has data
- Leaderboard view exists
- Try creating reviews first

---

## Resources

- [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [Leaflet Maps](https://leafletjs.com/)
- [Supabase Triggers](https://supabase.com/docs/guides/database/postgres/triggers)
- [Gamification Best Practices](https://www.interaction-design.org/literature/topics/gamification)

🎉 **All advanced features ready!**
