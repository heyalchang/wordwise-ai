# Google OAuth Setup for Hybrid Development

**Purpose**: Configure Google OAuth to work with both local development and production environments using a single OAuth application.

## Overview

This setup allows you to:
- ✅ Use **remote authentication** (your existing Google OAuth)
- ✅ Develop with **local database** for fast schema changes
- ✅ Test with **real user authentication** in development
- ✅ Deploy to production without OAuth reconfiguration

## Google Cloud Console Configuration

### Step 1: Access Your Existing OAuth App
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create one if you don't have it)
3. Navigate to **APIs & Services** → **Credentials**
4. Find your existing OAuth 2.0 Client ID for WordWise AI

### Step 2: Configure Authorized Redirect URIs
Add these redirect URIs to support both environments:

```
Production (existing):
https://tnlflwmumalelnyyyfuc.supabase.co/auth/v1/callback

Development (add these):
http://localhost:54321/auth/v1/callback
http://localhost:3000/auth/v1/callback
```

**Important**: Keep your existing production URI - just add the localhost ones.

### Step 3: Configure Authorized JavaScript Origins
Add these origins for your frontend:

```
Production (existing):
https://your-production-domain.com

Development (add these):
http://localhost:5173
http://localhost:3000
http://localhost:8080
```

### Step 4: Test Configuration
Click **Save** and verify your configuration looks like this:

**Authorized JavaScript origins:**
- `https://your-production-domain.com`
- `http://localhost:5173`
- `http://localhost:3000`

**Authorized redirect URIs:**
- `https://tnlflwmumalelnyyyfuc.supabase.co/auth/v1/callback`
- `http://localhost:54321/auth/v1/callback`

## Environment Configuration

### Local Development (.env.local)
Create a separate environment file for local development:

```bash
# .env.local - For hybrid local development
VITE_SUPABASE_URL=https://tnlflwmumalelnyyyfuc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRubGZsd211bWFsZWxueXl5ZnVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwOTgyODEsImV4cCI6MjA2NTY3NDI4MX0.u1s6WfzgwrC4gDcZhvkr56EhSma_3SRIiRyPe32Al3c

# Local database URL (for migrations and direct DB access)
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# LanguageTool API
LANGUAGETOOL_API_URL=https://api.languagetool.org

# OpenAI API (if needed)
OPENAI_API_KEY=your-openai-api-key-here  # Optional
```

### Production (.env)
Keep your existing production configuration:

```bash
# .env - Production configuration
VITE_SUPABASE_URL=https://tnlflwmumalelnyyyfuc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRubGZsd211bWFsZWxueXl5ZnVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwOTgyODEsImV4cCI6MjA2NTY3NDI4MX0.u1s6WfzgwrC4gDcZhvkr56EhSma_3SRIiRyPe32Al3c
LANGUAGETOOL_API_URL=https://api.languagetool.org
OPENAI_API_KEY=your-openai-api-key-here  # Optional for production
```

## Supabase Dashboard Configuration

### Remote Project Settings
In your Supabase dashboard (https://app.supabase.com):

1. Go to **Authentication** → **Settings**
2. Update **Site URL** to include localhost:
   ```
   http://localhost:5173
   ```
3. Add **Redirect URLs**:
   ```
   http://localhost:5173
   http://localhost:3000
   https://your-production-domain.com
   ```

### Google OAuth Provider Configuration
In your Supabase dashboard:

1. Go to **Authentication** → **Providers**
2. Click **Google**
3. Ensure **Enabled** is checked
4. Verify your Client ID and Client Secret are configured
5. The callback URL should show: `https://tnlflwmumalelnyyyfuc.supabase.co/auth/v1/callback`

## Testing the Setup

### 1. Test Local Development
```bash
# Start local Supabase (database only)
supabase start

# In another terminal, start your app
npm run dev

# Navigate to http://localhost:5173
# Try signing in with Google OAuth
# Should redirect through remote auth but use local database
```

### 2. Verify Authentication Flow
1. Click "Sign in with Google" in your local app
2. Should redirect to Google OAuth (with your existing app)
3. After authorization, should redirect back to `http://localhost:5173`
4. Check that you're authenticated (user email should appear in header)

### 3. Test Database Access
```bash
# Check that local database is being used
supabase db inspect --local

# Your documents should be empty (local database)
# while authentication works (remote auth)
```

## How It Works

### Authentication Flow
```
1. User clicks "Sign in with Google" in local app (localhost:5173)
2. Redirects to Google OAuth with your configured Client ID
3. Google OAuth redirects to remote Supabase auth (production URL)
4. Remote Supabase processes authentication and creates JWT
5. User redirected back to local app with auth tokens
6. Local app uses remote auth tokens for API calls
7. Database queries go to local database (fast development)
```

### Data Flow
```
Frontend (localhost:5173)
    ↓ Auth requests
Remote Supabase Auth Server
    ↓ Database queries
Local Supabase Database (localhost:54322)
```

## Benefits of This Setup

### ✅ **Real Authentication**
- Same Google OAuth as production
- Real user accounts and sessions
- No mock auth or complex local OAuth setup

### ✅ **Fast Database Development** 
- Local database starts in seconds
- Easy schema changes and rollbacks
- No impact on production data
- Fast queries and migrations

### ✅ **Seamless Development**
- Same authentication flow as production
- Easy to test user-specific features
- RLS policies work correctly
- Real-world testing scenarios

### ✅ **Production Parity**
- Same OAuth configuration
- Same authentication tokens
- Same API calls
- Easy deployment (no config changes)

## Troubleshooting

### "OAuth redirect URI mismatch"
- Verify localhost:5173 is added to Google OAuth authorized origins
- Check that redirect URI includes the correct port
- Ensure Site URL in Supabase includes localhost

### "Invalid redirect URL"
- Add localhost URLs to Supabase Redirect URLs settings
- Check that site URL matches your development port

### "Authentication works but no database data"
- This is expected! Local database starts empty
- Run database migrations and seed data
- Use `supabase db reset` to start fresh

### "Database connection errors"
- Ensure `supabase start` is running
- Check that port 54322 is not in use
- Verify local database URL is correct

## Production Deployment

No changes needed! Your production deployment continues to work because:
- Same Google OAuth Client ID and Secret
- Same remote Supabase auth server
- Same environment variables
- Production URLs are already configured

The local development setup is completely isolated and doesn't affect production.

---

**Next**: Set up database migrations with the local development environment in `LOCAL_DEVELOPMENT.md`.