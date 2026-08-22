

# Fuel Planning & Expense Management - Test Scenarios

Comprehensive test scenarios for fuel budget calculation, fuel recording, trip expenses, validation, and reporting.

---

## Test Environment Setup

### Prerequisites
- Mobile app installed (iOS + Android)
- Operator web dashboard access
- Test trips with known distances
- Test trucks with known efficiencies
- Mock fuel price data
- Test driver and operator accounts

### Test Data
```typescript
// Test Trucks
truck1: { id: 'T001', efficiency: 5.0 kmpl, unit: 'T-101' }
truck2: { id: 'T002', efficiency: 6.5 kmpl, unit: 'T-102' }
truck3: { id: 'T003', efficiency: 4.2 kmpl, unit: 'T-103' } // Poor efficiency

// Test Trips
trip1: { distance: 200 km, origin: 'City A', destination: 'City B' }
trip2: { distance: 450 km, origin: 'City A', destination: 'City C', return: 450 km }
trip3: { distance: 50 km, origin: 'City A', destination: 'City A' } // Short trip

// Fuel Prices
current_price: $1.50/L
high_price: $2.00/L
low_price: $1.00/L
```

---

## Category 1: Fuel Budget Calculation

### TEST-FUEL-001: Basic Budget Calculation
**Priority**: Critical  
**Platform**: Web (Operator)

**Steps**:
1. Open fuel budget calculator
2. Enter: distance 200km, truck efficiency 5.0 kmpl, fuel price $1.50/L
3. Set traffic allowance 10%, idling allowance 5%
4. Click "Generate Estimate"

**Expected**:
- Base litres = 200 / 5.0 = 40.0 L
- Traffic allowance = 40.0 × 10% = 4.0 L
- Idling allowance = 40.0 × 5% = 2.0 L
- Total litres = 46.0 L
- Estimated cost = 46.0 × $1.50 = $69.00
- Calculation displays correctly

**Pass Criteria**: All calculations accurate to 2 decimal places

---

### TEST-FUEL-002: Round Trip Calculation
**Priority**: High  
**Platform**: Web (Operator)

**Steps**:
1. Enter distance 450 km
2. Enter return distance 450 km
3. Enter truck efficiency 6.5 kmpl, price $1.50/L
4. Traffic allowance 10%, idling 5%
5. Generate estimate

**Expected**:
- Total distance = 900 km
- Base litres = 900 / 6.5 = 138.46 L
- With allowances ≈ 159.23 L
- Estimated cost ≈ $238.85
- Breakdown shows one-way and return

**Pass Criteria**: Round trip calculation accurate

---

### TEST-FUEL-003: Multiple Trips Calculation
**Priority**: Medium  
**Platform**: Web (Operator)

**Steps**:
1. Enter distance 200 km
2. Enter number of trips: 3
3. Enter efficiency 5.0 kmpl, price $1.50/L
4. Generate estimate

**Expected**:
- Total distance = 600 km
- Total litres = 138.0 L (with allowances)
- Estimated cost ≈ $207.00
- Breakdown shows per-trip values

**Pass Criteria**: Multiple trips multiplier works correctly

---

### TEST-FUEL-004: Validation - Missing Values
**Priority**: Critical  
**Platform**: Web (Operator)

**Steps**:
1. Leave distance field empty
2. Enter other required fields
3. Click generate

**Expected**:
- Error message: "Invalid input: Route distance must be at least 1 km"
- No calculation generated
- Form remains editable

**Pass Criteria**: Validation prevents invalid input

---

### TEST-FUEL-005: Validation - Out of Range Values
**Priority**: High  
**Platform**: Web (Operator)

**Steps**:
1. Enter distance: 10000 km (exceeds max)
2. Enter efficiency: 20 kmpl (exceeds max)
3. Enter fuel price: $15.00/L (exceeds max)
4. Attempt to generate

**Expected**:
- Error: "Route distance exceeds maximum 5000 km"
- Error: "Truck efficiency exceeds maximum 15 km/l"
- Error: "Fuel price exceeds maximum $10.00"
- No calculation generated

**Pass Criteria**: All validation rules enforced

---

### TEST-FUEL-006: Validation - Negative Values
**Priority**: Critical  
**Platform**: Web (Operator)

**Steps**:
1. Enter distance: -100 km
2. Enter efficiency: -5 kmpl
3. Attempt to generate

**Expected**:
- Error messages for negative values
- Calculation prevented
- Input sanitized

**Pass Criteria**: Negative values rejected

---

### TEST-FUEL-007: Rounding Precision
**Priority**: Medium  
**Platform**: Web (Operator)

**Steps**:
1. Enter distance: 333.33 km
2. Enter efficiency: 5.55 kmpl
3. Enter price: $1.49/L
4. Generate

**Expected**:
- All calculations rounded to 2 decimals
- Base litres = 60.06 L
- Final amounts show exactly 2 decimal places
- No floating-point errors (e.g., 69.99999)

**Pass Criteria**: Consistent 2-decimal rounding throughout

---

