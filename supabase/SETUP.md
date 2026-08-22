# Vone Trucking Supabase Setup Guide

## Prerequisites

1. Create a Supabase project at https://supabase.com
2. Note your project URL and anon key
3. Install Supabase CLI: `npm install -g supabase`

## Database Setup

### 1. Run Migrations

Connect to your Supabase project and run the migrations in order:

```bash
# Option 1: Using Supabase CLI
supabase db push

# Option 2: Via Supabase Dashboard
# Copy and paste each migration file content into SQL Editor and execute
```

**Migration Order:**
1. `20260822000001_initial_schema.sql` - Core tables and triggers
2. `20260822000002_rls_policies.sql` - Security policies
3. `20260822000003_test_data.sql` - Test data (development only)

### 2. Create Test User Accounts

**IMPORTANT:** Users must be created via Supabase Auth, not directly in the database.

#### Via Supabase Dashboard:

1. Go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Create these test accounts:

**Operator/Admin Account:**
- Email: `operator@vonetrucking.com`
- Password: `Operator123!`
- Auto Confirm User: **Yes**

**Driver Accounts:**
- Email: `driver1@vonetrucking.com`
- Password: `Driver123!`
- Auto Confirm User: **Yes**

- Email: `driver2@vonetrucking.com`
- Password: `Driver123!`
- Auto Confirm User: **Yes**

**Porter Accounts:**
- Email: `porter1@vonetrucking.com`
- Password: `Porter123!`
- Auto Confirm User: **Yes**

- Email: `porter2@vonetrucking.com`
- Password: `Porter123!`
- Auto Confirm User: **Yes**

### 3. Update Employee Profiles with Actual UUIDs

After creating auth users, get their UUIDs from the `auth.users` table:

```sql
SELECT id, email FROM auth.users;
```

Then update the `employee_profiles` table:

```sql
-- Update operator
UPDATE employee_profiles 
SET id = 'actual-uuid-from-auth-users'
WHERE employee_id = 'EMP001';

-- Update driver 1
UPDATE employee_profiles 
SET id = 'actual-uuid-from-auth-users'
WHERE employee_id = 'DRV001';

-- Update driver 2
UPDATE employee_profiles 
SET id = 'actual-uuid-from-auth-users'
WHERE employee_id = 'DRV002';

-- Update porter 1
UPDATE employee_profiles 
SET id = 'actual-uuid-from-auth-users'
WHERE employee_id = 'PTR001';

-- Update porter 2
UPDATE employee_profiles 
SET id = 'actual-uuid-from-auth-users'
WHERE employee_id = 'PTR002';
```

### 4. Update Test Data References

Update all foreign key references in test data tables:

```sql
-- Update trip assignments
UPDATE trip_assignments 
SET employee_id = (SELECT id FROM employee_profiles WHERE employee_id = 'DRV001')
WHERE employee_id = '00000000-0000-0000-0000-000000000002';

-- Repeat for all test data...
```

## Security Configuration

### Disable Public Registration

1. Go to **Authentication** → **Providers**
2. Find **Email** provider
3. Disable **"Enable email signups"**
4. Save changes

This ensures only operators can create accounts.

### Configure Email Templates

1. Go to **Authentication** → **Email Templates**
2. Customize:
   - Confirmation email
   - Password reset email
   - Magic link email
   - Invite email

### Enable Row Level Security

Already enabled by migration scripts. Verify with:

```sql
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = false;
```

Should return no results (all tables have RLS enabled).

## Storage Setup

### Configure Storage Buckets

Buckets are auto-created by RLS migration:
- `documents` - Delivery documents, PODs
- `receipts` - Expense receipts
- `photos` - Incident photos, profile pictures

### Verify Storage Policies

Check in **Storage** → Select bucket → **Policies** tab

## Testing Permissions

### Test Operator Access

Login as `operator@vonetrucking.com`:
- ✅ Can view all employees
- ✅ Can create/edit trucks
- ✅ Can create/edit trips
- ✅ Can assign employees to trips
- ✅ Can view all payslips
- ✅ Can approve cash advances
- ✅ Can view audit logs

### Test Driver Access

Login as `driver1@vonetrucking.com`:
- ✅ Can view own profile
- ✅ Can view assigned trips only
- ✅ Can update trip status
- ✅ Can log fuel transactions
- ✅ Can upload delivery documents
- ✅ Can view own payslips
- ❌ Cannot view other drivers' data
- ❌ Cannot create trips
- ❌ Cannot view trip income
- ❌ Cannot approve advances

### Test Porter Access

Login as `porter1@vonetrucking.com`:
- ✅ Can view own profile
- ✅ Can view assigned trips only
- ✅ Can view trip expenses
- ❌ Cannot update trip status (driver only)
- ❌ Cannot log fuel transactions (driver only)
- ❌ Cannot view payslips of others
- ❌ Cannot create trips

## Database Functions for Testing

### Check User Role

```sql
SELECT get_user_role();
```

### Check if Assigned to Trip

```sql
SELECT is_assigned_to_trip('trip-uuid-here');
```

### View RLS Policies

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
```

## Environment Variables

Update your mobile app's `.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

## Troubleshooting

### Users Can't Sign In

1. Check email confirmation status in **Authentication** → **Users**
2. Verify user exists in both `auth.users` and `employee_profiles`
3. Check if user's `is_active` flag is true in `employee_profiles`

### Permission Denied Errors

1. Check RLS policies are enabled: `SELECT * FROM pg_tables WHERE rowsecurity = false;`
2. Verify user role: `SELECT role FROM employee_profiles WHERE id = auth.uid();`
3. Check specific policy: `SELECT * FROM pg_policies WHERE tablename = 'your_table';`

### Storage Upload Fails

1. Verify bucket exists: **Storage** → Check bucket list
2. Check storage policies: **Storage** → Select bucket → **Policies**
3. Ensure file path follows user ID structure: `bucket/user_uuid/filename`

## Production Deployment

### Security Checklist

- [ ] All test accounts removed
- [ ] Strong passwords enforced (min 12 chars, complexity)
- [ ] Email signup disabled
- [ ] 2FA enabled for operators
- [ ] API keys rotated
- [ ] RLS policies tested and verified
- [ ] Audit logging enabled
- [ ] Backup strategy configured
- [ ] Rate limiting configured

### Performance Optimization

- [ ] Analyze query performance
- [ ] Add additional indexes if needed
- [ ] Configure connection pooling
- [ ] Enable query caching
- [ ] Monitor slow queries

## Support

For issues or questions:
1. Check Supabase documentation: https://supabase.com/docs
2. Review RLS policy syntax: https://supabase.com/docs/guides/auth/row-level-security
3. Contact development team

---

**Last Updated:** August 22, 2026
**Version:** 1.0.0
