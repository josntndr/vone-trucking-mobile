# Vone Trucking - Setup & Run Guide

## Quick Start - Get Running in 10 Minutes!

This guide will help you set up and run the Vone Trucking mobile app for testing.

---

## Prerequisites Check

Before starting, ensure you have:

### Required Software

1. **Node.js** (v18 or higher)
   - Check: Open PowerShell and run: `node --version`
   - If not installed: Download from https://nodejs.org

2. **Expo CLI**
   - Check: `npx expo --version`
   - Will auto-install when you run commands

3. **Git** (Already have it - good!)
   - Check: `git --version`

### For Testing on Your Phone

**Android:**
- Install "Expo Go" app from Google Play Store
- OR have Android Studio installed for emulator

**iOS:**
- Install "Expo Go" app from App Store  
- OR have Xcode installed for simulator (Mac only)

---

## Step 1: Install Dependencies

Open PowerShell in your project folder and run:

```powershell
cd "C:\Users\Joy\OneDrive\Documents\Vone Trucking\vone-trucking-mobile"

# Install all packages
npm install
```

**Expected time:** 2-3 minutes

**What this does:** Downloads all required React Native libraries

---

## Step 2: Install Missing Dependencies

The project needs additional packages that weren't in package.json. Run:

```powershell
# Install Expo packages for features we built
npx expo install expo-notifications expo-device expo-file-system expo-sharing expo-crypto expo-location expo-task-manager

# Install Ionicons for UI
npm install @expo/vector-icons
```

**Expected time:** 1-2 minutes

---

## Step 3: Configure Environment Variables

1. Check if `.env` file exists
2. If not, copy `.env.example` to `.env`:

```powershell
Copy-Item .env.example .env
```

3. Edit `.env` file with your Supabase credentials:

```env
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**Don't have Supabase set up yet?** That's okay! You can still run the app, but some features won't work until backend is connected.

---

## Step 4: Start the Development Server

Run the Expo development server:

```powershell
npm start
```

**OR**

```powershell
npx expo start
```

**Expected output:**
```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
```

**What this does:** Starts the Metro bundler that serves your app

---

## Step 5: Run on Your Device

### Option A: Run on Physical Phone (Easiest!)

**Android:**
1. Install "Expo Go" from Play Store
2. Open Expo Go app
3. Scan the QR code shown in your terminal
4. App will load on your phone!

**iOS:**
1. Install "Expo Go" from App Store
2. Open Camera app (default iPhone camera)
3. Scan the QR code
4. Tap the notification to open in Expo Go
5. App will load on your phone!

### Option B: Run on Emulator/Simulator

**Android Emulator:**
1. Press `a` in the terminal where Expo is running
2. If you have Android Studio installed, emulator will open automatically
3. App loads in the emulator

**iOS Simulator (Mac only):**
1. Press `i` in the terminal
2. Simulator opens automatically
3. App loads in simulator

### Option C: Run in Web Browser

1. Press `w` in the terminal
2. Browser opens at `http://localhost:8081`
3. **Note:** Some features (GPS, camera) won't work in browser

---

## Step 6: Test the App

### Without Backend (Testing UI Only)

Even without a working backend, you can test:

1. **UI Navigation** - Browse through screens
2. **Forms** - Fill out trip details, fuel records
3. **Offline Features** - Everything saves locally
4. **Photo Capture** - Camera functionality
5. **Map Display** - If you add Google Maps API key

### Quick Test Checklist

Try these actions:

- [ ] App loads without crashing
- [ ] Navigate between screens
- [ ] View dashboard (will show empty state)
- [ ] Try to create a trip (form appears)
- [ ] Test offline sync screen (Settings > Sync Queue)
- [ ] Check notifications screen
- [ ] View reports section

---

## Common Issues & Solutions

### Issue 1: "Cannot find module" errors

**Solution:**
```powershell
# Clear cache and reinstall
Remove-Item -Recurse node_modules
Remove-Item package-lock.json
npm install
```

### Issue 2: Metro bundler won't start

**Solution:**
```powershell
# Kill any existing Metro processes
taskkill /F /IM node.exe
# Then start again
npm start
```

### Issue 3: QR code not scanning on phone

**Solution:**
- Ensure phone and computer on same WiFi network
- Try using tunnel mode: `npx expo start --tunnel`
- Or connect via USB and use: `npx expo start --localhost`

### Issue 4: "Expo Go" not opening app

**Solution:**
- Update Expo Go to latest version
- Ensure using compatible Expo SDK version
- Try restarting Expo Go app

### Issue 5: "Unable to resolve module @react-native-async-storage"

**Solution:**
```powershell
npx expo install @react-native-async-storage/async-storage
```

### Issue 6: TypeScript errors

**Solution:**
```powershell
# Install missing type definitions
npm install --save-dev @types/react @types/react-native
```

---

## Development Workflow

### Making Changes

1. Edit any file in `src/` folder
2. Save the file
3. App automatically reloads on your device
4. See changes instantly!

### Hot Reloading

- **Fast Refresh**: Most code changes appear instantly
- **Full Reload**: Press `r` in terminal if needed
- **Clear Cache**: Press `Shift + r` for hard reload

### Debugging

**View Logs:**
- Terminal shows console.log output
- Errors appear in terminal
- On device: Shake phone > "Debug Remote JS"

**React DevTools:**
```powershell
npm install -g react-devtools
react-devtools
```

---

## Setting Up Backend (Optional but Recommended)

To test full functionality, set up Supabase:

### 1. Create Supabase Project

1. Go to https://supabase.com
2. Sign up / Log in
3. Click "New Project"
4. Name it "vone-trucking"
5. Choose a region close to you
6. Wait for project to be ready (~2 minutes)