### TEST-FUEL-008: Operator Adjustment - Increase
**Priority**: High  
**Platform**: Web (Operator)

**Steps**:
1. Generate budget: $100.00 estimated
2. Click "Add Adjustment"
3. Select "Increase"
4. Enter amount: $15.00
5. Enter reason: "Additional fuel for mountain terrain"
6. Confirm

**Expected**:
- Final budget = $115.00
- Adjustment listed with reason
- Shows adjusted by operator + timestamp
- Can remove adjustment before approval

**Pass Criteria**: Adjustment increases budget correctly

---

### TEST-FUEL-009: Operator Adjustment - Decrease
**Priority**: High  
**Platform**: Web (Operator)

**Steps**:
1. Generate budget: $100.00 estimated
2. Add decrease adjustment: -$10.00
3. Reason: "Mostly highway driving, less traffic"
4. Confirm

**Expected**:
- Final budget = $90.00
- Adjustment shows as decrease
- Reason recorded
- Can be removed if needed

**Pass Criteria**: Decrease adjustment works correctly

---

### TEST-FUEL-010: Adjustment Validation - Short Reason
**Priority**: Medium  
**Platform**: Web (Operator)

**Steps**:
1. Add adjustment with amount $20
2. Enter reason: "Extra"  (only 5 chars)
3. Attempt to confirm

**Expected**:
- Error: "Adjustment reason must be at least 10 characters"
- Adjustment not added
- Form remains open

**Pass Criteria**: Reason length validated

---

### TEST-FUEL-011: Adjustment Validation - Excessive Amount
**Priority**: High  
**Platform**: Web (Operator)

**Steps**:
1. Generate budget: $100.00
2. Attempt adjustment: +$50.00 (50% increase)
3. Reason provided

**Expected**:
- Error: "Adjustment exceeds maximum allowed (30%)"
- Adjustment rejected
- Can try smaller amount

**Pass Criteria**: Excessive adjustments blocked

---

### TEST-FUEL-012: Multiple Adjustments
**Priority**: Medium  
**Platform**: Web (Operator)

**Steps**:
1. Generate budget: $100.00
2. Add increase: +$10.00
3. Add decrease: -$5.00
4. Add increase: +$3.00

**Expected**:
- All adjustments listed separately
- Final budget = $100 + $10 - $5 + $3 = $108.00
- Can remove individual adjustments
- Cumulative total correct

**Pass Criteria**: Multiple adjustments compound correctly

---

### TEST-FUEL-013: Approval Workflow - Review
**Priority**: High  
**Platform**: Web (Operator)

**Steps**:
1. Generate budget (status: draft)
2. Click "Mark as Reviewed"

**Expected**:
- Status changes to "reviewed"
- Reviewed by + timestamp recorded
- Still can add adjustments
- Can proceed to approval

**Pass Criteria**: Review status tracked

---

### TEST-FUEL-014: Approval Workflow - Approve
**Priority**: Critical  
**Platform**: Web (Operator)

**Steps**:
1. Budget in reviewed or draft status
2. Click "Approve Budget"
3. Confirm approval dialog

**Expected**:
- Status changes to "approved"
- Approved by + timestamp recorded
- Cannot add more adjustments
- Shows "APPROVED" badge
- Can record release amount

**Pass Criteria**: Approval finalizes budget

---

### TEST-FUEL-015: Approval Validation - Already Approved
**Priority**: Medium  
**Platform**: Web (Operator)

**Steps**:
1. Approve budget
2. Attempt to approve again

**Expected**:
- Error: "Budget already approved"
- No duplicate approval
- Status remains approved

**Pass Criteria**: Prevents duplicate approval

---

### TEST-FUEL-016: Release Amount Recording
**Priority**: Critical  
**Platform**: Web (Operator)

**Steps**:
1. Approve budget: $100.00
2. Click "Record Amount Released"
3. Enter amount: $100.00
4. Add notes: "Cash released to driver"
5. Confirm

**Expected**:
- Amount released recorded: $100.00
- Release notes saved
- Released by + timestamp recorded
- Shows checkmark "Released to driver"

**Pass Criteria**: Release tracking works

---

### TEST-FUEL-017: Release Validation - Exceeds Budget
**Priority**: High  
**Platform**: Web (Operator)

**Steps**:
1. Approve budget: $100.00
2. Attempt to release: $120.00 (20% over)

**Expected**:
- Error: "Released amount exceeds budget by more than 10%"
- Release rejected
- Must release ≤$110.00

**Pass Criteria**: Excessive release blocked

---

### TEST-FUEL-018: Release Validation - Not Approved
**Priority**: High  
**Platform**: Web (Operator)

**Steps**:
1. Generate budget (draft status)
2. Attempt to record release

**Expected**:
- Error: "Can only release funds for approved budgets"
- Release button disabled or error shown
- Must approve first

**Pass Criteria**: Cannot release unapproved budget

---

### TEST-FUEL-019: Calculation Recalculation
**Priority**: Medium  
**Platform**: Web (Operator)

**Steps**:
1. Generate budget with parameters A
2. Change distance from 200km to 300km
3. Click "Generate Estimate" again

