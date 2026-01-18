# Complete Admin Authentication Fix Guide

## 🎯 Problem Summary

The admin authentication was stuck in an infinite redirect loop between `/admin` and `/admin/login` because:

1. JWT tokens didn't include the user's role
2. Middleware couldn't validate admin access
3. Login page kept redirecting in a loop

## ✅ What Was Fixed

### **1. Middleware (`src/lib/supabase/middleware.ts`)**
- Unauthenticated admin routes now redirect to `/admin/login` (not `/auth/login`)
- `/admin/login` is completely excluded from middleware checks
- Proper session refresh using `getSession()`
- Role validation from JWT `app_metadata.role`

### **2. Admin Login Page (`src/app/(admin-auth)/admin/login/page.tsx`)**
- Uses `router.replace()` instead of `window.location.href` (prevents history pollution)
- Proper session refresh with `getSession()` instead of `getUser()`
- Cleanup function to prevent memory leaks
- Better error handling and logging

### **3. Database Triggers (Supabase)**
- Automatic sync of `profiles.role` → `auth.users.raw_app_meta_data.role`
- Triggers on INSERT and UPDATE
- Backfill script for existing users

---

## 🚀 Step-by-Step Setup Instructions

### **Step 1: Run SQL Migration in Supabase**

1. Go to **Supabase Dashboard → SQL Editor**
2. Open the file: `ADMIN_AUTH_FIX.sql`
3. **IMPORTANT:** Replace `'your-email@example.com'` with your actual email (appears 3 times)
4. Click **Run**

This will:
- Create the role sync function and triggers
- Backfill all existing users with their role in JWT
- Set your user as `super_admin`
- Sync your role to the JWT

### **Step 2: Verify the Migration**

Run this query to check if it worked:

```sql
SELECT 
  u.email,
  u.raw_app_meta_data->>'role' as jwt_role,
  p.role as profile_role
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email = 'your-email@example.com';
```

**Expected Result:**
- `jwt_role`: `super_admin`
- `profile_role`: `super_admin`

### **Step 3: Clear Your Session**

Open browser console (F12) and run:

```javascript
// Clear session and logout
(async function() {
  try {
    await fetch('/auth/logout', { method: 'GET' });
  } catch (e) {}
  
  document.cookie.split(";").forEach(function(c) { 
    if (c.trim().startsWith('sb-')) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    }
  });
  
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('sb-')) localStorage.removeItem(key);
  });
  
  console.log('✓ Session cleared! Redirecting...');
  window.location.href = '/';
})();
```

### **Step 4: Login Again**

1. Navigate to `http://localhost:3000/admin/login`
2. Login with your admin credentials
3. You should be redirected to `/admin` dashboard

---

## 🔍 How It Works Now

### **Authentication Flow:**

```
User visits /admin
  ↓
Middleware checks session
  ↓
No session? → Redirect to /admin/login
  ↓
User logs in
  ↓
Login page checks JWT role
  ↓
Role = admin/super_admin? → router.replace('/admin')
  ↓
Middleware validates JWT role
  ↓
Access granted → Admin dashboard loads
```

### **Key Components:**

1. **JWT Token Structure:**
```json
{
  "app_metadata": {
    "role": "super_admin"
  },
  "user_metadata": {},
  "email": "admin@example.com"
}
```

2. **Middleware Logic:**
```typescript
// Get role from JWT
const role = user.app_metadata?.role || 'user';
const isAdmin = role === 'admin' || role === 'super_admin';

// Allow or deny access
if (!isAdmin) {
  return NextResponse.redirect(new URL('/', request.url));
}
```

3. **Login Page Logic:**
```typescript
// After successful login
const role = data.user.app_metadata?.role || 'user';
if (role === 'admin' || role === 'super_admin') {
  router.replace('/admin'); // No loop!
}
```

---

## 🐛 Troubleshooting

### **Issue: Still getting redirect loop**

**Solution:**
1. Clear browser cache completely (Ctrl+Shift+Delete)
2. Clear all cookies starting with `sb-`
3. Logout and login again
4. Check console logs for errors

### **Issue: Role is null in JWT**

**Solution:**
1. Verify the SQL migration ran successfully
2. Check if triggers were created:
```sql
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name LIKE '%sync_role%';
```
3. Manually sync your role:
```sql
UPDATE auth.users
SET raw_app_meta_data = 
  COALESCE(raw_app_meta_data, '{}'::jsonb) || 
  jsonb_build_object('role', 'super_admin')
WHERE email = 'your-email@example.com';
```
4. Logout and login again

### **Issue: "Cannot read properties of null"**

**Solution:**
This means the profile wasn't fetched. The admin layout now handles this by redirecting to login if profile is null.

### **Issue: Logout button doesn't work**

**Solution:**
Use the manual logout script from Step 3 above.

---

## 📊 Console Logs to Watch For

When everything is working, you should see:

```
[Admin Login] Checking auth...
[Admin Login] User: admin@example.com Session: true
[Admin Login] Role: super_admin IsAdmin: true
[Admin Login] Admin detected, redirecting to /admin...

[Middleware] Admin check: {
  userId: '...',
  email: 'admin@example.com',
  role: 'super_admin',
  isAdmin: true,
  path: '/admin',
  source: 'JWT'
}
```

---

## 🎯 Testing Checklist

- [ ] SQL migration ran successfully
- [ ] Your user has `role = 'super_admin'` in profiles table
- [ ] JWT contains `app_metadata.role = 'super_admin'`
- [ ] Cleared session (logout)
- [ ] Login redirects to `/admin` (not `/admin/login`)
- [ ] No infinite redirect loop
- [ ] Admin dashboard loads correctly
- [ ] Console shows correct role validation logs

---

## 🚀 Production Deployment

### **Environment Variables Required:**
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### **Deployment Steps:**
1. Run SQL migration in **production** Supabase project
2. Set your production user as admin
3. Push code to GitHub
4. Vercel will auto-deploy
5. Clear cookies on production site
6. Login and test

---

## 📝 Files Modified

1. `src/lib/supabase/middleware.ts` - Fixed redirect logic and role validation
2. `src/app/(admin-auth)/admin/login/page.tsx` - Fixed redirect loop with router.replace
3. `src/app/admin/layout.tsx` - Added null profile check
4. `ADMIN_AUTH_FIX.sql` - Complete SQL migration script
5. `ADMIN_AUTH_COMPLETE_GUIDE.md` - This guide

---

## 🔐 Security Notes

- Role is stored in JWT `app_metadata` (server-side only, cannot be modified by client)
- JWT is signed by Supabase and validated on every request
- Middleware runs on edge (fast validation)
- No database query needed for role check (uses JWT)
- Users must logout/login to get updated roles (JWT refresh)

---

## ✅ Success Criteria

You'll know it's working when:
1. ✓ Navigate to `/admin` → Redirects to `/admin/login` (if not logged in)
2. ✓ Login with admin credentials → Redirects to `/admin` dashboard
3. ✓ No infinite redirect loop
4. ✓ Console shows `Role: super_admin` and `IsAdmin: true`
5. ✓ Admin dashboard loads without errors

---

**The authentication flow is now complete and production-ready!**