### 2. Get Your Credentials

1. In Supabase dashboard, go to Settings > API
2. Copy:
   - **Project URL** (looks like: https://xxxxx.supabase.co)
   - **Anon/Public Key** (long string starting with "eyJ...")

### 3. Update .env File

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Run Database Migrations

```powershell
# If you have Supabase CLI installed
supabase db push

# OR manually run SQL files in supabase/migrations folder
# Copy and paste each SQL file content into Supabase SQL Editor
```

### 5. Add Test Data

Use the test data from `docs/TEST_DATA_SETUP.md`:
- Create test users
- Add test trucks
- Add sample trips

---

## Testing Specific Features

### Test Location Tracking

1. **On Real Device** (Required for GPS):
   ```
   - Grant location permissions when prompted
   - Start a test trip
   - Walk around - see location update
   - Check map shows your route
   ```

2. **Location Permissions:**
   - Android: Settings > Apps > Expo Go > Permissions > Location > "Allow all the time"
   - iOS: Settings > Expo Go > Location > "Always"

### Test Camera/Photos

1. Navigate to Add Fuel screen
2. Tap "Take Receipt Photo"
3. Grant camera permission
4. Take a photo
5. Verify photo appears

### Test Offline Mode

1. Enable Airplane mode on device
2. Create a fuel record
3. Take a receipt photo
4. Complete a delivery (if in trip)
5. Check Settings > Sync Queue - see pending items
6. Disable Airplane mode
7. Wait for auto-sync
8. Verify items synced

### Test Notifications

1. Run on physical device (notifications don't work in emulator)
2. Grant notification permission
3. Trigger a test notification
4. Verify appears on device

---

## Building for Production (Later)

When ready to build actual APK/IPA:

### Install EAS CLI

```powershell
npm install -g eas-cli
```

### Configure EAS

```powershell
eas build:configure
```

### Build Android APK

```powershell
eas build --platform android --profile preview
```

### Build iOS IPA

```powershell
eas build --platform ios --profile preview
```

**Note:** Builds happen in the cloud, download when ready.

---

## Project Structure Quick Reference

```
vone-trucking-mobile/
├── app/                    # Expo Router screens (if using)
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── analytics/    # Dashboard components
│   │   └── sync/         # Sync status components
│   ├── screens/          # Main app screens
│   │   └── sync/         # Sync queue screen
│   ├── services/         # Business logic
│   │   ├── analytics/   # Analytics service
│   │   ├── notifications/ # Notification service
│   │   ├── reports/     # Report generation
│   │   └── sync/        # Offline sync service
│   ├── types/           # TypeScript types
│   ├── hooks/           # Custom React hooks
│   ├── navigation/      # Navigation setup
│   ├── state/           # State management
│   └── utils/           # Helper functions
├── docs/                # All documentation
├── assets/              # Images, fonts, etc.
└── supabase/           # Database migrations
```

---

## Quick Commands Reference

| Command | What it Does |
|---------|-------------|
| `npm start` | Start development server |
| `npm run android` | Run on Android |
| `npm run ios` | Run on iOS |
| `npm install` | Install dependencies |
| `npx expo start -c` | Start with cache cleared |
| `npx expo install [package]` | Install Expo-compatible package |
| `npm run web` | Run in browser |

---

## Getting Test Data

### Option 1: Use Mock Data (Easiest)

The services have mock data built-in. Just run the app and navigate through screens.

### Option 2: Manual Test Data

1. Log in as operator
2. Manually create:
   - A test truck
   - Test driver account
   - Test trip
3. Log out, log in as driver
4. Complete the trip workflow

### Option 3: Import from Google Sheets

1. Create a Google Sheet with trip data
2. Set up Google Sheets API credentials
3. Import schedule in app

---

## Next Steps

Now that your app is running:

1. **Explore the UI** - Navigate through all screens
2. **Test Features** - Try creating trips, recording fuel, etc.
3. **Check Documentation** - Read user guides in `docs/` folder
4. **Set Up Backend** - Connect to Supabase for full functionality
5. **Add Test Data** - Use test data setup guide
6. **Run Test Scenarios** - Follow `docs/TEST_SCENARIOS.md`

---

## Need Help?

### Check Logs

**Terminal Logs:**
- Shows all console.log output
- Shows errors and warnings
- Shows network requests

**Device Logs:**
- Shake device
- Tap "Show Performance Monitor"
- Or tap "Debug Remote JS"

### Common Commands for Troubleshooting

```powershell
# Clear everything and start fresh
Remove-Item -Recurse node_modules
Remove-Item package-lock.json
npm install
npx expo start -c

# Check for updates
npx expo-doctor

# Check Expo status
npx expo whoami
```

### Resources

- **Expo Documentation**: https://docs.expo.dev
- **React Native Docs**: https://reactnative.dev
- **Project Docs**: See `docs/` folder
- **Supabase Docs**: https://supabase.com/docs

---

## Video Tutorial (Recommended)

If you prefer video instructions, search YouTube for:
- "Expo React Native Setup Windows"
- "Run Expo App on Android Phone"
- "Expo Go Tutorial"

---

## Success! You're Ready! 🚀

You should now have:
- ✅ App running on your device/emulator
- ✅ Ability to navigate through screens
- ✅ Understanding of project structure
- ✅ Knowledge of how to make changes
- ✅ Debugging tools ready

**Happy testing!** 🚛📱

---

**Last Updated**: August 22, 2024  
**Expo SDK**: ~57.0.15  
**Node Version**: 18+

© 2024 Vone Trucking
