# Digital Proof of Delivery & Incident Reporting - Testing Guide

## Overview

Comprehensive test scenarios for the digital proof of delivery and incident reporting system covering permissions, uploads, offline operations, validation, corrections, and operator workflows.

---

## 1. Camera & File Permissions Testing

### Test 1.1: Camera Permission - First Launch
**Scenario:** User launches app for first time  
**Steps:**
1. Open POD submission form
2. Tap "Capture Receipt Photo"
3. System requests camera permission

**Expected Results:**
- Permission dialog appears
- If granted: Camera opens
- If denied: Error message displayed
- User can retry permission request

**Error Handling:**
- Alert shows: "Camera permission not granted"
- User can open settings to enable permission

---

### Test 1.2: Gallery Permission
**Scenario:** User wants to select photo from gallery  
**Steps:**
1. Open incident report form
2. Tap "Add Photo"
3. Select "Choose from Gallery"
4. System requests media library permission

**Expected Results:**
- Permission dialog appears
- If granted: Gallery opens
- If denied: Error message with settings option

---

### Test 1.3: Location Permission
**Scenario:** Capturing GPS coordinates  
**Steps:**
1. Create new POD
2. System attempts to capture GPS location

**Expected Results:**
- Location permission requested if not granted
- GPS coordinates captured if permission granted
- Warning shown if location unavailable
- POD can still be saved without GPS (with warning)

---

## 2. Photo & Document Upload Testing

### Test 2.1: Receipt Photo Capture
**Scenario:** Driver captures delivery receipt  
**Steps:**
1. Open POD form
2. Tap "Capture Receipt Photo"
3. Take photo with camera
4. Review and confirm

**Expected Results:**
- Photo captured and displayed
- Photo added to upload queue
- Thumbnail shown in form
- Can remove and retake photo

---

### Test 2.2: Multiple Product Photos
**Scenario:** Adding multiple product photos  
**Steps:**
1. Open POD form
2. Capture 5 product photos
3. Review photo grid

**Expected Results:**
- All photos displayed in grid
- Photos queued for upload
- Can remove individual photos
- Can view full-size by tapping

---

### Test 2.3: Photo Compression
**Scenario:** Large photo upload optimization  
**Steps:**
1. Capture high-resolution photo (>5MB)
2. Check upload queue stats

**Expected Results:**
- Photo automatically compressed
- Original size vs compressed size shown
- Compression ratio displayed
- Upload size reduced by ~60-80%

---

### Test 2.4: Photo Upload Progress
**Scenario:** Monitoring upload progress  
**Steps:**
1. Submit POD with 3 photos
2. Check upload queue

**Expected Results:**
- Each photo shows upload progress (0-100%)
- Status updates: pending → uploading → completed
- Failed uploads shown with retry option

---

## 3. Missing Required Evidence Testing

### Test 3.1: Submit Without Receipt Photo
**Scenario:** Attempt submission without required receipt  
**Steps:**
1. Fill POD form completely
2. Skip receipt photo
3. Tap "Submit POD"

**Expected Results:**
- Validation error shown
- Error message: "Receipt photo is required"
- Submission blocked
- Form highlights missing field

---

### Test 3.2: Submit Without Receiver Name
**Scenario:** Missing required receiver information  
**Steps:**
1. Fill POD form
2. Leave receiver name blank
3. Tap "Submit POD"

**Expected Results:**
- Validation error: "Receiver name must be at least 2 characters"
- Field highlighted in red
- Cannot submit until corrected

---

### Test 3.3: Incident Without Description
**Scenario:** Insufficient incident details  
**Steps:**
1. Select incident type
2. Enter title but leave description empty
3. Tap "Submit Report"

**Expected Results:**
- Error: "Description must be at least 20 characters"
- Submission blocked
- Help text shows character requirement

---

### Test 3.4: Incident Without Immediate Action
**Scenario:** Missing required immediate action  
**Steps:**
1. Complete incident form
2. Skip "Immediate Action Taken" field
3. Submit

**Expected Results:**
- Validation error displayed
- Submission prevented
- Field marked as required

---

## 4. Failed Upload Testing

### Test 4.1: Network Failure During Upload
**Scenario:** Connection lost mid-upload  
**Steps:**
1. Start photo upload
2. Disable network connection
3. Wait for timeout

