# MTKCx Mobile App Deployment Guide

## Phase 1: Project Setup (✅ COMPLETED)
The mobile configuration is now ready! Here's what has been prepared:

### ✅ Capacitor Configuration Updated
- App ID: `com.mtkcx.mobile`
- App Name: `MTKCx`
- Production-ready settings
- Native plugin configurations

### ✅ Icon & Splash Screen Placeholders Created
All required icon sizes for iOS and Android have been prepared in the `resources/` folder.

## Phase 2: Your Action Items

### Step 1: Export to GitHub
1. Click the GitHub button in the top right of Lovable
2. Click "Export to GitHub" 
3. Create a new repository (e.g., "mtkcx-mobile-app")

### Step 2: Set Up Development Environment

#### Prerequisites:
- **Mac computer** (required for iOS development)
- **Xcode** (free from Mac App Store)
- **Android Studio** (free download)
- **Node.js** (version 16 or higher)

#### Installation Commands:
```bash
# Clone your repository
git clone [YOUR_GITHUB_REPO_URL]
cd mtkcx-mobile-app

# Install dependencies
npm install

# Add mobile platforms
npx cap add ios
npx cap add android

# Build the project
npm run build

# Sync with native platforms
npx cap sync

# Open in native IDEs
npx cap open ios     # Opens Xcode
npx cap open android # Opens Android Studio
```

### Step 3: Replace Placeholder Icons
You need to replace the placeholder icons in the `resources/` folder with actual MTKCx branded icons:

#### Required Icon Sizes:
**iOS Icons:**
- 1024x1024 (App Store)
- 180x180 (iPhone)
- 167x167 (iPad Pro)
- 152x152 (iPad)
- 120x120 (iPhone)
- 76x76 (iPad)

**Android Icons:**
- 192x192 (XXXHDPI)
- 144x144 (XXHDPI)  
- 96x96 (XHDPI)
- 72x72 (HDPI)
- 48x48 (MDPI)
- 36x36 (LDPI)

### Step 4: Test on Device/Emulator
```bash
# For iOS (requires Mac + Xcode)
npx cap run ios

# For Android
npx cap run android
```

## Phase 3: App Store Preparation

### Developer Accounts Needed:
1. **Apple Developer Program** - $99/year
   - Sign up at: https://developer.apple.com/programs/
   
2. **Google Play Console** - $25 one-time
   - Sign up at: https://play.google.com/console/

### App Store Information Required:
- App name: "MTKCx"
- App description
- Keywords
- Screenshots (required sizes for each device)
- Privacy policy URL
- App category: Business/Productivity

## Phase 4: Build for Production

### iOS Production Build:
1. Open Xcode
2. Select "Any iOS Device" 
3. Product → Archive
4. Upload to App Store Connect

### Android Production Build:
```bash
# Generate signed APK/AAB
cd android
./gradlew bundleRelease
```

## Environment Variables Setup
Create a `.env.production` file with:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Testing Checklist:
- [ ] App opens successfully
- [ ] All navigation works
- [ ] Camera functionality works
- [ ] Authentication works
- [ ] Product catalog loads
- [ ] Cart functionality works
- [ ] Checkout process works
- [ ] All mobile-specific features work

## Support:
If you encounter any issues during setup, I'll help you troubleshoot each step!

## Next Steps:
1. Export to GitHub now
2. Set up your development environment
3. Test the app locally
4. Create developer accounts
5. Replace placeholder icons
6. Submit to app stores

Let me know when you've completed Step 1 (GitHub export) and I'll help you with the next steps!