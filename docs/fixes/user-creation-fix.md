# User Creation Database Error Fix

## Problem
When new users signed up, the database trigger that should auto-create `users_profile` and `family_profiles` records was failing with:
- `new row violates row-level security policy for table "family_profiles"`
- `relation "users_profile" does not exist`

## Root Cause
The `handle_new_user()` trigger function was running with `SECURITY DEFINER` but the RLS (Row Level Security) policies on both tables were too strict:
- The RLS policy checked `auth.uid() = user_id` 
- In the trigger context, `auth.uid()` was NULL, causing the comparison to fail
- This blocked the insert even though the system should be allowed to create initial profiles

## Solution
Updated the trigger function and RLS policies in the database:

### 1. Fixed Trigger Function
- Explicitly specified table schemas (`public.users_profile`, `public.family_profiles`)
- Added `SET search_path = public` for proper schema context
- Ensured the trigger properly handles the initial user profile creation

### 2. Updated RLS Policies
Changed the RLS policies to allow inserts when:
- User owns the record (`auth.uid() = user_id`) - normal user operations
- Insert comes from system (when `auth.jwt()` IS NULL) - trigger operations

```sql
WITH CHECK (auth.uid() = user_id OR auth.jwt() IS NULL)
```

This pattern allows:
- Regular authenticated users to create their own records
- System triggers to create records without auth context

## Testing
Verified the fix with two test scenarios:
1. ✅ User signup creates users_profile record
2. ✅ User signup creates family_profiles record with `is_self = true`
3. ✅ Dashboard can load all profile data after signup

## Files Changed
- **Database**: Modified trigger function `handle_new_user()` and RLS policies on:
  - `users_profile`
  - `family_profiles`

## Impact
- Users can now successfully sign up without database errors
- Profile data is automatically created on signup
- Dashboard loads successfully with complete user data
