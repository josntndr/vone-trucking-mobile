# 🚀 Quick Start - Run in 5 Steps!

## Step 1: Install Dependencies

Open PowerShell in this folder and run:

```powershell
npm install
```

Wait for it to complete (2-3 minutes).

---

## Step 2: Install Additional Packages

```powershell
npx expo install expo-notifications expo-device expo-file-system expo-sharing expo-crypto expo-location expo-task-manager
```

```powershell
npm install @expo/vector-icons
```

---

## Step 3: Start the App

```powershell
npm start
```

You'll see a QR code appear in the terminal.

---

## Step 4: Run on Your Phone

### Android:
1. Install "Expo Go" from Play Store
2. Open Expo Go
3. Scan the QR code with Expo Go app
4. App loads on your phone!

### iOS:
1. Install "Expo Go" from App Store
2. Open Camera app
3. Scan the QR code
4. Tap notification to open in Expo Go
5. App loads!

---

## Step 5: Test the App!

The app is now running on your phone. Try:
- Navigate through screens
- Create a test trip
- View the dashboard
- Check offline sync features

---

## If Something Goes Wrong

### Clear and Reinstall:
```powershell
Remove-Item -Recurse node_modules
Remove-Item package-lock.json
npm install
npm start
```

### Start with Clean Cache:
```powershell
npx expo start -c
```

### Kill Existing Processes:
```powershell
taskkill /F /IM node.exe
npm start
```

---

## That's It!

Your app should be running now. 

For more detailed instructions, see **SETUP_AND_RUN_GUIDE.md**

Happy testing! 🎉