**Expected**:
- New calculation generated
- Previous adjustments preserved
- Final budget recalculated with adjustments
- Old estimate replaced

**Pass Criteria**: Recalculation updates correctly

---

### TEST-FUEL-020: Zero Allowances
**Priority**: Low  
**Platform**: Web (Operator)

**Steps**:
1. Enter distance 200km, efficiency 5.0 kmpl
2. Set traffic allowance: 0%
3. Set idling allowance: 0%
4. Generate

**Expected**:
- Base litres = estimated litres (no allowances added)
- Traffic allowance = 0 L
- Idling allowance = 0 L
- Calculation still valid

**Pass Criteria**: Zero allowances accepted

---

## Category 2: Fuel Recording (Driver)

### TEST-FUEL-021: Basic Fuel Recording
**Priority**: Critical  
**Platform**: Mobile (Driver)

**Steps**:
1. Open fuel recording form
2. Enter: 50 litres, $1.50/L, total $75.00
3. Enter station: "Shell Main Street"
4. Enter odometer: 12500 km
5. Submit

**Expected**:
- Record created successfully
- All fields saved correctly
- Validation passes (litres × price = total)
- Shows in trip fuel list

**Pass Criteria**: Basic recording works

---

### TEST-FUEL-022: Auto-Calculation - Total from Litres
**Priority**: High  
**Platform**: Mobile (Driver)

**Steps**:
1. Enter litres: 40
2. Enter price: $1.50
3. Leave total empty
4. Observe total field

**Expected**:
- Total auto-calculates to $60.00
- Updates in real-time as values change
- Rounded to 2 decimals

**Pass Criteria**: Auto-calculation works

---

### TEST-FUEL-023: Auto-Calculation - Litres from Total
**Priority**: High  
**Platform**: Mobile (Driver)

**Steps**:
1. Enter price: $1.50
2. Enter total: $75.00
3. Leave litres empty
4. Observe litres field

**Expected**:
- Litres auto-calculates to 50.00
- Updates when total or price changes
- Rounded to 2 decimals

**Pass Criteria**: Reverse calculation works

---

### TEST-FUEL-024: Validation - Calculation Mismatch
**Priority**: Critical  
**Platform**: Mobile (Driver)

**Steps**:
1. Enter litres: 50
2. Enter price: $1.50
3. Manual enter total: $80.00 (incorrect)
4. Submit

**Expected**:
- Validation error: "Total amount mismatch. Expected $75.00, got $80.00"
- Requires explanation flag set
- Shows warning to driver
- Can still submit with explanation

**Pass Criteria**: Mismatch detected

---

### TEST-FUEL-025: Validation - Price Variance
**Priority**: High  
**Platform**: Mobile (Driver)

**Steps**:
1. Market price: $1.50/L
2. Enter purchase price: $2.00/L (33% higher)
3. Other fields correct
4. Submit

**Expected**:
- Warning: "Price varies 33% from market rate ($1.50/L)"
- Requires explanation
- Can submit with explanation
- Flagged for operator review

**Pass Criteria**: Price variance detected

---

### TEST-FUEL-026: Validation - Excessive Litres
**Priority**: High  
**Platform**: Mobile (Driver)

**Steps**:
1. Enter litres: 350 (exceeds 300L max)
2. Other fields valid
3. Submit

**Expected**:
- Error: "Litres purchased exceeds maximum 300L"
- Requires explanation
- Shows warning
- Flagged for review

**Pass Criteria**: Large purchase flagged

---

### TEST-FUEL-027: Validation - Too Few Litres
**Priority**: Medium  
**Platform**: Mobile (Driver)

**Steps**:
1. Enter litres: 3 (below 5L min)
2. Attempt to submit

**Expected**:
- Error: "Litres purchased must be at least 5L"
- Submission blocked
- Must correct value

**Pass Criteria**: Minimum litres enforced

---

### TEST-FUEL-028: Receipt Photo Upload - Camera
**Priority**: High  
**Platform**: Mobile (Driver)

**Steps**:
1. Click "Take Photo"
2. Grant camera permission
3. Take photo of receipt
4. Accept photo

**Expected**:
- Camera opens
- Photo captured
- Preview shown
- Can retake or confirm
- Photo attached to record

**Pass Criteria**: Camera upload works

---

### TEST-FUEL-029: Receipt Photo Upload - Gallery
**Priority**: High  
**Platform**: Mobile (Driver)

**Steps**:
1. Click "Choose from Gallery"
2. Grant gallery permission
3. Select receipt image
4. Confirm

**Expected**:
- Gallery opens
- Image selected
- Preview shown
- Photo attached to record
- Can remove and reselect

**Pass Criteria**: Gallery upload works

---

### TEST-FUEL-030: Receipt Photo - Remove
**Priority**: Medium  
**Platform**: Mobile (Driver)

**Steps**:
1. Upload receipt photo
2. Click remove (X) button
3. Confirm removal

**Expected**:
- Photo removed from form
- Upload buttons reappear
- Can upload different photo
- Record can be submitted without photo

