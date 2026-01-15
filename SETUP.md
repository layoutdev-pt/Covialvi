# Covialvi - Setup Guide

## Quick Deploy to Vercel

### 1. Supabase Setup

Before deploying, run these SQL commands in your Supabase SQL Editor:

#### Add divisions column (required)
```sql
ALTER TABLE properties ADD COLUMN IF NOT EXISTS divisions jsonb DEFAULT NULL;
COMMENT ON COLUMN properties.divisions IS 'JSON object storing room divisions with their areas';
```

#### Create storage buckets (required for document uploads)
```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-documents', 'property-documents', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('property-floor-plans', 'property-floor-plans', true)
ON CONFLICT (id) DO NOTHING;
```

### 2. Vercel Environment Variables

Add these environment variables in Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_NAME=Covialvi
```

#### Optional - Google OAuth (for calendar integration)
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

To configure Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `https://your-domain.vercel.app/api/auth/google/callback`

### 3. Deploy

```bash
# Push to GitHub (Vercel auto-deploys)
git push origin main
```

Or connect your GitHub repo to Vercel for automatic deployments.

## Local Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

## Troubleshooting

### "Could not find the 'divisions' column"
Run the SQL migration above in Supabase SQL Editor.

### "OAuth client was not found" (Google login)
Configure Google OAuth credentials in Vercel environment variables.

### Document upload errors
Ensure storage buckets exist in Supabase (see SQL above).
