# Authentication Testing Guide

**Date:** 2026-08-24  
**Status:** Ready for Manual Testing  
**Testing Priority:** P0 - Critical

---

## Test Credentials

### Operator/Admin Account
```
Username: vonetruckingadmin
Password: VoneTrucking15
Role: Operator (Admin privileges)
```

### Demo Driver Account
```
Username: driver (or any username containing "driver")
Password: any password
Role: Driver
```

### Demo Porter Account
```
Username: porter (or any username containing "porter"/"helper")
Password: any password
Role: Porter
```

### Demo Operator Account
```
Username: operator (or any username containing "operator"/"admin")
Password: any password
Role: Operator
```

---

## How to Start Testing

### Option 1: Web Testing (Fastest)
```bash
cd vone-trucking-mobile
npx expo start --web --clear
```
Then press `w` to open in browser

### Option 2: iOS Simulator (macOS only)
```bash
cd vone-trucking-mobile
npx expo start --ios --clear
```

### Option 3: Android Emulator
```bash
cd vone-trucking-mobile
npx expo start --android --clear
```

### Option 4: Physical Device
```bash
cd vone-trucking-mobile
npx expo start --clear
```
Then scan QR code with Expo Go app

---

## Authentication Test Scenarios

### Test 1: Operator Login Flow ✅
**Priority:** P0  
**Expected Result:** Login success, redirect to `/(operator)` home screen

**Steps:**
1. Open app
2. Enter username: `vonetruckingadmin`
3. Enter password: `VoneTrucking15`
4. Click "Sign In" button
5. Verify loading indicator appears
6. Verify redirect to Operator home screen
7. Verify user profile shows "System Administrator"
8. Verify top navigation shows operator-specific options

**Pass Criteria:**
- ✅ Login succeeds within 2 seconds
- ✅ Redirected to `/(operator)` route
- ✅ User info displayed correctly
- ✅ Session persists on app reload

---

### Test 2: Driver Login Flow ✅
**Priority:** P0  
**Expected Result:** Login success, redirect to `/(driver)` home screen

**Steps:**
1. Logout if already logged in
2. Enter username: `driver` (or `testdriver`, `driveruser`, etc.)
3. Enter any password
4. Click "Sign In" button
5. Verify redirect to Driver home screen
6. Verify user profile shows "Juan Dela Cruz"
7. Verify driver-specific navigation appears

**Pass Criteria:**
- ✅ Login succeeds
- ✅ Redirected to `/(driver)` route
- ✅ Cannot access operator routes
- ✅ Driver ID: DR-001 visible

---

### Test 3: Porter Login Flow ✅
**Priority:** P0  
**Expected Result:** Login success, redirect to `/(porter)` home screen

**Steps:**
1. Logout if already logged in
2. Enter username: `porter` (or `helper`, `porteruser`, etc.)
3. Enter any password
4. Click "Sign In" button
5. Verify redirect to Porter home screen
6. Verify user profile shows "Pedro Reyes"
7. Verify porter-specific navigation appears

**Pass Criteria:**
- ✅ Login succeeds
- ✅ Redirected to `/(porter)` route
- ✅ Cannot access operator/driver routes
- ✅ Porter ID: PT-001 visible

---

### Test 4: Invalid Credentials ❌
**Priority:** P0  
**Expected Result:** Error message displayed, no login

**Steps:**
1. Enter username: `invaliduser`
2. Enter password: `wrongpassword`
3. Click "Sign In" button
4. Verify error banner appears

**Pass Criteria:**
- ✅ Error: "Username or password is incorrect."
- ✅ Red error banner visible
- ✅ User remains on login screen
- ✅ Fields not cleared (user can retry)

---

### Test 5: Empty Fields Validation ❌
**Priority:** P0  
**Expected Result:** Inline validation errors

**Steps:**
1. Leave username empty
2. Leave password empty
3. Click "Sign In" button
4. Verify validation errors appear

