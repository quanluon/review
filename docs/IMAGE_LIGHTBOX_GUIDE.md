# 🖼️ Image Lightbox - User Guide

## New Feature: Click to View Full-Size Images

Review images are now fully interactive with a beautiful lightbox viewer!

---

## ✨ Features

### Image Grid
- Click any image to open full-size view
- Hover effect with zoom icon
- Image counter badge (1/4, 2/4, etc.)
- Grid layout (2 columns)
- Max 4 images displayed

### Lightbox Modal
- **Full-screen view** of images
- **Navigation:**
  - Arrow buttons (← →)
  - Keyboard arrows (← →)
  - Close button (×)
  - ESC key to close
- **Image counter** (current/total)
- **Smooth transitions**
- **Dark overlay** for focus
- **Responsive** on mobile

---

## 🎮 How to Use

### Desktop

**View Images:**
1. See review with images
2. Hover over image → See zoom icon
3. Click image → Opens full-screen
4. Use arrow buttons or keyboard (← →) to navigate
5. Press ESC or click × to close

**Keyboard Shortcuts:**
- `←` Previous image
- `→` Next image
- `ESC` Close lightbox

### Mobile

**View Images:**
1. Tap any image thumbnail
2. Swipe or tap arrows to navigate
3. Tap × to close
4. Pinch to zoom (browser native)

---

## 🎨 UI Design

### Image Thumbnail (In Review Card)

```
┌──────────┬──────────┐
│   🖼️ 1/4 │   🖼️ 2/4 │
│ [Image]  │ [Image]  │  ← Hover shows zoom icon
└──────────┴──────────┘
┌──────────┬──────────┐
│   🖼️ 3/4 │   🖼️ 4/4 │
│ [Image]  │ [Image]  │
└──────────┴──────────┘
```

**Hover State:**
- Slight zoom (scale 105%)
- Dark overlay (20% opacity)
- Zoom+ icon appears
- Smooth transition

### Lightbox View

```
┌─────────────────────────────────────────┐
│  [1/4]                              [×] │ ← Top bar
│                                         │
│         ┌───────────────────┐          │
│    [←]  │                   │  [→]     │ ← Navigation
│         │   Full Image      │          │
│         │                   │          │
│         └───────────────────┘          │
│                                         │
│     Use ← → arrow keys to navigate     │ ← Hint
└─────────────────────────────────────────┘
```

**Features:**
- Black background (95% opacity)
- Centered image
- Max height: 80vh
- Maintains aspect ratio
- Arrow buttons on sides
- Close button top-right

---

## 🔧 Implementation Details

### Component: ImageLightbox

**Props:**
```typescript
interface ImageLightboxProps {
  images: Array<{ 
    id: string; 
    image_url: string 
  }>;
  initialIndex?: number;
}
```

**Usage:**
```typescript
import { ImageLightbox } from "@/components/reviews/image-lightbox";

<ImageLightbox 
  images={review.review_images} 
  initialIndex={0}
/>
```

**State Management:**
- `open` - Dialog open/close
- `currentIndex` - Current image index
- Keyboard navigation
- Click outside to close

### Integration in Review Card

**Before:**
```typescript
<div className="grid grid-cols-2 gap-2">
  {images.map(img => (
    <img src={img.image_url} />
  ))}
</div>
```

**After:**
```typescript
<ImageLightbox images={review.review_images} />
// Renders grid + lightbox modal
```

---

## 📱 Responsive Design

### Mobile
- Touch-friendly navigation buttons
- Swipe gestures (browser native)
- Full-screen modal
- Tap to close overlay
- Optimized image loading

### Desktop
- Keyboard navigation
- Mouse hover effects
- Click navigation buttons
- ESC key support
- Larger preview area

### Tablet
- Works on both orientations
- Touch and keyboard support
- Adaptive button sizes

---

## ♿ Accessibility

### Keyboard Support
- ✅ Arrow keys for navigation
- ✅ ESC to close
- ✅ Tab navigation
- ✅ Focus management

### Screen Readers
- ✅ Alt text on images
- ✅ ARIA labels on buttons
- ✅ Semantic HTML
- ✅ Image counter announced

### Touch Support
- ✅ Large tap targets (48x48px min)
- ✅ Clear visual feedback
- ✅ Swipe gestures
- ✅ Pinch to zoom

---

## 🎯 User Experience Improvements

