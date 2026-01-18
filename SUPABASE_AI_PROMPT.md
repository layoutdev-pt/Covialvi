# Supabase AI Agent Prompt: Set Admin Role for User

## Task
Update a user's role in the profiles table to grant admin access to the application.

## Context
- The application uses a `profiles` table that extends Supabase auth.users
- The `role` column uses an ENUM type: `user_role AS ENUM ('user', 'admin', 'super_admin')`
- Default role is 'user', which doesn't have admin panel access
- Admin panel requires role to be either 'admin' or 'super_admin'

## What I Need

### Option 1: If I know my email
Update the role for the user with email: **[INSERT YOUR EMAIL HERE]**

Set the role to: `super_admin`

### Option 2: If I know my user ID
Update the role for the user with ID: **[INSERT YOUR USER UUID HERE]**

Set the role to: `super_admin`

## Expected Result
After running the query, I should be able to:
1. Log into the application
2. Navigate to `/admin`
3. Access the admin dashboard without being redirected

## Verification
Please also show me the updated user record to confirm:
- email
- role
- first_name
- last_name
- created_at

## Database Schema Reference
```sql
CREATE TYPE user_role AS ENUM ('user', 'admin', 'super_admin');

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'user',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,
    alerts_consent BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Alternative: Direct SQL Query

If you prefer to run SQL directly in the Supabase SQL Editor:

```sql
-- Update role by email
UPDATE profiles 
SET role = 'super_admin' 
WHERE email = 'your-email@example.com';

-- Verify the update
SELECT id, email, role, first_name, last_name, created_at
FROM profiles 
WHERE email = 'your-email@example.com';
```

OR

```sql
-- Update role by user ID
UPDATE profiles 
SET role = 'super_admin' 
WHERE id = 'your-user-uuid-here';

-- Verify the update
SELECT id, email, role, first_name, last_name, created_at
FROM profiles 
WHERE id = 'your-user-uuid-here';
```
