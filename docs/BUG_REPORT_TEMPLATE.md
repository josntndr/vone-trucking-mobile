# Bug Report Template

## Bug ID: [BUG-XXX]

### Basic Information
- **Date Reported**: YYYY-MM-DD
- **Reported By**: [Tester Name]
- **Priority**: [P0 / P1 / P2 / P3]
- **Severity**: [Critical / High / Medium / Low]
- **Status**: [New / In Progress / Fixed / Verified / Closed / Won't Fix]

### Environment
- **Device**: [e.g., Samsung Galaxy S21, iPhone 13 Pro]
- **OS Version**: [e.g., Android 13, iOS 16.2]
- **App Version**: [e.g., 1.0.0 build 42]
- **Network**: [Online / Offline / Weak (2G/3G)]
- **User Role**: [Operator / Driver / Porter]

### Bug Description
**Title**: [Brief, clear description of the issue]

**Summary**: 
[Detailed description of what's wrong, including expected vs actual behavior]

### Steps to Reproduce
1. [First step]
2. [Second step]
3. [Continue...]
4. [Final step that triggers the bug]

### Expected Result
[What should happen]

### Actual Result
[What actually happens]

### Frequency
- [ ] Always (100%)
- [ ] Often (>75%)
- [ ] Sometimes (25-75%)
- [ ] Rarely (<25%)
- [ ] Once

### Impact
**Users Affected**: [All / Operators only / Drivers only / Porters only / Specific scenario]

**Business Impact**:
- [ ] Blocks critical workflow
- [ ] Data loss possible
- [ ] User experience degraded
- [ ] Performance issue
- [ ] Minor inconvenience
- [ ] Cosmetic only

### Workaround
[If any workaround exists, describe it here]

### Screenshots/Videos
[Attach or link to visual evidence]

### Logs
```
[Paste relevant console logs, error messages, or stack traces]
```

### Additional Context
[Any other relevant information: related features, previous similar bugs, etc.]

---

## Priority Guidelines

### P0 - Critical
- App crashes
- Data loss
- Security vulnerabilities
- Cannot login
- Complete workflow blocked
- Payment/financial calculation errors

### P1 - High
- Major feature doesn't work
- Incorrect data displayed
- Offline sync fails
- Notifications not sent
- Reports incorrect

### P2 - Medium
- Minor feature issue
- UI element misaligned
- Slow performance
- Missing validation
- Unclear error message

### P3 - Low
- Cosmetic issues
- Minor text errors
- Enhancement requests
- Nice-to-have features

---

## Example Bug Reports

### Example 1: Critical Bug

**Bug ID**: BUG-001  
**Priority**: P0  
**Severity**: Critical

**Device**: Samsung Galaxy S21  
**OS**: Android 13  
**App Version**: 1.0.0  
**Role**: Driver

**Title**: App crashes when completing trip offline

**Summary**: When attempting to complete a trip while offline, the app crashes immediately after tapping "Confirm Completion". This prevents drivers from finishing their workflow when network is unavailable.

**Steps to Reproduce**:
1. Login as driver
2. Start a trip normally
3. Enable airplane mode on device
4. Navigate to trip details
5. Tap "Complete Trip"
6. Enter ending odometer
7. Tap "Confirm Completion"

**Expected Result**: Trip should be marked complete locally and queued for sync

**Actual Result**: App crashes with error "Cannot read property 'sync' of undefined"

**Frequency**: Always (100%)

**Impact**: Critical - blocks primary driver workflow when offline

**Workaround**: Stay online while completing trips (not acceptable for field use)

**Logs**:
```
Error: Cannot read property 'sync' of undefined
  at OfflineSyncService.queueForSync (OfflineSyncService.ts:127)
  at TripScreen.handleCompleteTrip (TripScreen.tsx:89)
```

---

### Example 2: High Priority Bug

**Bug ID**: BUG-002  
**Priority**: P1  
**Severity**: High

**Device**: iPhone 13 Pro  
**OS**: iOS 16.2  
**App Version**: 1.0.0  
**Role**: Operator

**Title**: Trip profit calculation incorrect when multiple expenses

**Summary**: Dashboard shows incorrect profit for trips with more than one expense. The calculation appears to only include the first expense, ignoring subsequent ones.

**Steps to Reproduce**:
1. Login as operator
2. Create/view a trip with:
   - Income: KES 15,000
   - Fuel: KES 7,000
   - Toll: KES 500
   - Parking: KES 200
3. Check analytics dashboard
4. View trip profit

**Expected Result**: 
- Total Expenses: KES 7,700
- Net Profit: KES 7,300

**Actual Result**:
- Total Expenses: KES 7,000 (only fuel counted)
- Net Profit: KES 8,000 (incorrect)

**Frequency**: Always when trip has 2+ expenses

**Impact**: Financial reports incorrect, affects business decisions

**Workaround**: None - calculation error

**Screenshots**: [Attached showing dashboard with incorrect totals]

---

### Example 3: Medium Priority Bug

**Bug ID**: BUG-003  
**Priority**: P2  
**Severity**: Medium

**Device**: Samsung Galaxy A52  
**OS**: Android 12  
**App Version**: 1.0.0  
**Role**: Driver

**Title**: Fuel receipt photo doesn't show thumbnail after upload

**Summary**: After uploading a fuel receipt photo, the thumbnail preview doesn't appear in the fuel record list. Photo is saved correctly (can view in POD screen) but thumbnail is blank.

**Steps to Reproduce**:
1. Login as driver
2. Start trip
3. Add fuel record
4. Take receipt photo
5. Save fuel record
6. Return to trip details
7. View fuel records list

**Expected Result**: Receipt photo thumbnail visible next to fuel record

**Actual Result**: Gray placeholder shown instead of photo

**Frequency**: Often (~80%)

**Impact**: Minor - photo is saved, just not displayed properly in list

**Workaround**: Tap fuel record to view full details, photo visible there

---

## Bug Tracking

### Open Bugs Summary

| Bug ID | Priority | Title | Assigned To | Status | ETA |
|--------|----------|-------|-------------|--------|-----|
| BUG-001 | P0 | App crashes completing trip offline | Dev Team | In Progress | 2024-08-24 |
| BUG-002 | P1 | Profit calculation incorrect | Dev Team | New | TBD |
| BUG-003 | P2 | Receipt thumbnail missing | - | New | - |

### Bug Metrics

- **Total Bugs**: ___
- **P0 (Critical)**: ___
- **P1 (High)**: ___
- **P2 (Medium)**: ___
- **P3 (Low)**: ___
- **Fixed**: ___
- **In Progress**: ___
- **Open**: ___

### Weekly Bug Trend

| Week | New | Fixed | Open | Critical Open |
|------|-----|-------|------|---------------|
| W1   |     |       |      |               |
| W2   |     |       |      |               |
| W3   |     |       |      |               |

---

## Notes for Testers

- Be as specific as possible in reproduction steps
- Include all relevant environment details
- Attach screenshots/videos when possible
- Check for existing bugs before creating new report
- Test workarounds if suggested
- Verify fixes when bug marked as fixed
- Update bug status when retesting