**Expected Results:**
- Upload status: "failed"
- Error message displayed
- Item marked for retry
- Retry scheduled automatically

---

### Test 4.2: Retry Failed Upload
**Scenario:** Manual retry after failure  
**Steps:**
1. View failed upload in queue
2. Tap "Retry"

**Expected Results:**
- Upload attempts again
- Retry count incremented
- Exponential backoff applied (5s, 10s, 20s delays)
- Max 3 retries before permanent failure

---

### Test 4.3: Bulk Upload Failure
**Scenario:** Multiple photos fail to upload  
**Steps:**
1. Submit POD with 5 photos
2. Simulate network issues
3. Check upload queue stats

**Expected Results:**
- Queue stats show failed count
- Each photo tracks individual retry attempts
- User can retry all failed uploads
- Can clear failed items

---

## 5. Offline Submission Testing

### Test 5.1: Create POD Offline
**Scenario:** Driver in area without connectivity  
**Steps:**
1. Disable all network connections
2. Create and fill POD form
3. Save as draft

**Expected Results:**
- Draft saved to AsyncStorage
- "Created offline" flag set
- GPS captured if available
- No upload attempts made

---

### Test 5.2: Submit POD Offline
**Scenario:** Submit without network  
**Steps:**
1. Complete POD form offline
2. Tap "Submit POD"

**Expected Results:**
- POD marked as submitted
- Status: "submitted" but not synced
- All photos queued for upload
- Auto-sync when network available

---

### Test 5.3: Offline to Online Sync
**Scenario:** Regaining connectivity  
**Steps:**
1. Create POD offline
2. Enable WiFi connection
3. Wait for auto-sync

**Expected Results:**
- Upload queue auto-processes
- Photos upload in priority order (receipt first)
- POD syncs to server
- Sync status updated

---

### Test 5.4: WiFi vs Cellular Upload
**Scenario:** Network type preference  
**Steps:**
1. Configure "WiFi only" upload setting
2. Submit POD on cellular connection
3. Connect to WiFi

**Expected Results:**
- Photos queued but not uploaded on cellular
- Auto-upload starts when WiFi connected
- Settings respected

---

## 6. Duplicate Prevention Testing

### Test 6.1: Duplicate POD Detection
**Scenario:** Accidentally submitting same POD twice  
**Steps:**
1. Submit POD for stop #123
2. Immediately create another POD for stop #123
3. Use same receiver name and time
4. Attempt submission

**Expected Results:**
- Duplicate detection triggered
- Error: "Very similar POD already submitted for this stop"
- Submission blocked
- Shows similarity score

---

### Test 6.2: Legitimate Multiple PODs
**Scenario:** Multiple deliveries to same location  
**Steps:**
1. Submit POD for stop #123 at 9:00 AM
2. Create new POD for stop #123 at 3:00 PM (>1 hour later)
3. Submit

**Expected Results:**
- No duplicate error (time difference sufficient)
- Both PODs accepted
- Different completion times recorded

---

## 7. Operator Approval Testing

### Test 7.1: View Submitted POD
**Scenario:** Operator reviews new submission  
**Steps:**
1. Open POD review screen
2. Select pending POD
3. Review all details

**Expected Results:**
- All POD data displayed
- Photos viewable in gallery
- Signature shown
- GPS location visible
- Item status breakdown shown

---

### Test 7.2: Approve POD
**Scenario:** Operator approves valid POD  
**Steps:**
1. Review POD
2. Tap "Approve"
3. Confirm approval

**Expected Results:**
- Status changes to "approved"
- Approval timestamp recorded
- Operator ID saved
- Driver notified (if configured)
- POD locked from further edits

---

### Test 7.3: Return for Correction
**Scenario:** POD has issues requiring fixes  
**Steps:**
1. Review POD
2. Tap "Return for Correction"
3. Enter correction comments: "Receipt photo is blurry, please retake"
4. Confirm

**Expected Results:**
- Status: "correction_required"
- Comments sent to driver
- Driver can edit and resubmit
- Original submission preserved

---

### Test 7.4: View Correction Comments
**Scenario:** Driver views returned POD  
**Steps:**
1. Open returned POD
2. Read correction comments