**Pass Criteria**: Photo removal works

---

### TEST-FUEL-031: Odometer Validation - Backwards
**Priority**: High  
**Platform**: Mobile (Driver)

**Steps**:
1. Previous odometer: 12500 km
2. Enter current: 12400 km (backwards)
3. Submit

**Expected**:
- Error: "Odometer reading is less than previous reading"
- Flagged as suspicious
- Requires explanation
- Operator review needed

**Pass Criteria**: Backwards odometer detected

---

### TEST-FUEL-032: Odometer Validation - Large Jump
**Priority**: Medium  
**Platform**: Mobile (Driver)

**Steps**:
1. Previous odometer: 12500 km
2. Enter current: 13600 km (1100 km jump)
3. Expected trip distance: 200 km
4. Submit

**Expected**:
- Warning: "Odometer variance: Expected 200 km, got 1100 km"
- Flagged as suspicious
- Requires explanation
- Shows variance %

**Pass Criteria**: Large odometer jump detected

---

### TEST-FUEL-033: Multiple Purchases Same Day
**Priority**: Medium  
**Platform**: Mobile (Driver)

**Steps**:
1. Record fuel purchase at 9:00 AM
2. Record second purchase at 11:00 AM
3. Record third purchase at 2:00 PM (same day)

**Expected**:
- All three recorded
- Warning on 3rd: "3 fuel purchases recorded on the same day"
- Flagged for review
- Asks for verification

**Pass Criteria**: Multiple purchases detected

---

### TEST-FUEL-034: Driver Explanation - Required
**Priority**: High  
**Platform**: Mobile (Driver)

**Steps**:
1. Submit record with validation issue
2. See "Explanation Required" warning
3. Enter explanation: "Less than 20 chars"
4. Attempt to submit

**Expected**:
- Error: "Explanation must be at least 20 characters"
- Cannot submit until valid explanation
- Character count hint shown

**Pass Criteria**: Explanation length validated

---

### TEST-FUEL-035: Driver Explanation - Provided
**Priority**: High  
**Platform**: Mobile (Driver)

**Steps**:
1. Record with price variance
2. Add explanation: "Station only option in remote area, higher prices expected"
3. Submit

**Expected**:
- Record saved with explanation
- Marked as "requires review"
- Explanation visible to operator
- Can be approved despite issue

**Pass Criteria**: Explanation recorded correctly

---

### TEST-FUEL-036: Missing Required Fields
**Priority**: Critical  
**Platform**: Mobile (Driver)

**Steps**:
1. Leave litres field empty
2. Fill other fields
3. Attempt to submit

**Expected**:
- Error: "Please fill in all required fields"
- Submission blocked
- Missing fields highlighted
- Form remains editable

**Pass Criteria**: Required fields enforced

---

### TEST-FUEL-037: Record Update Before Approval
**Priority**: Medium  
**Platform**: Mobile (Driver)

**Steps**:
1. Create fuel record (not yet approved)
2. Edit litres from 50 to 55
3. Update price to match
4. Save

**Expected**:
- Record updated successfully
- Re-validated with new values
- Previous version replaced
- Can update multiple times before approval

**Pass Criteria**: Updates allowed before approval

---

### TEST-FUEL-038: Record Update After Approval
**Priority**: High  
**Platform**: Mobile (Driver)

**Steps**:
1. Create and submit fuel record
2. Operator approves record
3. Driver attempts to edit

**Expected**:
- Error: "Cannot update approved fuel record"
- Edit blocked
- Form read-only or disabled
- Must request operator correction

**Pass Criteria**: Approved records locked

---

### TEST-FUEL-039: Record Summary for Trip
**Priority**: Medium  
**Platform**: Mobile (Driver)

**Steps**:
1. Record 3 fuel purchases for trip
2. View trip fuel summary

**Expected**:
- Total litres: sum of all purchases
- Total cost: sum of all amounts
- Purchase count: 3
- Approved count shown
- Pending count shown
- Average price calculated

**Pass Criteria**: Summary calculates correctly

---

### TEST-FUEL-040: Operator Approval of Fuel Record
**Priority**: Critical  
**Platform**: Web (Operator)

**Steps**:
1. Driver submits fuel record
2. Operator reviews record
3. Click "Approve"

**Expected**:
- Record marked as approved
- Approved by + timestamp
- Driver can see approval status
- Record becomes read-only

**Pass Criteria**: Approval workflow works

---

### TEST-FUEL-041: Operator Rejection of Fuel Record
**Priority**: High  
**Platform**: Web (Operator)

**Steps**:
1. Driver submits questionable record
2. Operator reviews
3. Click "Reject"
4. Enter reason: "Price does not match receipt image"

**Expected**:
- Record marked as rejected
- Rejection reason recorded
- Driver notified
- Driver must correct and resubmit

**Pass Criteria**: Rejection workflow works

---

## Category 3: Trip Expenses

### TEST-EXP-001: Record Toll Fee
**Priority**: High  
**Platform**: Mobile (Driver)

**Steps**:
1. Select category: "Toll Fees"
2. Description: "Highway 401 toll"
3. Amount: $5.50
4. Location: "Toronto ON"
5. Submit