**Pass Criteria:**
- ✅ Username error: "Username is required"
- ✅ Password error: "Password is required"
- ✅ Errors shown inline below fields
- ✅ No API call made
- ✅ Sign In button does not show loading

---

### Test 6: Username Only Validation ❌
**Priority:** P0  
**Expected Result:** Password validation error

**Steps:**
1. Enter username: `operator`
2. Leave password empty
3. Click "Sign In" button

**Pass Criteria:**
- ✅ Password error: "Password is required"
- ✅ Username error NOT shown
- ✅ No API call made

---

### Test 7: Password Only Validation ❌
**Priority:** P0  
**Expected Result:** Username validation error

**Steps:**
1. Leave username empty
2. Enter password: `test123`
3. Click "Sign In" button

**Pass Criteria:**
- ✅ Username error: "Username is required"
- ✅ Password error NOT shown
- ✅ No API call made

---

### Test 8: Password Visibility Toggle 👁️
**Priority:** P1  
**Expected Result:** Password show/hide works

**Steps:**
1. Enter password: `Test123!`
2. Verify password shown as dots (•••••••)
3. Click eye icon
4. Verify password visible as plain text
5. Click eye icon again
6. Verify password hidden again

**Pass Criteria:**
- ✅ Eye icon changes from `eye-outline` to `eye-off-outline`
- ✅ Password toggles between hidden/visible
- ✅ Icon color consistent (#9CA3AF)

---

### Test 9: Input Focus States 🎨
**Priority:** P2  
**Expected Result:** Visual feedback on focus

**Steps:**
1. Click username field
2. Verify border changes to navy (#1B2A4A)
3. Verify icon changes to navy
4. Click password field
5. Verify same behavior

**Pass Criteria:**
- ✅ Border changes to 2px navy on focus
- ✅ Icon changes to navy on focus
- ✅ Subtle shadow enhancement
- ✅ Smooth visual transition

---

### Test 10: Error State Styling 🔴
**Priority:** P1  
**Expected Result:** Error styling applied

**Steps:**
1. Submit form with empty username
2. Verify field border turns red
3. Verify error text appears below
4. Start typing in username field
5. Verify error disappears immediately

**Pass Criteria:**
- ✅ Red border (#D32F2F) on error
- ✅ Red error text below field
- ✅ Error clears on user input
- ✅ General error banner shows red background

---

### Test 11: Loading State ⏳
**Priority:** P0  
**Expected Result:** Loading indicator during auth

**Steps:**
1. Enter valid credentials
2. Click "Sign In" button
3. Verify loading spinner appears
4. Verify button disabled during load
5. Verify opacity reduced

**Pass Criteria:**
- ✅ ActivityIndicator shows on button
- ✅ Button disabled (no double-submit)
- ✅ Opacity: 0.6 during load
- ✅ Input fields disabled during load

---

### Test 12: Keyboard Handling ⌨️
**Priority:** P1  
**Expected Result:** Smooth keyboard interaction

**Steps:**
1. Click username field
2. Verify keyboard appears
3. Verify form scrollable
4. Verify Sign In button still accessible
5. Press "Next" on keyboard
6. Verify focus moves to password field
7. Press "Go" on keyboard
8. Verify login triggered

**Pass Criteria:**
- ✅ KeyboardAvoidingView works correctly
- ✅ Form scrollable when keyboard open
- ✅ returnKeyType works (next → go)
- ✅ onSubmitEditing triggers login

---

### Test 13: Role-Based Routing 🛣️
**Priority:** P0  
**Expected Result:** Correct route after login

**Test Matrix:**

| Username Pattern | Expected Role | Expected Route |
|-----------------|---------------|----------------|
| `vonetruckingadmin` | Operator | `/(operator)` |
| `operator` | Operator | `/(operator)` |
| `admin` | Operator | `/(operator)` |
| `testadmin` | Operator | `/(operator)` |
| `driver` | Driver | `/(driver)` |
| `drivertest` | Driver | `/(driver)` |
| `johndriversmith` | Driver | `/(driver)` |
| `porter` | Porter | `/(porter)` |
| `helper` | Porter | `/(porter)` |
| `porteruser` | Porter | `/(porter)` |

**Pass Criteria:**
- ✅ Each username routes to correct home screen
- ✅ Navigation specific to role appears
- ✅ User cannot access other role routes

---

### Test 14: Session Persistence 💾
**Priority:** P0  
**Expected Result:** Session survives app reload

**Steps:**
1. Login as operator
2. Close app (or refresh browser)
3. Reopen app
4. Verify still logged in
5. Verify still on operator home screen

**Pass Criteria:**
- ✅ AsyncStorage stores demo user
- ✅ Session token stored
- ✅ User redirected to correct role home
- ✅ No re-login required

---

### Test 15: Logout and Re-login 🔄
**Priority:** P0  
**Expected Result:** Clean logout and re-login

**Steps:**
1. Login as operator
2. Navigate to profile
3. Click logout (if available)
4. Verify redirect to login screen
5. Login as driver
6. Verify session switched correctly
7. Verify driver home screen shows

**Pass Criteria:**
- ✅ Logout clears AsyncStorage
- ✅ Session token removed
- ✅ Redirect to login screen
- ✅ Can login as different role
- ✅ Previous session fully cleared

---

### Test 16: Responsive Design (Mobile Sizes) 📱
**Priority:** P1  
**Expected Result:** Works on all screen sizes

**Test Breakpoints:**

| Device | Width | Expected Behavior |
|--------|-------|-------------------|
| iPhone SE | 320px | All elements visible, readable, touchable |
| Android Standard | 360px | Proper spacing, no overlap |
| iPhone 12/13/14 | 390px | Optimal layout |
| iPhone 14 Pro Max | 430px | Spacious layout, proper scaling |

**Pass Criteria:**
- ✅ Navy header scales properly
- ✅ Rounded corners visible
- ✅ Form fields full width with padding
- ✅ Touch targets minimum 44x44px
- ✅ Text readable at all sizes
- ✅ No horizontal scroll

---

### Test 17: Accessibility - Touch Targets 🎯
**Priority:** P1  
**Expected Result:** All interactive elements easily tappable

**Measurements:**
- Sign In button: 56px height ✅
- Input fields: 56px height ✅
- Eye icon hitSlop: 10px all sides ✅
- Forgot password link: 14px font + 8px padding ✅

**Pass Criteria:**
- ✅ All touch targets ≥ 44x44px
- ✅ Sufficient spacing between elements
- ✅ Eye icon tappable even with fingers

---

### Test 18: Security - Password Handling 🔒
**Priority:** P0  
**Expected Result:** Secure password handling

**Validation:**
1. Check AsyncStorage never stores password ✅
2. Verify password never logged to console
3. Verify secureTextEntry by default
4. Verify session tokens use secure format

**Pass Criteria:**
- ✅ Password NOT in AsyncStorage
- ✅ Only username saved for "Remember me"
- ✅ Session tokens use random generation
- ✅ Demo mode clearly marked
- ✅ Production TODO comments present

---

### Test 19: Network Simulation - Slow Connection 🐌
**Priority:** P1  
**Expected Result:** Graceful handling of slow network

**Steps:**
1. Enable slow network (Chrome DevTools or similar)
2. Enter credentials
3. Click "Sign In"
4. Verify loading indicator shows
5. Verify no timeout errors
6. Verify eventual success or error

**Pass Criteria:**
- ✅ Loading indicator shows immediately
- ✅ Button remains disabled
- ✅ User cannot double-submit
- ✅ 800ms delay handled properly

---

### Test 20: Error Recovery Flow 🔄
**Priority:** P1  
**Expected Result:** User can recover from errors

**Steps:**
1. Submit invalid credentials
2. Verify error banner appears
3. Correct username
4. Verify error banner disappears
5. Verify inline errors clear
6. Submit valid credentials
7. Verify successful login

**Pass Criteria:**
- ✅ Errors clear on user input
- ✅ General error cleared on retry
- ✅ Fields retain values during error
- ✅ User can retry without refresh

---

## Post-Login Verification Checklist

After successful login, verify:

### For Operator Role:
- [ ] Home screen shows analytics dashboard
- [ ] Top navigation has: Trips, Fleet, Employees, Analytics, Profile
- [ ] Can access all operator routes
- [ ] Cannot access `/(driver)` or `/(porter)` routes directly
- [ ] Profile shows: System Administrator (Employee ID: ADMIN-001)

### For Driver Role:
- [ ] Home screen shows active trip or "No active trip"
- [ ] Bottom navigation has: Home, Trips, Reports, Profile
- [ ] Can access all driver routes
- [ ] Cannot access `/(operator)` or `/(porter)` routes
- [ ] Profile shows: Juan Dela Cruz (Employee ID: DR-001)

### For Porter Role:
- [ ] Home screen shows current assignment
- [ ] Bottom navigation has: Home, Trips, Reports, Profile
- [ ] Can access all porter routes
- [ ] Cannot access `/(operator)` or `/(driver)` routes
- [ ] Profile shows: Pedro Reyes (Employee ID: PT-001)

---

## Known Issues / Technical Debt

### Current Implementation Notes:
1. **Demo Authentication Only**: Currently using demo auth service
   - Production requires Supabase or custom backend integration
   - Session tokens are demo format only
   - All credentials are hardcoded for development

2. **Remember Me Storage**: Uses AsyncStorage instead of secure storage
   - TODO: Replace with expo-secure-store or react-native-keychain
   - Security risk if device compromised

3. **Username-Based Role Detection**: Demo mode uses username pattern matching
   - Production should use proper role from backend
   - Current logic in LoginScreen.tsx lines 136-153

4. **Session Timeout**: Not implemented
   - TODO: Add auto-logout after inactivity
   - Add session expiration handling

5. **Multi-Device Sessions**: Not handled
   - TODO: Implement device management
   - Add concurrent session limits

---

## Test Execution Log

| Test # | Test Name | Status | Date | Tester | Notes |
|--------|-----------|--------|------|--------|-------|
| 1 | Operator Login | ⏸️ Pending | - | - | - |
| 2 | Driver Login | ⏸️ Pending | - | - | - |
| 3 | Porter Login | ⏸️ Pending | - | - | - |
| 4 | Invalid Credentials | ⏸️ Pending | - | - | - |
| 5 | Empty Fields | ⏸️ Pending | - | - | - |
| 6 | Username Only | ⏸️ Pending | - | - | - |
| 7 | Password Only | ⏸️ Pending | - | - | - |
| 8 | Password Toggle | ⏸️ Pending | - | - | - |
| 9 | Focus States | ⏸️ Pending | - | - | - |
| 10 | Error Styling | ⏸️ Pending | - | - | - |
| 11 | Loading State | ⏸️ Pending | - | - | - |
| 12 | Keyboard | ⏸️ Pending | - | - | - |
| 13 | Role Routing | ⏸️ Pending | - | - | - |
| 14 | Session Persist | ⏸️ Pending | - | - | - |
| 15 | Logout/Re-login | ⏸️ Pending | - | - | - |
| 16 | Responsive | ⏸️ Pending | - | - | - |
| 17 | Touch Targets | ⏸️ Pending | - | - | - |
| 18 | Security | ⏸️ Pending | - | - | - |
| 19 | Slow Network | ⏸️ Pending | - | - | - |
| 20 | Error Recovery | ⏸️ Pending | - | - | - |

---

## Quick Reference Commands

```bash
# Start web (fastest for testing)
npm run web

# Start with cache clear
npx expo start --clear

# Check TypeScript errors
npx tsc --noEmit

# Check expo configuration
npx expo-doctor

# View demo users
cat src/services/demo/demoAuth.service.ts
```

---

**Test Guide Created:** 2026-08-24  
**Status:** Ready for Manual Testing  
**Next Step:** Start app and begin Test #1