### Before
- Small thumbnail images
- No way to see full size
- Hard to see details
- Poor mobile experience

### After
- ✅ Click to enlarge
- ✅ Full-screen viewing
- ✅ Easy navigation
- ✅ Zoom icon on hover
- ✅ Image counter
- ✅ Keyboard shortcuts
- ✅ Smooth animations
- ✅ Mobile-optimized

---

## 💡 Pro Tips

### For Users

**Desktop:**
- Use keyboard arrows for fast browsing
- Press ESC for quick close
- Hover to see zoom icon

**Mobile:**
- Tap image to view full-size
- Swipe to navigate
- Pinch to zoom in further
- Tap outside to close

### For Developers

**Customization:**
- Change max images: Edit `slice(0, 4)` in component
- Adjust grid: Change `grid-cols-2` to `grid-cols-3`
- Modify transitions: Update Tailwind classes
- Add more keyboard shortcuts: Extend `handleKeyDown`

---

## 🔄 Image Loading

### Optimization
- Lazy loading enabled (browser native)
- CDN delivery (Supabase Storage)
- Cached thumbnails
- Progressive enhancement

### Performance
- Thumbnails: Optimized for grid
- Full-size: Loaded on demand
- Smooth transitions
- No layout shift

---

## 🎨 Customization Options

### Grid Layout

**Change columns:**
```typescript
// 3 columns instead of 2
<div className="mt-3 grid grid-cols-3 gap-2">
```

### Thumbnail Size

**Adjust height:**
```typescript
// Taller thumbnails
className="w-full h-40 object-cover"
```

### Lightbox Background

**Change opacity:**
```typescript
// Darker background
className="max-w-4xl w-full p-0 overflow-hidden bg-black/100"
```

---

## 🐛 Troubleshooting

### Images Not Clickable

**Check:**
- Images uploaded correctly
- `review_images` array populated
- Browser console for errors
- Component imported correctly

### Lightbox Not Opening

**Check:**
- Click event not blocked by parent
- Dialog component installed
- No z-index conflicts
- Browser console for errors

### Images Not Loading

**Check:**
- Supabase Storage bucket exists
- Bucket is public
- Image URLs are valid
- Network tab shows 200 response

### Navigation Not Working

**Check:**
- Multiple images exist
- Arrow buttons visible
- Keyboard events not blocked
- Index state updating

---

## 📊 Technical Details

### Component Structure

```typescript
ImageLightbox
├── Thumbnail Grid
│   ├── Images (2x2 grid)
│   ├── Hover effects
│   ├── Click handlers
│   └── Counter badges
└── Dialog Modal
    ├── Full-size image
    ├── Navigation buttons
    ├── Close button
    ├── Image counter
    └── Keyboard handlers
```

### State Flow

```
Initial: closed, index = 0
    ↓
Click thumbnail → open = true, index = clicked
    ↓
Click arrow → index++/--
    ↓
Press ESC → open = false
    ↓
Click outside → open = false
```

---

## 🚀 Future Enhancements

Planned features:
- [ ] Swipe gestures on mobile
- [ ] Image captions
- [ ] Download button
- [ ] Share image
- [ ] Zoom controls (pinch/wheel)
- [ ] Thumbnail strip in lightbox
- [ ] Image metadata (date, size)
- [ ] Slideshow mode

---

## 📝 Code Examples

### Basic Usage

```typescript
<ImageLightbox 
  images={[
    { id: '1', image_url: 'https://...' },
    { id: '2', image_url: 'https://...' }
  ]} 
/>
```

### With Initial Image

```typescript
<ImageLightbox 
  images={images}
  initialIndex={2}  // Start at 3rd image
/>
```

### Programmatic Control

```typescript
const [isOpen, setIsOpen] = useState(false);

// Open lightbox from button
<Button onClick={() => setIsOpen(true)}>
  View Gallery
</Button>
```

---

## ✅ Summary

**New capabilities:**
- ✅ Click images to view full-size
- ✅ Navigate with arrows or keyboard
- ✅ Smooth transitions & animations
- ✅ Mobile-friendly
- ✅ Hover effects on desktop
- ✅ Image counter badges
- ✅ Dark overlay for focus
- ✅ ESC key to close

**Better UX:**
- Images are now interactive
- Easy to see details
- Professional gallery experience
- Follows modern app patterns

🎉 **Ready to use!** Click any review image to try it.