**Expected**:
- Expense recorded
- Category: toll_fees
- Shows in trip expenses list
- Pending approval

**Pass Criteria**: Toll fee recorded

---

### TEST-EXP-002: Record Parking
**Priority**: High  
**Platform**: Mobile (Driver)

**Steps**:
1. Select category: "Parking"
2. Description: "Overnight parking at delivery site"
3. Amount: $15.00
4. Submit

**Expected**:
- Parking expense recorded
- Added to trip total
- Awaiting approval

**Pass Criteria**: Parking expense recorded

---

### TEST-EXP-003: Record Meal Allowance
**Priority**: High  
**Platform**: Mobile (Driver)

**Steps**:
1. Select category: "Meals & Allowances"
2. Description: "Lunch during long haul"
3. Amount: $12.00
4. Submit

**Expected**:
- Meal expense recorded
- Proper category assigned
- Included in expense summary

**Pass Criteria**: Meal expense recorded

---

### TEST-EXP-004: Record Repair Expense
**Priority**: High  
**Platform**: Mobile (Driver)

**Steps**:
1. Select category: "Repairs"
2. Description: "Tire puncture repair"
3. Amount: $85.00
4. Notes: "Happened 50km from delivery, emergency repair"
5. Submit

**Expected**:
- Repair expense recorded
- Amount >$50 triggers warning: "Large repair expense"
- Suggests adding documentation
- Requires operator review

**Pass Criteria**: Repair expense recorded with warning

---

### TEST-EXP-005: Record Emergency Expense
**Priority**: High  
**Platform**: Mobile (Driver)

**Steps**:
1. Select category: "Emergency"
2. Description: "Tow truck service"
3. Amount: $200.00
4. Leave notes empty
5. Attempt to submit

**Expected**:
- Warning: "Emergency expense should include detailed notes"
- Prompts for notes
- Can still submit but flagged
- High priority for operator review

**Pass Criteria**: Emergency category prompts for notes

---

### TEST-EXP-006: Record Other Expense
**Priority**: Medium  
**Platform**: Mobile (Driver)

**Steps**:
1. Select category: "Other"
2. Description: "Phone top-up for navigation"
3. Amount: $10.00
4. Submit

**Expected**:
- Other expense recorded
- Proper category assigned
- Awaiting approval

**Pass Criteria**: Other category works

---

### TEST-EXP-007: Expense Validation - Short Description
**Priority**: Medium  
**Platform**: Mobile (Driver)

**Steps**:
1. Select any category
2. Description: "Toll" (4 chars, below min 5)
3. Amount: $5.00
4. Submit

**Expected**:
- Error: "Description must be at least 5 characters"
- Submission blocked
- Must provide better description

**Pass Criteria**: Description length enforced

---

### TEST-EXP-008: Expense Validation - Excessive Amount
**Priority**: High  
**Platform**: Mobile (Driver)

**Steps**:
1. Select category: Parking
2. Amount: $1500.00
3. Submit

**Expected**:
- Warning: "Large expense (>$1000). Receipt required."
- Suggests uploading receipt
- Flags for operator review
- Can still submit

**Pass Criteria**: Large amounts flagged

---

### TEST-EXP-009: Expense Summary by Category
**Priority**: High  
**Platform**: Mobile/Web

**Steps**:
1. Record expenses:
   - Fuel: $75
   - Tolls: $10
   - Parking: $15
   - Meals: $25
2. View trip expense summary

**Expected**:
- Total: $125.00
- By category:
  - Fuel: $75.00
  - Toll Fees: $10.00
  - Parking: $15.00
  - Meals: $25.00
- Approved vs pending breakdown shown

**Pass Criteria**: Summary accurate by category

---

### TEST-EXP-010: Bulk Expense Approval
**Priority**: Medium  
**Platform**: Web (Operator)

**Steps**:
1. Driver records 5 expenses
2. Operator selects all 5
3. Click "Approve All"

**Expected**:
- All 5 marked as approved
- Single bulk operation
- All timestamps recorded
- Driver sees all approved

**Pass Criteria**: Bulk approval works

---

### TEST-EXP-011: Expense Rejection with Reason
**Priority**: High  
**Platform**: Web (Operator)

**Steps**:
1. Review expense: "$25 meal"
2. Click "Reject"
3. Reason: "Exceeds meal allowance limit of $20"
4. Confirm

**Expected**:
- Expense rejected
- Reason recorded
- Driver notified
- Shows in rejected list

**Pass Criteria**: Rejection recorded

---

### TEST-EXP-012: Expense Update Before Approval
**Priority**: Medium  
**Platform**: Mobile (Driver)

**Steps**:
1. Record expense: $10 toll
2. Realize mistake, edit to $12
3. Update

**Expected**:
- Expense updated
- New amount reflected
- Still pending approval
- Can update multiple times

**Pass Criteria**: Pre-approval updates allowed

---

### TEST-EXP-013: Expense Delete Before Approval
**Priority**: Medium  
**Platform**: Mobile (Driver)

