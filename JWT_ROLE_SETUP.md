# JWT Role Setup Instructions

## 🎯 Overview
This guide will help you sync user roles from the `profiles` table to the JWT token's `app_metadata`, enabling faster admin authentication without database lookups.

---

## 📋 Step 1: Run the Migration in Supabase

### **Option A: Using Supabase Dashboard**

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Open the file: `supabase/migrations/00013_sync_role_to_jwt.sql`
4. Copy the entire SQL content
5. Paste it into the SQL Editor
6. Click **Run**

### **Option B: Using Supabase CLI (if you have it set up)**

```bash
supabase db push
```

---

## 🔍 Step 2: Verify the Migration

Run this query in the SQL Editor to verify roles are synced:

```sql
SELECT 
  u.id,
  u.email,
  u.raw_app_meta_data->>'role' as jwt_role,
  p.role as profile_role
FROM auth.users u
JOIN profiles p ON u.id = p.id
LIMIT 10;
```

**Expected Result:**
- `jwt_role` should match `profile_role` for all users
- Your admin user should show `jwt_role = 'super_admin'`

---

## 👤 Step 3: Set Your User as Admin (if not already done)

If your user doesn't have admin role yet:

```sql
UPDATE profiles 
SET role = 'super_admin' 
WHERE email = 'your-email@example.com';
```

The trigger will automatically sync this to the JWT.

---

## 🔄 Step 4: Force Token Refresh

**CRITICAL:** Users must logout and login again to get a fresh JWT token with the role included.

### **For Testing:**

1. **Logout** from your application
2. **Clear browser cookies** (optional but recommended)
3. **Login again**
4. Navigate to `/admin`

### **For Production:**

After deploying, all users will need to logout and login again to get updated tokens with roles.

---

## 🧪 Step 5: Test Admin Access

1. Login with your admin account
2. Open browser DevTools → Console
3. Navigate to `/admin`
4. Check the console logs for:
   ```
   [Middleware] Admin check: { 
     userId: '...', 
     email: '...', 
     role: 'super_admin', 
     isAdmin: true, 
     path: '/admin',
     source: 'JWT'
   }
   ```

5. You should see `source: 'JWT'` confirming the role is read from the token

---

## 🚀 Deployment Checklist

- [ ] Run migration in Supabase (Step 1)
- [ ] Verify roles are synced (Step 2)
- [ ] Set your user as admin (Step 3)
- [ ] Commit and push code changes
- [ ] Deploy to Vercel
- [ ] Logout and login on production
- [ ] Test `/admin` access

---

## 🔧 How It Works

### **Before (Database Lookup):**
```
User visits /admin
  ↓
Middleware runs
  ↓
Query database for role
  ↓
Check if admin
  ↓
Allow/Deny access
```

### **After (JWT-Based):**
```
User visits /admin
  ↓
Middleware runs
  ↓
Read role from JWT token (no database query)
  ↓
Check if admin
  ↓
Allow/Deny access
```

---

## 📊 Benefits

✅ **Faster:** No database query on every request  
✅ **Scalable:** Reduces database load  
✅ **Consistent:** Role is in the token across all requests  

## ⚠️ Trade-offs

❌ **Stale Data:** Role changes require logout/login  
❌ **Token Size:** Slightly larger JWT tokens  

---

## 🐛 Troubleshooting

### **Issue: Still getting redirected from /admin**

**Solution:**
1. Check if migration ran successfully
2. Verify your user has `role = 'super_admin'` in profiles table
3. **Logout and login again** (most common issue)
4. Clear browser cookies
5. Check Vercel logs for middleware output

### **Issue: JWT role is null**

**Solution:**
1. Run the backfill query from the migration
2. Update your profile role to trigger the sync
3. Logout and login again

### **Issue: Role not updating after change**

**Solution:**
This is expected behavior with JWT-based auth. Users must logout and login to get a fresh token with the updated role.

---

## 📝 Files Modified

1. `supabase/migrations/00013_sync_role_to_jwt.sql` - Database trigger
2. `src/lib/supabase/middleware.ts` - JWT-based role check
3. `src/app/admin/layout.tsx` - JWT-based role check
4. `src/components/providers/auth-provider.tsx` - JWT-based role check

---

## 🔐 Security Notes

- The trigger uses `SECURITY DEFINER` to ensure it has permission to update `auth.users`
- Role is stored in `raw_app_meta_data` which is included in the JWT
- The JWT is signed by Supabase and cannot be tampered with
- Role validation happens server-side in middleware (secure)
