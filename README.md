# Vone Trucking Mobile App

**Track Every Trip. Manage Every Move.**

A cross-platform mobile application for Vone Trucking built with React Native, Expo, and TypeScript.

## 🚀 Features

- ✅ Cross-platform (Android & iOS)
- ✅ TypeScript for type safety
- ✅ Expo Router for file-based navigation
- ✅ Complete design system with Vone Trucking branding
- ✅ Authentication with Supabase
- ✅ Offline support with SQLite
- ✅ Form validation with React Hook Form & Zod
- ✅ Light and dark theme support
- ✅ Accessible components

## 🎨 Design System

### Brand Colors
- **Primary**: Deep Navy (#1A237E)
- **Accent**: Orange/Amber (#FFA000)
- **Success**: Green (#4CAF50)
- **Error**: Red (#F44336)
- **Warning**: Amber (#FF9800)

### Typography
- Accessible font sizes and weights
- Line heights optimized for readability
- Consistent spacing scale

### Components
- Button (multiple variants)
- Input fields (with password toggle)
- Cards
- Status chips
- Modals & dialogs
- Loading & error states
- Empty states

## 📁 Project Structure

```
vone-trucking-mobile/
├── app/                      # Expo Router screens
│   ├── (auth)/              # Authentication flow
│   │   ├── welcome.tsx      # Landing screen
│   │   ├── login.tsx        # Sign in
│   │   ├── register.tsx     # Sign up
│   │   └── forgot-password.tsx
│   ├── (tabs)/              # Main app tabs
│   │   ├── index.tsx        # Home/Dashboard
│   │   ├── trips.tsx        # Trips list
│   │   └── profile.tsx      # User profile
│   ├── _layout.tsx          # Root layout
│   └── index.tsx            # Entry point
├── src/
│   ├── components/          # Reusable components
│   │   ├── ui/             # UI components
│   │   ├── forms/          # Form components
│   │   └── layout/         # Layout components
│   ├── features/           # Feature modules
│   ├── screens/            # Additional screens
│   ├── navigation/         # Navigation utilities
│   ├── services/           # API & database services
│   │   ├── api/           # Supabase services
│   │   └── database/      # SQLite services
│   ├── hooks/             # Custom hooks
│   ├── state/             # State management
│   ├── validation/        # Zod schemas
│   ├── types/             # TypeScript types
│   ├── utils/             # Utility functions
│   ├── constants/         # App constants
│   ├── theme/             # Theme system
│   └── config/            # Configuration
├── assets/                # Static assets
└── .env                   # Environment variables

```

## 🛠️ Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo CLI
- Android Studio (for Android) or Xcode (for iOS)

### Installation

1. **Clone the repository**
   ```bash
   cd "vone-trucking-mobile"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy `.env.example` to `.env` and fill in your values:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   EXPO_PUBLIC_API_URL=your_api_url
   EXPO_PUBLIC_APP_ENV=development
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on device/emulator**
   - Press `a` for Android
   - Press `i` for iOS
   - Scan QR code with Expo Go app

## 📱 Running the App

### Development
```bash
npm start          # Start Metro bundler
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run in web browser
```

### Building
```bash
# For production builds, use EAS Build
npx expo install expo-dev-client
eas build --platform android
eas build --platform ios
```

## 🔐 Authentication

The app uses Supabase for authentication. Features include:
- Email/password sign in
- User registration
- Password reset
- Session persistence
- Automatic token refresh

## 💾 Offline Support

Built-in SQLite database for:
- Local data caching
- Offline operation queue
- Automatic sync when online
- Network state monitoring

## 🧪 Testing

TypeScript type checking:
```bash
npx tsc --noEmit
```

## 📦 Dependencies

### Core
- React Native 0.86+
- Expo SDK 57
- TypeScript 6+
- Expo Router

### UI & Styling
- React Native Safe Area Context
- React Native Screens

### Forms & Validation
- React Hook Form
- Zod
- @hookform/resolvers

### Backend & Storage
- @supabase/supabase-js
- Expo SQLite
- AsyncStorage

### Network
- @react-native-community/netinfo

## 🎯 Next Steps

The foundation is complete. Ready to add:
1. Trip management features
2. Driver assignment
3. Vehicle tracking
4. Load management
5. Document upload
6. Notifications
7. Reporting & analytics

## 📄 License

Private - Vone Trucking

## 🤝 Contributing

This is a private project. Contact the development team for contribution guidelines.

---

Built with ❤️ for Vone Trucking