**Steps**:
1. Record incorrect expense
2. Click "Delete"
3. Confirm deletion

**Expected**:
- Expense deleted
- Removed from list
- Not counted in totals
- Cannot delete after approval

**Pass Criteria**: Deletion works pre-approval

---

### TEST-EXP-014: Expense Lock After Approval
**Priority**: High  
**Platform**: Mobile (Driver)

**Steps**:
1. Submit expense
2. Operator approves
3. Driver attempts to edit or delete

**Expected**:
- Error: "Cannot update/delete approved expense"
- Edit disabled
- Delete disabled
- Must contact operator for changes

**Pass Criteria**: Approved expenses locked

---

### TEST-EXP-015: Duplicate Expense Detection
**Priority**: Medium  
**Platform**: Web (Operator)

**Steps**:
1. Driver records: $5 toll at 10:00 AM
2. Driver records: $5 toll at 10:01 AM (same category, amount, date)
3. Operator reviews

**Expected**:
- Warning: "Possible duplicate expense detected"
- Shows both records side by side
- Operator can approve/reject individually
- Helps catch accidental duplicates

**Pass Criteria**: Duplicates flagged

---

### TEST-EXP-016: Expense Statistics
**Priority**: Medium  
**Platform**: Web (Operator)

**Steps**:
1. Multiple expenses recorded for trip
2. View expense statistics

**Expected**:
- Total count: X expenses
- Total amount: $X.XX
- Approved count/amount
- Pending count/amount
- Rejected count
- With/without receipt counts
- Category breakdown

**Pass Criteria**: Statistics accurate

---

### TEST-EXP-017: Expense CSV Export
**Priority**: Low  
**Platform**: Web (Operator)

**Steps**:
1. View trip expenses
2. Click "Export to CSV"
3. Open CSV file

**Expected**:
- CSV contains all expenses
- Headers: Date, Category, Description, Amount, Receipt, Approved, Notes
- All data properly formatted
- Can open in Excel/Sheets

**Pass Criteria**: CSV export works

---

### TEST-EXP-018: Daily Expense Average
**Priority**: Low  
**Platform**: Web (Operator)

**Steps**:
1. Trip spans 3 days
2. Day 1: $50, Day 2: $75, Day 3: $25
3. View daily average

**Expected**:
- Daily average = $150 / 3 days = $50.00
- Shows per-day breakdown
- Helps identify unusual days

**Pass Criteria**: Average calculated correctly

---

### TEST-EXP-019: Missing Receipt Alert
**Priority**: Medium  
**Platform**: Web (Operator)

**Steps**:
1. Filter expenses: "Without receipts + amount >$50"
2. Review list

**Expected**:
- Shows expenses >$50 without receipts
- Highlighted for attention
- Can request from driver
- Helps ensure documentation

**Pass Criteria**: Missing receipt filter works

---

### TEST-EXP-020: Expense Category Colors
**Priority**: Low  
**Platform**: Mobile/Web

**Steps**:
1. View expense list with multiple categories
2. Observe visual representation

**Expected**:
- Each category has distinct color
- Fuel: Blue
- Tolls: Purple
- Parking: Pink
- Meals: Amber
- Repairs: Red
- Emergency: Dark Red
- Other: Gray
- Easy to distinguish at a glance

**Pass Criteria**: Visual category distinction clear

---

## Category 4: Fuel Reports

### TEST-REP-001: Budget vs Actual Comparison
**Priority**: Critical  
**Platform**: Web (Operator)

**Steps**:
1. Budget: estimated 46L, $69.00
2. Actual: 50L, $75.00
3. Generate comparison report

**Expected**:
- Litres variance: +4L (8.7%)
- Cost variance: +$6.00 (8.7%)
- Is over budget: No (under 10% threshold)
- Budget remaining: calculated
- Variance % shown

**Pass Criteria**: Comparison accurate

---

### TEST-REP-002: Over Budget Detection
**Priority**: High  
**Platform**: Web (Operator)

**Steps**:
1. Budget: $100 released
2. Actual: $115 spent
3. View comparison

**Expected**:
- Is over budget: Yes
- Cost variance: +$15.00 (15%)
- Flagged as over threshold (>10%)
- Shows in red or warning color
- Explanation required from driver

**Pass Criteria**: Over-budget flagged

---

### TEST-REP-003: Fuel Consumption by Truck
**Priority**: High  
**Platform**: Web (Operator)

**Steps**:
1. Truck T-101 (expected 5.0 kmpl)
2. Period: Last 30 days
3. Total: 1000 km, 220L
4. Generate report

**Expected**:
- Actual efficiency: 4.55 kmpl
- Expected: 5.0 kmpl
- Variance: -9% (worse than expected)
- Is performing well: No
- Trend chart shown

**Pass Criteria**: Per-truck report accurate

---

### TEST-REP-004: Fuel Consumption by Trip
**Priority**: High  
**Platform**: Web (Operator)

**Steps**:
1. Trip: 200 km, Truck expected 5.0 kmpl
2. Actual: 45L consumed
3. Generate report