**Expected Results:**
- Comments prominently displayed
- Orange/red alert styling
- Can edit problematic fields
- Can resubmit after corrections

---

## 8. Corrections & Resubmission Testing

### Test 8.1: Edit Returned POD
**Scenario:** Fix issues and resubmit  
**Steps:**
1. Open POD with status "correction_required"
2. Read correction comments
3. Retake receipt photo
4. Update receiver name
5. Resubmit

**Expected Results:**
- Can edit all draft fields
- New photos replace old ones
- Correction history maintained
- Resubmission creates new review cycle

---

### Test 8.2: Multiple Correction Cycles
**Scenario:** POD returned twice  
**Steps:**
1. Submit POD
2. Operator returns for correction
3. Fix and resubmit
4. Operator returns again with new issues
5. Fix and resubmit again

**Expected Results:**
- Each correction cycle tracked
- All correction comments preserved
- Timeline shows full history
- No limit on correction cycles

---

## 9. Incident Reporting Testing

### Test 9.1: Report Accident
**Scenario:** Driver reports vehicle accident  
**Steps:**
1. Open incident report form
2. Select type: "Accident"
3. Enter title: "Minor collision at intersection"
4. Enter detailed description
5. Add 3 photos of damage
6. Add involved employees
7. Enter immediate action taken
8. Submit

**Expected Results:**
- Severity auto-set to "critical"
- All photos uploaded with high priority
- GPS location captured
- Timestamp recorded
- Status: "reported"
- Operator notified immediately

---

### Test 9.2: Multiple Incident Types
**Scenario:** Test all 8 incident types  
**Test Each Type:**
- Delivery delay → Severity: low
- Truck breakdown → Severity: high
- Accident → Severity: critical
- Damaged goods → Severity: medium
- Missing goods → Severity: medium
- Rejected delivery → Severity: medium
- Route problem → Severity: low
- Other → Severity: low

**Expected Results:**
- Each type has correct auto-severity
- Color coding matches severity
- Follow-up required for critical/high

---

### Test 9.3: Add Involved Employees
**Scenario:** Multiple employees in incident  
**Steps:**
1. Create incident report
2. Add employee: "John Doe" - Driver
3. Add employee: "Jane Smith" - Porter
4. Add employee: "Bob Johnson" - Supervisor

**Expected Results:**
- All employees listed
- Roles displayed correctly
- Can remove employees
- Each has optional involvement description

---

## 10. Incident Resolution Testing

### Test 10.1: Acknowledge Incident
**Scenario:** Operator acknowledges report  
**Steps:**
1. View new incident report
2. Tap "Acknowledge"
3. Confirm

**Expected Results:**
- Status changes to "acknowledged"
- Acknowledged timestamp recorded
- Operator ID saved
- Reporter notified

---

### Test 10.2: Update Status to Investigating
**Scenario:** Start investigation  
**Steps:**
1. Open acknowledged incident
2. Tap "Update Status"
3. Select "Investigating"
4. Confirm

**Expected Results:**
- Status: "investigating"
- Timeline updated
- Status color changes (orange)

---

### Test 10.3: Mark as Resolved
**Scenario:** Close incident  
**Steps:**
1. Open incident
2. Tap "Mark Resolved"
3. Enter resolution notes: "Damage repaired, insurance claim filed"
4. Confirm

**Expected Results:**
- Status: "resolved"
- Resolution notes saved
- Resolved timestamp recorded
- Follow-up requirements cleared
- Green completion badge shown

---

## 11. Signature Capture Testing

### Test 11.1: Capture Signature
**Scenario:** Receiver signs for delivery  
**Steps:**
1. Open signature capture modal
2. Enter signer name: "John Smith"
3. Draw signature with finger
4. Tap "Save Signature"

**Expected Results:**
- Signature drawn smoothly
- Base64 image created
- Signature added to POD
- Signer name associated
- Timestamp recorded

---

### Test 11.2: Clear and Redo Signature
**Scenario:** Signer makes mistake  
**Steps:**
1. Start drawing signature
2. Tap "Clear"
3. Draw new signature

**Expected Results:**
- Canvas cleared completely
- Can start fresh
- No remnants of old signature
- Clear button disabled when empty

---

### Test 11.3: Close Without Saving
**Scenario:** Cancel signature capture  
**Steps:**
1. Draw signature
2. Tap close button
3. Confirm discard

