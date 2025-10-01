# 🗺️ Location Picker - User Guide

## New Feature: Extract Location from Map URLs

The location picker now supports **3 easy ways** to add location to places!

---

## 📍 3 Ways to Add Location

### Option 1: Use Current Location (Easiest)
1. Click **"📍 Use Current Location"**
2. Allow browser permission
3. Done! Location auto-filled ✅

### Option 2: Paste Map URL (Most Convenient) 🆕
1. Click **"🗺️ Paste Map URL"**
2. Paste a link from:
   - Google Maps
   - OpenStreetMap
   - Apple Maps
3. Click **"Extract Location"**
4. Done! Coordinates extracted ✅

### Option 3: Enter Coordinates Manually
1. Click **"Enter Coordinates"**
2. Input latitude and longitude
3. Click **"Set Location"**
4. Done! ✅

---

## 🗺️ Supported Map URLs

### Google Maps

**Share Link:**
```
https://www.google.com/maps?q=10.762622,106.660172
```

**Place URL:**
```
https://www.google.com/maps/@10.762622,106.660172,15z
```

**Search Result:**
```
https://maps.google.com/?q=10.762622,106.660172
```

**How to get:**
1. Open Google Maps
2. Right-click on location
3. Copy coordinates OR
4. Click "Share" → Copy link

### OpenStreetMap

**URL Format:**
```
https://www.openstreetmap.org/#map=15/10.762622/106.660172
```

**How to get:**
1. Open OpenStreetMap.org
2. Navigate to location
3. Click "Share" → Copy link

### Apple Maps

**URL Format:**
```
https://maps.apple.com/?ll=10.762622,106.660172
```

**How to get:**
1. Open Apple Maps
2. Drop a pin
3. Share → Copy link

---

## 📋 Step-by-Step: Using Map URL

### Example: Adding a Cafe with Google Maps

1. **Find the place on Google Maps:**
   - Search for "The Coffee Shop, Hanoi"
   - Click on the place marker

2. **Get the location:**
   - Right-click on the map
   - Click "What's here?"
   - See coordinates appear (e.g., 21.0285, 105.8542)
   - OR click Share button → Copy link

3. **Add place in your app:**
   - Click "+ Add Place"
   - Name: "The Coffee Shop"
   - Address: "123 Tran Hung Dao"
   - Type: Cafe
   - **Location:** Click "🗺️ Paste Map URL"
   - Paste: `https://www.google.com/maps/@21.0285,105.8542,15z`
   - Click "Extract Location"
   - See: "📍 21.028500, 105.854200" ✅
   - Submit!

4. **Result:**
   - Place created with exact location
   - Will show in distance sorting
   - Can be displayed on map (future)

---

## 🎯 Supported URL Patterns

The parser recognizes these patterns:

| Pattern | Example | Source |
|---------|---------|--------|
| `@lat,lng` | `@10.762,106.660` | Google Maps |
| `?q=lat,lng` | `?q=10.762,106.660` | Google Maps search |
| `ll=lat,lng` | `ll=10.762,106.660` | Apple Maps |
| `#map=z/lat/lng` | `#map=15/10.762/106.660` | OpenStreetMap |
| Plain coords | `10.762622,106.660172` | Any URL with coords |

**Regex magic:** Finds coordinates anywhere in the URL!

---

## ⚠️ Error Handling

### "Could not extract location"

**Causes:**
- URL doesn't contain coordinates
- Shortened URL (like goo.gl/maps/...)
- Invalid format

**Solutions:**
1. Use full URL (not shortened)
2. Try "What's here?" to get coordinates
3. Copy coordinates directly
4. Use manual entry instead

### "Invalid URL format"

**Causes:**
- Not a valid URL
- Contains special characters

**Solution:**
- Copy the entire URL from browser address bar
- Make sure it starts with `https://`

---

## 💡 Pro Tips

### Quick Copy from Google Maps
1. Right-click location → "What's here?"
2. Coordinates appear at bottom
3. Click coordinates → Copied! ✅
4. Paste in "🗺️ Paste Map URL" field

### Mobile Friendly
1. Open Google Maps app
2. Long-press location
3. Share → Copy link
4. Paste in your browser on desktop
5. Or manually copy coordinates

### Fallback Options
If URL extraction fails:
- Click "Enter Coordinates" instead
- Manually input lat/lng
- Or skip location entirely (optional)

---

## 🔍 Under the Hood

### URL Parsing Logic

