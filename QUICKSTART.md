# Vone Trucking Mobile - Quick Start Guide

Get the mobile app up and running quickly for development and testing.

## Prerequisites

- Node.js 18+ installed
- npm or yarn installed
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator installed
- Expo Go app on physical device (optional)

## Installation

```bash
# Navigate to mobile directory
cd vone-trucking-mobile

# Install dependencies
npm install

# Start development server
npx expo start
```

## Running the App

### Option 1: Physical Device

1. Install Expo Go from App Store (iOS) or Play Store (Android)
2. Scan QR code from terminal with your device camera
3. App opens in Expo Go

### Option 2: Simulator/Emulator

```bash
# iOS (Mac only)
npx expo start --ios

# Android
npx expo start --android
```

## Project Structure Overview

```
vone-trucking-mobile/
├── app/
│   ├── (driver)/           # Driver screens (4 tabs)
│   │   ├── index.tsx       # Home
│   │   ├── trips/          # Trip management
│   │   ├── reports/        # Reporting
│   │   └── profile/        # Profile & settings
│   └── (porter)/           # Porter screens (3 tabs)
│       ├── index.tsx       # Home
│       ├── trips/          # Trip details
│       ├── reports/        # Product reports
│       └── profile/        # Profile
├── src/
│   ├── types/              # TypeScript types
│   ├── services/           # API services
│   ├── components/         # Reusable components
│   ├── hooks/              # Custom hooks
│   ├── theme/              # Theme and styling
│   └── utils/              # Utilities
├── TESTING.md              # Testing guide (30 tests)
├── IMPLEMENTATION_SUMMARY.md  # Complete documentation
└── QUICKSTART.md           # This file
```

## Testing Workflows

### Driver Workflow

1. Start app → Automatically opens to Driver Home (`app/(driver)/index.tsx`)
2. View current trip and assignments
3. Tap a trip → See trip details
4. Try status updates (mock data)
5. Go to Reports tab → Submit delay/incident/truck reports
6. Go to Profile tab → View fuel, receipts, history, payslips

### Porter Workflow

To test porter workflow:

1. Manually navigate to porter routes (not yet implemented: role-based routing)
2. Edit `app/_layout.tsx` or browser URL to go to `/(porter)/`
3. View assignments and trip details
4. Test time tracking (clock in/out)
5. Complete loading/delivery checklists
6. Submit product discrepancy reports

### Offline Support Testing

1. Enable airplane mode or disable internet
2. Submit actions (they'll queue)
3. Tap sync button in header to see queue
4. Re-enable internet → Actions auto-sync

## Key Commands

```bash
# Start development server
npx expo start

# Start with cache clear
npx expo start --clear

# Run on specific platform
npx expo start --ios
npx expo start --android

# Build for production
npx expo build:ios
npx expo build:android
```

## Mock Data

All data is currently mocked in `src/services/api/driver-porter.service.ts`:

- **Assignments:** Returns sample trips for today/upcoming/completed
- **Dashboard Stats:** Returns sample counts
- **All submissions:** Return success messages without actual API calls

To connect to real backend:
1. Update base URL in service file
2. Replace mock return statements with actual `fetch()` calls
3. Handle authentication tokens

## Common Issues & Solutions

### Issue: Metro bundler not starting

```bash
# Clear cache and restart
npx expo start --clear
```

### Issue: "Unable to resolve module"

```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### Issue: iOS build fails

```bash
# Reinstall pods (iOS only)
cd ios
pod install
cd ..
```

### Issue: Android build fails

```bash
# Clean Android build
cd android
./gradlew clean
cd ..
```

## Environment Setup (TODO)

Create `.env` file for configuration:

```env
API_BASE_URL=https://api.vonetrucking.com
GOOGLE_MAPS_API_KEY=your_key_here
FIREBASE_API_KEY=your_key_here
```

## Next Steps

1. **Review Documentation:**
   - [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Complete feature list
   - [TESTING.md](./TESTING.md) - 30 test cases with procedures

2. **Run Tests:**
   - Go through driver workflow (Tests 1-14)
   - Go through porter workflow (Tests 15-23)
   - Test offline support (Tests 24-30)

3. **Implement Missing Features:**
   - Photo upload (expo-image-picker)
   - Location services (expo-location)
   - Real API integration
   - Signature capture

4. **Deploy:**
   - Configure production environment
   - Build for iOS (TestFlight)
   - Build for Android (Play Console)

## Development Tips

### Hot Reload

- Shake device or press `Cmd/Ctrl + D` → Enable Fast Refresh
- Changes auto-reload as you save files

### Debugging

```bash
# Remote debugging
Press `Cmd/Ctrl + D` → "Debug Remote JS"
Opens Chrome DevTools
```

### Testing on Multiple Devices

- Each device can scan the same QR code
- Test driver on one device, porter on another
- Changes reflect immediately on all connected devices

### Component Development

All reusable components are in `src/components/`:
- `common/` - Generic UI components (Card, Button, etc.)
- `sync/` - Offline sync specific components

### Adding New Screens

1. Create file in appropriate directory (`app/(driver)/` or `app/(porter)/`)
2. Export default component
3. File-based routing handles the rest
4. Update `_layout.tsx` if adding to navigation

### Styling

- All screens use theme from `src/theme/ThemeProvider`
- Colors, spacing, typography centralized
- Use `StyleSheet.create()` for styles
- Inline styles for dynamic values only

## Useful Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [React Navigation](https://reactnavigation.org/)

## Support & Questions

For issues or questions:

1. Check [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Known limitations section
2. Review [TESTING.md](./TESTING.md) - Specific test cases
3. Check component JSDoc comments in code
4. Review type definitions in `src/types/`

## Quick Reference

### File Locations

- Types: `src/types/driver-porter.types.ts`
- Services: `src/services/api/driver-porter.service.ts`
- Offline Hook: `src/hooks/useOfflineSync.ts`
- Theme: `src/theme/ThemeProvider.tsx`
- Utils: `src/utils/philippines.ts`

### Key Types

```typescript
Assignment, Trip, TripStatus
DelayReport, IncidentReport, TruckProblemReport
LoadingChecklist, DeliveryChecklist, ProductDiscrepancy
Payslip, CashAdvance, Notification
SyncStatus
```

### Key Functions

```typescript
getMyAssignments(filter)
updateTripStatus(payload)
submitDelayReport(report)
submitLoadingChecklist(checklist)
useOfflineSync() // Hook for offline support
```

---

**Happy Coding!** 🚚📱

For detailed documentation, see [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