**Expected Results:**
- Warning dialog shown
- Signature discarded if confirmed
- Modal closes
- No signature added to POD

---

## 12. GPS & Location Testing

### Test 12.1: GPS Capture Success
**Scenario:** Accurate location available  
**Steps:**
1. Create POD at delivery location
2. Check GPS coordinates

**Expected Results:**
- Latitude/longitude captured
- Accuracy within 10-20 meters
- Timestamp recorded
- Green checkmark shown

---

### Test 12.2: GPS Unavailable
**Scenario:** Location services disabled  
**Steps:**
1. Disable location services
2. Create POD
3. Check GPS field

**Expected Results:**
- Warning: "Location permission not granted"
- GPS field empty
- POD can still be saved
- Warning badge shown

---

### Test 12.3: Location Verification
**Scenario:** Verify GPS near expected stop  
**Steps:**
1. Submit POD with GPS
2. Compare to expected stop coordinates
3. Check distance

**Expected Results:**
- Distance calculated using Haversine formula
- If within 100m: verified badge shown
- If >100m: warning shown but not blocked
- Operator can see verification status

---

## 13. Draft Management Testing

### Test 13.1: Save POD Draft
**Scenario:** Driver interrupted mid-entry  
**Steps:**
1. Start filling POD
2. Add receiver name
3. Add 1 photo
4. Tap "Save Draft"

**Expected Results:**
- Draft saved to AsyncStorage
- Key: @vone_pod_drafts
- Draft timestamp updated
- Can resume later

---

### Test 13.2: Load Saved Draft
**Scenario:** Resume incomplete POD  
**Steps:**
1. Open drafts list
2. Select draft POD
3. Continue editing

**Expected Results:**
- All previously entered data loaded
- Photos still attached
- Can add more data
- Can submit when ready

---

### Test 13.3: Multiple Drafts
**Scenario:** Several incomplete PODs  
**Steps:**
1. Create draft for Stop A
2. Create draft for Stop B
3. Create draft for Stop C
4. View drafts list

**Expected Results:**
- All drafts listed
- Sorted by updated timestamp
- Each shows: stop ID, receiver name, last updated
- Can delete drafts

---

## 14. Upload Queue Management

### Test 14.1: View Upload Queue
**Scenario:** Check pending uploads  
**Steps:**
1. Submit 2 PODs with photos
2. Open upload queue screen

**Expected Results:**
- All queued items shown
- Status for each (pending/uploading/completed/failed)
- Progress bars for active uploads
- File sizes displayed

---

### Test 14.2: Priority Upload Processing
**Scenario:** Critical photos uploaded first  
**Steps:**
1. Submit accident incident (high priority)
2. Submit routine POD (normal priority)
3. Check queue order

**Expected Results:**
- Accident photos upload first
- Receipt photos before product photos
- Priority sorting maintained
- Max 3 concurrent uploads

---

### Test 14.3: Clear Completed Uploads
**Scenario:** Clean up queue  
**Steps:**
1. Wait for uploads to complete
2. Tap "Clear Completed"

**Expected Results:**
- Completed items removed
- Failed/pending items remain
- Queue stats updated
- Storage space freed

---

## 15. Validation Testing

### Test 15.1: POD Field Validation
**Test all validations:**
- Receiver name: min 2 characters ✓
- Delivery notes: max 1000 characters ✓
- Receipt photo: required if configured ✓
- GPS coordinates: required if configured ✓
- Items: at least 1 required ✓
- Arrival time: must be before completion time ✓

**Expected Results:**
- Each validation rule enforced
- Clear error messages shown
- Fields highlighted when invalid
- Can save draft with validation errors
- Cannot submit until valid

---

### Test 15.2: Incident Field Validation
**Test all validations:**
- Title: required, not empty ✓
- Description: min 20 characters ✓
- Description: max 2000 characters ✓
- Immediate action: required if configured ✓
- Photos: max 10 photos ✓
- Incident date: not in future ✓

**Expected Results:**
- All rules enforced
- Character counters shown
- Validation on blur and submit
- Helpful error messages

---

## 16. Export Testing

### Test 16.1: Export POD as PDF
**Scenario:** Generate PDF report  
**Steps:**
1. Open approved POD
2. Tap "Export"
3. Select "PDF"