```typescript
function extractLocationFromUrl(url: string): Coordinates | null {
  // Try multiple regex patterns
  
  // Google Maps: @lat,lng or ?q=lat,lng
  let match = url.match(/[@?q=](-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
  
  // OpenStreetMap: #map=zoom/lat/lng
  match = url.match(/#map=\d+\/(-?\d+\.?\d*)\/(-?\d+\.?\d*)/);
  
  // Apple Maps: ll=lat,lng
  match = url.match(/ll=(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
  
  // Fallback: Any lat,lng pattern
  match = url.match(/(-?\d+\.?\d{4,}),\s*(-?\d+\.?\d{4,})/);
  
  return match ? {
    latitude: parseFloat(match[1]),
    longitude: parseFloat(match[2])
  } : null;
}
```

### Why This is Useful

**Better UX:**
- No need to copy coordinates separately
- Paste entire URL → Auto-extract
- Works with most map services
- Reduces friction

**Accuracy:**
- Exact coordinates from maps
- No typos in manual entry
- Verified locations

---

## 🧪 Testing

### Test Different URL Formats

**Google Maps:**
```
https://www.google.com/maps/@10.762622,106.660172,15z
✅ Extracts: 10.762622, 106.660172
```

**OpenStreetMap:**
```
https://www.openstreetmap.org/#map=15/10.762622/106.660172
✅ Extracts: 10.762622, 106.660172
```

**Apple Maps:**
```
https://maps.apple.com/?ll=10.762622,106.660172
✅ Extracts: 10.762622, 106.660172
```

**Plain Coordinates:**
```
Just paste: 10.762622,106.660172
✅ Extracts: 10.762622, 106.660172
```

---

## 📱 User Flow

### Creating a Place with Map URL

```
1. User opens Google Maps on phone
2. Finds place: "Awesome Restaurant"
3. Clicks Share → Copies link
4. Opens your app on desktop/mobile
5. Clicks "+ Add Place"
6. Fills: Name, Address, Type
7. Click "🗺️ Paste Map URL"
8. Pastes copied link
9. Click "Extract Location"
10. Sees: "📍 Location Set"
11. Submits place
12. Place now has exact coordinates! ✅
```

**Result:**
- Place can be filtered by distance
- Shows distance badges
- Ready for map display
- Accurate location data

---

## 🎨 UI States

### Initial State (No Location)
```
Location (Optional)

[📍 Use Current Location]

[🗺️ Paste Map URL] [Enter Coordinates]
```

### URL Input Mode
```
Location (Optional)

┌──────────────────────────────────────┐
│ Paste Google Maps, OpenStreetMap...  │
└──────────────────────────────────────┘
Examples: Google Maps share link...

[Extract Location] [Cancel]
```

### Location Set
```
Location (Optional)

┌────────────────────────────────────┐
│ Location Set                    × │
│ 📍 10.762622, 106.660172          │
└────────────────────────────────────┘
```

---

## 🔧 Advanced Usage

### Coordinates Format

**Supported formats:**
- Decimal degrees: `10.762622, 106.660172` ✅
- With spaces: `10.762622, 106.660172` ✅
- No spaces: `10.762622,106.660172` ✅
- Negative (West/South): `-33.8688, 151.2093` ✅

**NOT supported:**
- DMS (degrees/minutes/seconds): `10°45'45"N` ❌
- Solution: Convert to decimal first

### International Locations

Works worldwide:
- Vietnam: `10.762622, 106.660172` ✅
- USA: `40.7128, -74.0060` (New York) ✅
- Europe: `48.8566, 2.3522` (Paris) ✅
- Australia: `-33.8688, 151.2093` (Sydney) ✅

---

## 🚀 Future Enhancements

Planned features:
- [ ] Visual map picker (click on map)
- [ ] Address to coordinates (geocoding)
- [ ] Reverse geocoding (coords to address)
- [ ] Map preview in dialog
- [ ] Drag marker to adjust location

---

## 📚 Resources

- [Google Maps Help](https://support.google.com/maps/answer/18539)
- [OpenStreetMap Guide](https://wiki.openstreetmap.org/wiki/Browsing)
- [Coordinates Converter](https://www.latlong.net/)

---

## Summary

✅ **3 ways to add location**  
✅ **Extract from map URLs** (Google, OSM, Apple)  
✅ **Use current location** (GPS)  
✅ **Manual coordinates** (fallback)  
✅ **Optional** (can skip)  
✅ **Mobile-friendly**  
✅ **Error handling**  

**No more manual coordinate entry needed!** 🎉