**Expected**:
- Actual efficiency: 4.44 kmpl
- Variance: -11.2%
- Cost per km: calculated
- Is efficient: No (below 90% of expected)
- Is flagged: Yes (>10% variance)

**Pass Criteria**: Per-trip report accurate

---

### TEST-REP-005: Fuel Consumption by Destination
**Priority**: Medium  
**Platform**: Web (Operator)

**Steps**:
1. Destination: "City B"
2. 10 trips recorded
3. Generate report

**Expected**:
- Trip count: 10
- Total distance: sum of all trips
- Average distance per trip
- Total litres consumed
- Average litres per trip
- Average/best/worst efficiency
- Truck count used

**Pass Criteria**: Destination aggregation works

---

### TEST-REP-006: Unusual Usage - Excessive Consumption
**Priority**: Critical  
**Platform**: Web (Operator)

**Steps**:
1. Trip: 200 km, expected 5.0 kmpl (40L)
2. Actual: 55L (37.5% more, 3.64 kmpl)
3. Run unusual usage detection

**Expected**:
- Flagged as "excessive_consumption"
- Severity: High (>30% worse)
- Issue description explains variance
- Expected vs actual shown
- Requires investigation

**Pass Criteria**: Excessive consumption detected

---

### TEST-REP-007: Unusual Usage - Suspiciously Low
**Priority**: High  
**Platform**: Web (Operator)

**Steps**:
1. Trip: 200 km, expected 5.0 kmpl (40L)
2. Actual: 20L (50% better, 10.0 kmpl)
3. Run detection

**Expected**:
- Flagged as "suspiciously_low"
- Severity: Medium
- Message: "Verify records" (unrealistic efficiency)
- Might indicate missing fuel records

**Pass Criteria**: Suspiciously low detected

---

### TEST-REP-008: Unusual Usage - Multiple Same Day
**Priority**: Medium  
**Platform**: Web (Operator)

**Steps**:
1. 4 fuel purchases on 2024-01-15
2. Run detection

**Expected**:
- Flagged as "multiple_purchases_same_day"
- Severity: Low
- Count: 4 purchases
- Asks for verification
- Could be legitimate (long trip) or error

**Pass Criteria**: Multiple purchases detected

---

### TEST-REP-009: Unusual Usage - Large Purchase
**Priority**: Medium  
**Platform**: Web (Operator)

**Steps**:
1. Single purchase: 350L
2. Run detection

**Expected**:
- Flagged as "large_single_purchase"
- Severity: Medium
- Amount exceeds typical (>300L)
- Verify legitimacy
- Could be bulk purchase or error

**Pass Criteria**: Large purchase flagged

---

### TEST-REP-010: Report Date Filtering
**Priority**: High  
**Platform**: Web (Operator)

**Steps**:
1. Set date range: Jan 1 - Jan 31
2. Generate report

**Expected**:
- Only trips in date range included
- Accurate filtering by start date
- Totals reflect filtered data
- Can change date range and recalculate

**Pass Criteria**: Date filtering works

---

### TEST-REP-011: Report Truck Filtering
**Priority**: Medium  
**Platform**: Web (Operator)

**Steps**:
1. Select trucks: T-101, T-103
2. Generate report

**Expected**:
- Only selected trucks included
- T-102 data excluded
- Totals reflect filtered trucks
- Can select all or specific trucks

**Pass Criteria**: Truck filtering works

---

### TEST-REP-012: Report Export - Variance Threshold
**Priority**: Medium  
**Platform**: Web (Operator)

**Steps**:
1. Set variance threshold: 15%
2. Generate report

**Expected**:
- Only trips with >15% variance shown
- Helps focus on problem areas
- Count of flagged vs total shown
- Threshold adjustable

**Pass Criteria**: Threshold filtering works

---

### TEST-REP-013: Expense Summary Report
**Priority**: High  
**Platform**: Web (Operator)

**Steps**:
1. Multiple trips with expenses
2. Generate expense summary
3. Date range: Last month

**Expected**:
- Total trips: X
- Total expenses: $X,XXX
- Average per trip: $XXX
- Category breakdown with amounts
- Top 10 highest expense trips listed

**Pass Criteria**: Expense summary accurate

---

### TEST-REP-014: Report Metadata
**Priority**: Low  
**Platform**: Web (Operator)

**Steps**:
1. Generate any report
2. Check report header/footer

**Expected**:
- Generated at: timestamp
- Generated by: operator name
- Filters applied: listed
- Total records: count
- Page number (if paginated)

**Pass Criteria**: Metadata present

---

### TEST-REP-015: Report Pagination
**Priority**: Low  
**Platform**: Web (Operator)

**Steps**:
1. Generate report with 100+ results
2. Navigate pages

**Expected**:
- Results split into pages (e.g., 20 per page)
- Page navigation controls work
- Total pages shown
- Can jump to specific page

**Pass Criteria**: Pagination works

---

## Category 5: Edge Cases & Error Handling

### TEST-EDGE-001: Zero Distance Trip
**Priority**: Medium

**Steps**:
1. Enter distance: 0 km
2. Attempt to calculate budget

