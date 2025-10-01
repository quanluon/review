# PWA Setup with Serwist

This project has been configured as a Progressive Web App (PWA) using Serwist.

## What's Configured

### 1. Service Worker (`src/app/sw.ts`)
- **Precaching**: Automatically caches static assets during installation
- **Runtime Caching Strategies**:
  - Google Fonts: CacheFirst for webfonts, StaleWhileRevalidate for stylesheets
  - Static Assets: Appropriate caching strategies for images, fonts, CSS, and JS
  - Next.js Assets: Optimized caching for Next.js image optimization and data
  - API Calls: NetworkFirst strategy with fallback

### 2. Service Worker Registration (`src/app/register-sw.tsx`)
- Client-side registration component
- Only registers in production mode
- Automatically integrated into the root layout

### 3. Web App Manifest (`public/manifest.json`)
- Defines PWA metadata (name, icons, theme colors)
- Enables "Add to Home Screen" functionality
- Currently uses an SVG icon placeholder

### 4. Build Configuration (`next.config.ts`)
- Serwist only runs during production builds
- Configured to avoid conflicts with Next.js Turbopack in development
- Generates `/sw.js` in the public folder during build

## Important Notes

### Icons
The current manifest uses a placeholder SVG icon. For production, you should:

1. **Generate PNG icons** in the following sizes:
   - 192x192 pixels
   - 512x512 pixels
   
2. **Update the manifest** (`public/manifest.json`) to reference the PNG icons:
   ```json
   "icons": [
     {
       "src": "/icons/icon-192x192.png",
       "sizes": "192x192",
       "type": "image/png"
     },
     {
       "src": "/icons/icon-512x512.png",
       "sizes": "512x512",
       "type": "image/png"
     }
   ]
   ```

You can use tools like:
- [PWA Asset Generator](https://www.npmjs.com/package/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- Online tools like [Favicon.io](https://favicon.io/)

### Development vs Production

- **Development (`npm run dev`)**: Service worker is NOT active (uses Turbopack for fast refresh)
- **Production (`npm run build`)**: Service worker is generated and will be registered

### Testing the PWA

1. Build the project:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

3. Open in browser and check:
   - DevTools > Application > Service Workers (should show registered SW)
   - DevTools > Application > Manifest (should show PWA manifest)
   - DevTools > Lighthouse > Run PWA audit

### Customization

You can customize the caching strategies in `src/app/sw.ts`:

- **CacheFirst**: Best for static assets that rarely change
- **NetworkFirst**: Best for API calls and dynamic content
- **StaleWhileRevalidate**: Best for assets that can show stale content while updating

## Files Added/Modified

### New Files:
- `src/app/sw.ts` - Service worker implementation
- `src/app/register-sw.tsx` - Service worker registration component
- `public/icons/icon.svg` - Placeholder PWA icon
- `.gitignore` - Updated to exclude generated SW files

### Modified Files:
- `src/app/layout.tsx` - Added service worker registration
- `next.config.ts` - Configured Serwist integration
- `package.json` - Removed Turbopack from build script
- `public/manifest.json` - Already present, verified configuration

## Further Reading

- [Serwist Documentation](https://serwist.pages.dev/)
- [PWA Best Practices](https://web.dev/learn/pwa/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