**Expected Results:**
- PDF generated with all data
- Photos embedded
- Signature included
- Timeline shown
- Can share or save

---

### Test 16.2: Export Incident as JSON
**Scenario:** Export for data analysis  
**Steps:**
1. Open resolved incident
2. Tap "Export"
3. Select "JSON"

**Expected Results:**
- Complete JSON object exported
- All fields included
- Timestamps in ISO format
- Can import into analytics tools

---

## 17. Edge Cases & Error Handling

### Test 17.1: Extremely Long Text
**Scenario:** User enters excessive text  
**Steps:**
1. Enter 2000+ characters in delivery notes
2. Attempt to save

**Expected Results:**
- Character counter shows limit
- Validation error at max length
- Cannot exceed max
- Text truncated or blocked

---

### Test 17.2: Very Large Photo
**Scenario:** 15MB photo from high-end phone  
**Steps:**
1. Capture or select very large photo
2. Add to POD

**Expected Results:**
- Photo compression triggered
- Size reduced to ~1-2MB
- Upload time reasonable
- Quality still acceptable

---

### Test 17.3: Storage Space Full
**Scenario:** Device out of storage  
**Steps:**
1. Attempt to save POD draft
2. AsyncStorage full

**Expected Results:**
- Error handled gracefully
- User notified: "Storage full, please free space"
- App doesn't crash
- Can retry after clearing space

---

## 18. Performance Testing

### Test 18.1: Large Photo Gallery
**Scenario:** POD with 15 product photos  
**Steps:**
1. Add 15 photos to POD
2. Scroll through gallery
3. View full-screen photos

**Expected Results:**
- Smooth scrolling
- No lag or jank
- Photos load quickly
- Memory usage reasonable

---

### Test 18.2: Many Drafts
**Scenario:** 50+ saved drafts  
**Steps:**
1. Create 50 draft PODs
2. Open drafts list
3. Scroll through list

**Expected Results:**
- List loads in <1 second
- Smooth scrolling
- Search/filter works
- Can delete old drafts

---

### Test 18.3: Offline Operation Speed
**Scenario:** All operations offline  
**Steps:**
1. Disable network
2. Create POD
3. Save draft
4. Create incident
5. Save draft

**Expected Results:**
- No network delay
- Instant saves to AsyncStorage
- Responsive UI
- Queue indicators shown

---

## Test Summary Checklist

### Permissions (3 tests)
- [ ] Camera permission flow
- [ ] Gallery permission flow
- [ ] Location permission flow

### Uploads (4 tests)
- [ ] Photo capture and upload
- [ ] Photo compression
- [ ] Upload progress tracking
- [ ] Multiple photo uploads

### Validation (2 tests)
- [ ] POD required fields
- [ ] Incident required fields

### Offline (4 tests)
- [ ] Create POD offline
- [ ] Submit POD offline
- [ ] Auto-sync when online
- [ ] WiFi vs cellular preference

### Failures (3 tests)
- [ ] Network failure handling
- [ ] Retry logic
- [ ] Bulk failure recovery

### Duplicates (2 tests)
- [ ] Duplicate detection
- [ ] Legitimate multiples

### Operator Review (4 tests)
- [ ] View submission
- [ ] Approve POD
- [ ] Return for correction
- [ ] View corrections

### Incidents (3 tests)
- [ ] All 8 incident types
- [ ] Severity assignment
- [ ] Resolution workflow

### Signature (3 tests)
- [ ] Capture signature
- [ ] Clear and redo
- [ ] Cancel without saving

### GPS (3 tests)
- [ ] GPS capture
- [ ] GPS unavailable
- [ ] Location verification

### Drafts (3 tests)
- [ ] Save draft
- [ ] Load draft
- [ ] Multiple drafts

### Queue (3 tests)
- [ ] View queue
- [ ] Priority processing
- [ ] Clear completed

### Export (2 tests)
- [ ] PDF export
- [ ] JSON export

### Edge Cases (3 tests)
- [ ] Long text handling
- [ ] Large photos
- [ ] Storage full

### Performance (3 tests)
- [ ] Large galleries
- [ ] Many drafts
- [ ] Offline speed

**Total: 45+ test scenarios covering all requirements**