**Expected**:
- Error or warning
- Suggests minimum distance
- Cannot generate unrealistic budget

**Pass Criteria**: Zero distance handled

---

### TEST-EDGE-002: Extremely Long Trip
**Priority**: Low

**Steps**:
1. Enter distance: 4999 km (near max)
2. Calculate

**Expected**:
- Calculation completes
- Warning for very long trip
- All values realistic
- No overflow errors

**Pass Criteria**: Long distance handled

---

### TEST-EDGE-003: Very Poor Efficiency
**Priority**: Medium

**Steps**:
1. Enter efficiency: 2.1 kmpl (near min)
2. Calculate budget

**Expected**:
- High fuel requirement calculated
- Warning about poor efficiency
- Suggests checking truck
- Calculation accurate

**Pass Criteria**: Poor efficiency handled

---

### TEST-EDGE-004: Decimal Rounding Edge Cases
**Priority**: High

**Steps**:
1. Calculate: 100 km ÷ 3 kmpl = 33.333... L
2. Price: $1.499/L
3. Check all rounded values

**Expected**:
- Litres: 33.33 L (2 decimals)
- Cost: $49.95 (not 49.949995)
- No floating point errors
- Consistent rounding throughout

**Pass Criteria**: Rounding consistent

---

### TEST-EDGE-005: Concurrent Edits
**Priority**: Medium

**Steps**:
1. Operator A opens budget for editing
2. Operator B opens same budget
3. Both make changes
4. Both attempt to save

**Expected**:
- Conflict detection
- Warning about concurrent edit
- Option to reload or overwrite
- Data integrity maintained

**Pass Criteria**: Concurrent edits handled

---

### TEST-EDGE-006: Network Failure During Submit
**Priority**: High

**Steps**:
1. Fill fuel record form
2. Disable network
3. Click submit

**Expected**:
- Error: "Network unavailable"
- Data preserved in form
- Can retry when online
- No data lost

**Pass Criteria**: Offline handling works

---

### TEST-EDGE-007: Incomplete Form Navigation Away
**Priority**: Medium

**Steps**:
1. Fill 50% of fuel record form
2. Navigate to different screen
3. Return to form

**Expected**:
- Warning: "Unsaved changes"
- Option to stay or discard
- If stay, data preserved
- If discard, form cleared

**Pass Criteria**: Unsaved data warning works

---

### TEST-EDGE-008: Special Characters in Text Fields
**Priority**: Low

**Steps**:
1. Enter description: "Toll @ Highway #401 (50% discount)"
2. Enter notes with emoji: "Great service 👍"
3. Submit

**Expected**:
- Special chars accepted
- Stored correctly
- Display correctly
- No SQL injection or XSS

**Pass Criteria**: Special chars handled safely

---

### TEST-EDGE-009: Very Large Amounts
**Priority**: Low

**Steps**:
1. Enter amount: $99,999.99 (near system max)
2. Submit

**Expected**:
- Amount accepted (if within rules)
- Stored correctly
- Displays with proper formatting
- No overflow errors

**Pass Criteria**: Large amounts handled

---

### TEST-EDGE-010: Rapid Repeated Submissions
**Priority**: Medium

**Steps**:
1. Fill form
2. Click submit 5 times rapidly

**Expected**:
- Only one submission processed
- Button disabled after first click
- No duplicate records created
- Clear feedback to user

**Pass Criteria**: Duplicate submission prevented

---

## Test Summary

**Total Test Scenarios**: 125

**By Category**:
- Fuel Budget Calculation: 20 tests
- Fuel Recording: 21 tests
- Trip Expenses: 20 tests
- Fuel Reports: 15 tests
- Edge Cases: 10 tests
- Validation: 24 tests (distributed)
- Rounding: 5 tests (distributed)
- Operator Workflow: 10 tests (distributed)

**By Priority**:
- Critical: 25 tests
- High: 45 tests
- Medium: 40 tests
- Low: 15 tests

**Estimated Testing Time**: 20-25 hours

---

## Testing Checklist

### Pre-Testing
- [ ] Test environment setup
- [ ] Test data prepared
- [ ] Test accounts created
- [ ] Network simulation tools ready

### Testing Execution
- [ ] Category 1: Budget Calculation (4 hours)
- [ ] Category 2: Fuel Recording (5 hours)
- [ ] Category 3: Trip Expenses (4 hours)
- [ ] Category 4: Reports (3 hours)
- [ ] Category 5: Edge Cases (2 hours)
- [ ] Regression testing (2 hours)

### Post-Testing
- [ ] Bug reports filed
- [ ] Test results documented
- [ ] Coverage analysis
- [ ] Sign-off from stakeholders

---

## Success Criteria

✅ All critical tests pass
✅ ≥95% of high-priority tests pass
✅ All validation rules enforced
✅ All calculations accurate to 2 decimals
✅ No data loss scenarios
✅ Proper error handling throughout
✅ User-friendly error messages
✅ Performance acceptable (<2s response times)

---

**Ready to test!** Execute scenarios systematically and document all results.
