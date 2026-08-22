# Payroll and Cash Advance Management - Test Scenarios

This document provides comprehensive test scenarios for validating all features of the payroll and cash advance management system.

## Table of Contents

1. [Compensation Calculation Tests](#compensation-calculation-tests)
2. [Cash Advance Tests](#cash-advance-tests)
3. [Payroll Processing Tests](#payroll-processing-tests)
4. [Deduction Tests](#deduction-tests)
5. [Correction and Audit Tests](#correction-and-audit-tests)
6. [Access Control Tests](#access-control-tests)
7. [Validation Tests](#validation-tests)
8. [Edge Cases and Error Handling](#edge-cases-and-error-handling)

---

## Compensation Calculation Tests

### Test 1.1: Weekly Salary Calculation
**Objective:** Verify weekly salary with full week worked

**Setup:**
- Employee: John Driver
- Compensation: Weekly salary $700
- Period: 7 days (full week)

**Steps:**
1. Create payroll period for 7 days
2. Calculate payroll for employee
3. Verify gross pay

**Expected Result:**
- Gross Pay: $700.00
- Earnings breakdown shows "Weekly Salary: $700.00"

---

### Test 1.2: Weekly Salary with Partial Week
**Objective:** Verify prorated weekly salary for partial week

**Setup:**
- Employee: John Driver
- Compensation: Weekly salary $700
- Period: 5 days worked (out of 7)

**Steps:**
1. Create payroll period
2. Mark attendance for 5 days
3. Calculate payroll

**Expected Result:**
- Gross Pay: $500.00 (700 × 5/7)
- Calculation notes show proration: "5 days worked out of 7"

---

### Test 1.3: Monthly Salary Calculation
**Objective:** Verify monthly salary with full month worked

**Setup:**
- Employee: Office Staff
- Compensation: Monthly salary $3,000
- Period: Full month (30 days)

**Steps:**
1. Create payroll period for full month
2. Calculate payroll

**Expected Result:**
- Gross Pay: $3,000.00
- Earnings breakdown shows "Monthly Salary: $3,000.00"

---

### Test 1.4: Monthly Salary with Partial Month
**Objective:** Verify prorated monthly salary

**Setup:**
- Employee: Office Staff
- Compensation: Monthly salary $3,000
- Period: 15 days worked (out of 30-day month)

**Steps:**
1. Create payroll period
2. Mark attendance for 15 days
3. Calculate payroll

**Expected Result:**
- Gross Pay: $1,500.00 (3,000 × 15/30)
- Calculation notes show: "15 days worked out of 30"

---

### Test 1.5: Daily Rate Calculation
**Objective:** Verify daily rate with variable days worked

**Setup:**
- Employee: Temporary Worker
- Compensation: Daily rate $150
- Period: 12 days worked

**Steps:**
1. Create attendance records for 12 days (status: present)
2. Calculate payroll

**Expected Result:**
- Gross Pay: $1,800.00 (150 × 12)
- Earnings breakdown shows each day worked

---

### Test 1.6: Per-Trip Earnings (Approved Only)
**Objective:** Verify only approved trips count toward earnings

**Setup:**
- Employee: Driver
- Compensation: Per-trip rate $500
- Trips: 5 completed (3 approved, 2 not approved)

**Steps:**
1. Create 5 trip records for employee
2. Mark 3 as approved, 2 as not approved
3. Calculate payroll

**Expected Result:**
- Gross Pay: $1,500.00 (500 × 3 approved trips)
- Earnings breakdown lists only 3 approved trips
- Calculation notes: "3 approved trips out of 5 completed"

---

### Test 1.7: Destination-Based Rates
**Objective:** Verify different rates for different destinations

**Setup:**
- Employee: Driver
- Compensation: Destination-based
- Trips:
  - 2 trips to "City A" (rate: $600)
  - 3 trips to "City B" (rate: $450)

**Steps:**
1. Create destination rate configuration
2. Create 5 approved trips
3. Calculate payroll

**Expected Result:**
- Gross Pay: $2,550.00 (2×600 + 3×450)
- Earnings breakdown shows:
  - "City A trips (2): $1,200.00"
  - "City B trips (3): $1,350.00"

---

### Test 1.8: Hourly Rate with Overtime
**Objective:** Verify hourly wages with overtime multiplier

**Setup:**
- Employee: Warehouse Staff
- Compensation: Hourly rate $20
- Hours: 45 regular hours + 10 overtime hours
- Overtime threshold: 40 hours
- Overtime multiplier: 1.5x

**Steps:**
1. Create attendance records with 55 total hours
2. Configure overtime rules (threshold: 40, multiplier: 1.5)
3. Calculate payroll

**Expected Result:**
- Regular Pay: $800.00 (40 × 20)
- Overtime Pay: $300.00 (10 × 20 × 1.5)
- Gross Pay: $1,100.00
- Earnings breakdown shows separate regular and overtime lines

---

### Test 1.9: Multiple Allowances
**Objective:** Verify multiple allowance types with different frequencies

**Setup:**
- Employee: Driver
- Base Pay: $2,000
- Allowances:
  - Meal allowance: $50/day (20 days)
  - Fuel allowance: $200/month
  - Phone allowance: $100/month
  - One-time bonus: $500

**Steps:**
1. Configure all allowances
2. Calculate payroll

**Expected Result:**
- Base Pay: $2,000.00
- Meal Allowance: $1,000.00 (50 × 20)
- Fuel Allowance: $200.00
- Phone Allowance: $100.00
- One-time Bonus: $500.00
- Gross Pay: $3,800.00

---

### Test 1.10: Performance Bonus with Conditions
**Objective:** Verify bonus awarded only when conditions met

**Setup:**
- Employee: Driver
- Base Pay: $2,000
- Performance Bonus: $500 (requires 10+ trips)
- Actual Trips: 12 approved trips

**Steps:**
1. Configure bonus with condition: minimum_trips_completed = 10
2. Calculate payroll

**Expected Result:**
- Base Pay: $2,000.00
- Performance Bonus: $500.00
- Gross Pay: $2,500.00
- Bonus notes: "Condition met: 12 trips >= 10 minimum"

---

### Test 1.11: Bonus Not Awarded (Conditions Not Met)
**Objective:** Verify bonus not awarded when conditions fail

**Setup:**
- Employee: Driver
- Base Pay: $2,000
- Performance Bonus: $500 (requires 10+ trips)
- Actual Trips: 8 approved trips

**Steps:**
1. Configure bonus with condition
2. Calculate payroll

**Expected Result:**
- Base Pay: $2,000.00
- No Performance Bonus
- Gross Pay: $2,000.00
- Calculation notes: "Bonus not awarded: 8 trips < 10 minimum"

---

## Cash Advance Tests

### Test 2.1: Eligibility Check - Qualified Employee
**Objective:** Verify eligible employee can request advance

**Setup:**
- Employee: 6 months employed
- Current Balance: $0
- Requested Amount: $1,000

**Steps:**
1. Check eligibility for $1,000 advance
2. Verify eligibility result

**Expected Result:**
- is_eligible: true
- max_eligible_amount: $2,000 (or configured max)
- No blocking reasons

---

### Test 2.2: Eligibility Check - Insufficient Employment Duration
**Objective:** Verify employee with less than minimum employment denied

**Setup:**
- Employee: 2 months employed
- Minimum Required: 3 months
- Requested Amount: $1,000

**Steps:**
1. Check eligibility
2. Verify result

**Expected Result:**
- is_eligible: false
- reasons: ["Minimum employment period not met: 2 months < 3 months required"]

---

### Test 2.3: Eligibility Check - Outstanding Balance
**Objective:** Verify employee with outstanding balance denied

**Setup:**
- Employee: 1 year employed
- Current Balance: $800 (outstanding)
- Maximum Outstanding: $500
- Requested Amount: $1,000

**Steps:**
1. Check eligibility
2. Verify result

**Expected Result:**
- is_eligible: false
- reasons: ["Outstanding balance ($800.00) exceeds maximum allowed ($500.00)"]

---

### Test 2.4: Cash Advance Request Creation
**Objective:** Verify advance request created with correct terms

**Setup:**
- Employee: John Driver
- Amount: $1,500
- Purpose: "Medical emergency"

**Steps:**
1. Create cash advance request
2. Verify request details and repayment terms

**Expected Result:**
- Status: "pending"
- Amount: $1,500.00
- Repayment terms automatically calculated:
  - number_of_installments: 3 (or configured)
  - installment_amount: $500.00
  - frequency: "biweekly" (or configured)

---

### Test 2.5: Approve Cash Advance
**Objective:** Verify operator can approve request

**Setup:**
- Existing request: $1,000 (status: pending)
- Operator: Manager

**Steps:**
1. Operator approves request
2. Verify status change

**Expected Result:**
- Status: "approved"
- approved_by: "Manager"
- approved_at: timestamp set

---

### Test 2.6: Reject Cash Advance with Reason
**Objective:** Verify rejection requires reason

**Setup:**
- Existing request: $1,000 (status: pending)

**Steps:**
1. Attempt to reject without reason (should fail)
2. Reject with reason: "Insufficient documentation"
3. Verify rejection

**Expected Result:**
- First attempt fails with error
- Second attempt succeeds:
  - Status: "rejected"
  - rejection_reason: "Insufficient documentation"
  - rejected_by: operator ID
  - rejected_at: timestamp

---

### Test 2.7: Disburse Cash Advance
**Objective:** Verify disbursement tracking

**Setup:**
- Approved request: $1,000
- Method: "bank_transfer"
- Reference: "TXN123456"

**Steps:**
1. Disburse advance
2. Verify transaction recorded

**Expected Result:**
- Request status: "disbursed"
- Transaction created:
  - transaction_type: "advance"
  - amount: $1,000.00
  - disbursement_method: "bank_transfer"
  - payment_reference: "TXN123456"

---

### Test 2.8: Manual Repayment
**Objective:** Verify operator can record manual payment

**Setup:**
- Disbursed advance: $1,000
- Current balance: $1,000
- Manual payment: $400

**Steps:**
1. Record manual repayment of $400
2. Verify balance updated

**Expected Result:**
- Transaction created:
  - transaction_type: "repayment"
  - amount: $400.00
- Remaining balance: $600.00
- Request status: "repaying"

---

### Test 2.9: Partial Payroll Deduction (Respecting Limits)
**Objective:** Verify deduction respects max percentage and minimum net pay

**Setup:**
- Employee gross pay: $2,000
- Outstanding advance: $1,000
- Regular installment: $500
- Max deduction percentage: 20%
- Mandatory deductions (tax, etc.): $300
- Minimum net pay percentage: 40%

**Steps:**
1. Calculate payroll deduction
2. Verify limits respected

**Expected Result:**
- Maximum allowed deduction: $400 (20% of $2,000)
- But minimum net pay: $800 (40% of $2,000)
- After mandatory deductions ($300), remaining: $1,700
- Actual deduction: $400 (respects both limits)
- Calculation notes explain limits

---

### Test 2.10: Complete Advance Repayment
**Objective:** Verify status changes to completed when fully paid

**Setup:**
- Disbursed advance: $1,000
- Current balance: $200 (after previous payments)
- Final payment: $200

**Steps:**
1. Process final repayment
2. Verify status update

**Expected Result:**
- Transaction recorded: $200
- Remaining balance: $0.00
- Status: "completed"
- completed_at: timestamp set

---

## Payroll Processing Tests

### Test 3.1: Complete 10-Step Workflow
**Objective:** Verify full payroll cycle from creation to payment

**Steps:**
1. Create payroll period (2024-01-01 to 2024-01-15, pay date 2024-01-20)
2. Calculate payroll for all employees
3. Review preview with summary
4. Make correction (adjust one employee's gross pay)
5. Approve payroll
6. Generate payslips
7. Mark as paid

**Expected Result:**
- Period progresses through statuses: draft → calculating → preview → approved → paid
- All employees have payroll records
- Correction is recorded with audit trail
- Payslips generated for all employees
- Cash advance deductions processed automatically

---

### Test 3.2: Payroll Period Validation
**Objective:** Verify date validation

**Test Cases:**
1. Period start after period end (should fail)
2. Pay date before period end (should fail)
3. Valid dates (should succeed)

**Expected Results:**
- Invalid cases show appropriate error messages
- Valid case creates period successfully

---

### Test 3.3: Payroll Preview Generation
**Objective:** Verify preview shows accurate summary

**Setup:**
- 10 employees with varying compensation
- Total expected gross: $25,000
- Total expected deductions: $5,000
- 3 employees with cash advances

**Steps:**
1. Calculate payroll
2. Generate preview
3. Verify summary

**Expected Result:**
- Summary shows:
  - total_employees: 10
  - total_gross_pay: $25,000.00
  - total_deductions: $5,000.00
  - total_net_pay: $20,000.00
  - employees_with_advances: 3
  - Breakdown by role
  - Breakdown by compensation method

---

### Test 3.4: Correction with Audit Trail
**Objective:** Verify corrections are tracked

**Setup:**
- Employee payroll record: gross_pay = $2,000

**Steps:**
1. Make correction: change gross_pay to $2,200
2. Provide reason: "Missing overtime hours"
3. Verify correction recorded

**Expected Result:**
- Payroll record updated: gross_pay = $2,200
- Correction record created:
  - field_changed: "gross_pay"
  - old_value: 2000
  - new_value: 2200
  - reason: "Missing overtime hours"
  - amount_difference: 200
- Record has_corrections: true
- Audit log entry created

---

### Test 3.5: Cannot Correct After Approval
**Objective:** Verify approved payroll cannot be corrected

**Setup:**
- Payroll period: status "approved"
- Employee record in this period

**Steps:**
1. Attempt to make correction
2. Verify error thrown

**Expected Result:**
- Error: "Cannot correct record with status: approved"
- No changes made to record

---

### Test 3.6: Payroll Approval Validation
**Objective:** Verify all records validated before approval

**Setup:**
- 10 employee records
- 1 record has negative net pay

**Steps:**
1. Attempt to approve payroll
2. Verify validation failure

**Expected Result:**
- Approval fails
- Error message identifies problematic employee
- Validation error: "Net pay cannot be negative"

---

### Test 3.7: Payslip Generation
**Objective:** Verify payslips generated with complete information

**Setup:**
- Approved payroll period
- Employee record with:
  - 5 earning line items
  - 4 deduction line items
  - Cash advance deduction: $300

**Steps:**
1. Generate payslips
2. Verify payslip content

**Expected Result:**
- Payslip contains:
  - Employee information
  - Pay period dates
  - All earnings with descriptions and amounts
  - All deductions with descriptions and amounts
  - Gross pay, total deductions, net pay
  - Cash advance information (deduction and remaining balance)
  - YTD totals
  - Generation timestamp

---

### Test 3.8: Mark as Paid - Cash Advance Processing
**Objective:** Verify cash advance deductions processed when marked paid

**Setup:**
- Approved payroll
- 2 employees with cash advance deductions ($500 and $300)

**Steps:**
1. Mark payroll as paid
2. Verify cash advance transactions

**Expected Result:**
- Payroll status: "paid"
- paid_by and paid_at set
- Cash advance transactions created:
  - Employee 1: repayment transaction $500
  - Employee 2: repayment transaction $300
- Cash advance balances updated
- Advance statuses updated (to "repaying" or "completed")

---

### Test 3.9: Cannot Mark Unapproved Payroll as Paid
**Objective:** Verify payroll must be approved before marking paid

**Setup:**
- Payroll period: status "preview"

**Steps:**
1. Attempt to mark as paid
2. Verify error

**Expected Result:**
- Error: "Cannot mark as paid with status: preview"
- Status remains "preview"

---

## Deduction Tests

### Test 4.1: Deduction Priority Order
**Objective:** Verify deductions applied in correct order

**Setup:**
- Gross pay: $2,000
- Deductions:
  - Tax: 15% = $300
  - Social Security: 6.2% = $124
  - Cash Advance: $500
  - Loan Repayment: $200
- Priority order: tax → social_security → cash_advance → loan_repayment

**Steps:**
1. Calculate deductions
2. Verify order

**Expected Result:**
- Deductions list ordered:
  1. Tax: $300
  2. Social Security: $124
  3. Cash Advance: $500 (or adjusted if limits apply)
  4. Loan Repayment: $200 (or adjusted)

---

### Test 4.2: Cash Advance Deduction with Limits
**Objective:** Verify cash advance deduction respects limits

**Setup:**
- Gross pay: $2,000
- Mandatory deductions: $400
- Max cash advance deduction: 20% of gross
- Minimum net pay: 40% of gross
- Outstanding advance: $1,000

**Steps:**
1. Calculate deductions
2. Verify limits enforced

**Expected Result:**
- Max allowed: $400 (20% of $2,000)
- After mandatory $400, remaining $1,600
- Min net pay: $800 (40% of $2,000)
- Max cash advance deduction: $400
- Net pay: $1,200 (meets minimum requirement)

---

### Test 4.3: Insufficient Funds for All Deductions
**Objective:** Verify behavior when gross pay insufficient

**Setup:**
- Gross pay: $1,000
- Required deductions:
  - Tax: $300
  - Social Security: $124
  - Cash Advance: $800

**Steps:**
1. Calculate deductions
2. Apply minimum net pay rule (40% = $400)

**Expected Result:**
- Mandatory deductions: $424 applied in full
- Cash advance: reduced or skipped to maintain minimum net
- Net pay: at least $400
- Calculation notes explain deduction limitation

---

## Correction and Audit Tests

### Test 5.1: Correction Reason Required
**Objective:** Verify corrections require detailed reason

**Steps:**
1. Attempt correction without reason (should fail)
2. Attempt with short reason "typo" (should fail if < 10 chars)
3. Attempt with detailed reason (should succeed)

**Expected Result:**
- First two attempts fail with appropriate errors
- Third attempt succeeds
- Reason recorded in correction record

---

### Test 5.2: Audit Log for All Actions
**Objective:** Verify all major actions logged

**Actions to Test:**
1. Create payroll period
2. Calculate payroll
3. Make correction
4. Approve payroll
5. Mark as paid
6. Approve cash advance
7. Reject cash advance
8. Disburse cash advance

**Expected Result:**
- Each action creates audit log entry with:
  - entity_type
  - entity_id
  - action
  - user_id
  - user_name
  - user_role
  - timestamp
  - relevant details (changes, reason, etc.)

---

### Test 5.3: Correction History
**Objective:** Verify all corrections tracked

**Setup:**
- Make 3 corrections to same payroll record

**Steps:**
1. Correction 1: gross_pay $2,000 → $2,100
2. Correction 2: net_pay $1,600 → $1,680
3. Correction 3: gross_pay $2,100 → $2,200

**Expected Result:**
- 3 correction records created
- Each shows:
  - Old value
  - New value
  - Amount difference
  - Reason
  - Timestamp
  - Corrected by
- Payroll record shows has_corrections: true

---

## Access Control Tests

### Test 6.1: Employee Can Only View Own Records
**Objective:** Verify employees cannot access other employees' data

**Setup:**
- Employee A (ID: EMP001)
- Employee B (ID: EMP002)

**Steps:**
1. Employee A requests their payslips (should succeed)
2. Employee A attempts to view Employee B's payslips (should fail/return empty)

**Expected Result:**
- Employee A sees only their own payslips
- No access to Employee B's data

---

### Test 6.2: Employee Cannot Approve Cash Advances
**Objective:** Verify only operators can approve advances

**Setup:**
- Cash advance request (status: pending)

**Steps:**
1. Attempt approval with employee credentials (should fail)
2. Attempt approval with operator credentials (should succeed)

**Expected Result:**
- Employee attempt rejected
- Operator approval succeeds
- approved_by set to operator ID

---

### Test 6.3: Employee Cannot Modify Payroll
**Objective:** Verify employees cannot make corrections

**Setup:**
- Payroll record

**Steps:**
1. Employee attempts to make correction (should fail)
2. Operator makes correction (should succeed)

**Expected Result:**
- Employee attempt rejected
- Only operators can correct records

---

### Test 6.4: Operator Access to All Records
**Objective:** Verify operators can view/manage all employee records

**Setup:**
- Multiple employees with payroll and cash advances

**Steps:**
1. Operator views payroll preview (all employees)
2. Operator views cash advance requests (all employees)

**Expected Result:**
- Operator sees all records
- Can filter and search across all employees

---

## Validation Tests

### Test 7.1: Positive Net Pay Validation
**Objective:** Verify net pay cannot be negative

**Setup:**
- Gross pay: $1,000
- Deductions: $1,200

**Steps:**
1. Calculate payroll
2. Validate record

**Expected Result:**
- Validation fails
- Error: "Net pay cannot be negative"
- Record flagged as invalid

---

### Test 7.2: Minimum Net Pay Percentage
**Objective:** Verify minimum net pay percentage enforced

**Setup:**
- Gross pay: $2,000
- Minimum net pay: 40%
- Deductions attempt: $1,500

**Steps:**
1. Calculate deductions
2. Validate

**Expected Result:**
- Deductions reduced to $1,200
- Net pay: $800 (40% of gross)
- Warning: "Deductions limited to maintain minimum net pay"

---

### Test 7.3: Calculation Accuracy Validation
**Objective:** Verify gross - deductions = net

**Setup:**
- Manually set values:
  - Gross: $2,000
  - Deductions: $400
  - Net: $1,500 (intentionally wrong)

**Steps:**
1. Validate record

**Expected Result:**
- Validation fails
- Error: "Net pay calculation mismatch"
- Expected: $1,600, got: $1,500

---

### Test 7.4: Cash Advance Amount Validation
**Objective:** Verify advance amount within limits

**Steps:**
1. Request advance of $0 (should fail)
2. Request advance of $100,000 (exceeds max, should fail)
3. Request advance of $1,000 (within limits, should succeed)

**Expected Result:**
- First two fail with appropriate errors
- Third succeeds

---

### Test 7.5: Purpose Minimum Length
**Objective:** Verify purpose must be detailed

**Steps:**
1. Create advance request with purpose "need" (too short)
2. Create with purpose "Medical emergency requiring immediate treatment" (valid)

**Expected Result:**
- First fails: "Purpose must be at least 10 characters"
- Second succeeds

---

## Edge Cases and Error Handling

### Test 8.1: Zero Gross Pay
**Objective:** Handle employee with no earnings

**Setup:**
- Employee with no trips, no attendance, no base pay

**Steps:**
1. Calculate payroll

**Expected Result:**
- Gross pay: $0.00
- Validation warning (if configured)
- Record still created

---

### Test 8.2: All Trips Unapproved
**Objective:** Handle trip-based employee with no approved trips

**Setup:**
- Driver (per-trip compensation)
- 5 completed trips, 0 approved

**Steps:**
1. Calculate payroll

**Expected Result:**
- Gross pay: $0.00
- Calculation notes: "0 approved trips out of 5 completed"
- Warning/flag for review

---

### Test 8.3: Concurrent Payroll Processing
**Objective:** Verify data integrity with concurrent operations

**Setup:**
- Same payroll period

**Steps:**
1. Start payroll calculation
2. Simultaneously attempt second calculation

**Expected Result:**
- One succeeds, other fails with appropriate error
- No data corruption

---

### Test 8.4: Missing Employee Data
**Objective:** Handle incomplete employee records gracefully

**Setup:**
- Employee with missing compensation config

**Steps:**
1. Attempt to calculate payroll

**Expected Result:**
- Error logged
- Specific employee skipped
- Other employees processed normally
- Clear error message identifying issue

---

### Test 8.5: Deleted/Inactive Employees
**Objective:** Handle employees no longer active

**Setup:**
- Payroll period with mix of active and inactive employees

**Steps:**
1. Calculate payroll

**Expected Result:**
- Only active employees included
- Or inactive employees included but flagged
- Clear indication of employee status

---

### Test 8.6: Retroactive Corrections After Payment
**Objective:** Verify corrections not allowed after payment

**Setup:**
- Paid payroll period

**Steps:**
1. Attempt to make correction

**Expected Result:**
- Error: "Cannot correct paid payroll"
- Guidance to create adjustment in next period

---

### Test 8.7: Maximum Deduction Edge Case
**Objective:** Verify behavior when all deductions would violate minimum net pay

**Setup:**
- Gross pay: $500
- Mandatory deductions: $400
- Minimum net pay: 40% = $200

**Steps:**
1. Calculate deductions

**Expected Result:**
- Deductions reduced to $300 (to achieve $200 net)
- Warning: "Mandatory deductions reduced due to minimum net pay requirement"
- Flag for operator review

---

### Test 8.8: Partial Repayment Completes Advance
**Objective:** Handle final partial payment that completes advance

**Setup:**
- Outstanding balance: $150
- Regular installment: $500

**Steps:**
1. Process payroll deduction

**Expected Result:**
- Deduction: $150 (only remaining balance)
- Balance: $0.00
- Status: "completed"
- No overpayment

---

### Test 8.9: Multiple Active Cash Advances
**Objective:** Verify handling of multiple advances per employee

**Setup:**
- Employee with 2 active advances:
  - Advance A: $800 remaining
  - Advance B: $600 remaining
- Payroll deduction budget: $400

**Steps:**
1. Calculate cash advance deduction

**Expected Result:**
- Deduction split between advances (oldest first)
- Or partial payment to one advance
- Clear calculation notes
- Both advances updated correctly

---

### Test 8.10: Year-to-Date Calculation Accuracy
**Objective:** Verify YTD totals accumulate correctly

**Setup:**
- Employee with 3 previous payroll periods:
  - Period 1: Gross $2,000, Net $1,600
  - Period 2: Gross $2,200, Net $1,760
  - Period 3: Gross $2,100, Net $1,680

**Steps:**
1. Generate payslip for Period 3
2. Verify YTD totals

**Expected Result:**
- YTD Gross: $6,300
- YTD Net: $5,040
- YTD Deductions: $1,260

---

## Test Execution Checklist

### Before Testing
- [ ] Verify all services are properly imported and instantiated
- [ ] Clear AsyncStorage to start with clean state
- [ ] Prepare test data (employees, trips, attendance)
- [ ] Configure system parameters (deduction limits, overtime rules, etc.)

### During Testing
- [ ] Record all test results
- [ ] Document any failures with screenshots/logs
- [ ] Note any unexpected behaviors
- [ ] Test on different devices/screen sizes
- [ ] Verify offline functionality (AsyncStorage persistence)

### After Testing
- [ ] Verify all AsyncStorage keys populated correctly
- [ ] Check audit logs for completeness
- [ ] Confirm no data corruption
- [ ] Review error messages for clarity
- [ ] Validate calculation accuracy with manual checks

---

## Success Criteria

All tests should pass with:
- ✅ Accurate calculations (to 2 decimal places)
- ✅ Proper status transitions
- ✅ Complete audit trails
- ✅ Appropriate error messages
- ✅ No data loss or corruption
- ✅ Clear calculation breakdowns
- ✅ Validation rules enforced
- ✅ Access controls working
- ✅ Edge cases handled gracefully

---

## Notes for Production

1. **Replace Mock Data:** All test scenarios use mock data. In production, integrate with actual employee, trip, and attendance data sources.

2. **PDF Generation:** Current implementation uses Share API for text export. Implement actual PDF generation library (e.g., react-native-pdf or similar).

3. **Date Picker:** Replace text input with actual date picker component for better UX.

4. **Real-time Sync:** Consider adding sync mechanism if backend API is implemented.

5. **Permissions:** Implement actual authentication and role-based access control.

6. **YTD Calculations:** Implement actual year-to-date accumulation across multiple pay periods.

7. **Reporting:** Add export functionality for payroll reports, summaries, and audit logs.

8. **Notifications:** Consider adding notifications for employees (payslip ready, cash advance approved, etc.).

---

**Document Version:** 1.0  
**Last Updated:** December 2024  
**Prepared By:** Payroll System Development Team
