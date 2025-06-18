# Hybrid Database Setup Guide

**Complete guide to setting up WordWise AI with hybrid development environment: remote authentication + local database**

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Setup](#quick-setup)
4. [Detailed Setup Steps](#detailed-setup-steps)
5. [Google OAuth Configuration](#google-oauth-configuration)
6. [Development Workflow](#development-workflow)
7. [Database Management](#database-management)
8. [TypeScript Integration](#typescript-integration)
9. [Testing with Real Data](#testing-with-real-data)
10. [Troubleshooting](#troubleshooting)
11. [Production Deployment](#production-deployment)

## Overview

### What is Hybrid Development?

Hybrid development combines the best of both local and remote environments:

- **Remote Authentication**: Uses your production Supabase auth server
- **Local Database**: Fast PostgreSQL database on your machine
- **Real OAuth**: Same Google OAuth as production
- **Professional Migrations**: Version-controlled schema changes

### Benefits

✅ **Real Authentication**: Test with actual Google OAuth login  
✅ **Fast Development**: Local database responds in milliseconds  
✅ **Production Parity**: Same auth flow as production  
✅ **Safe Testing**: Local database doesn't affect production data  
✅ **Professional Tools**: Proper migrations, type generation, and version control  
✅ **Easy Deployment**: No configuration changes needed for production  

## Prerequisites

### Required Software
```bash
# Node.js and npm
node --version  # Should be v18+
npm --version   # Should be v9+

# Docker (for local Supabase)
docker --version

# Git
git --version
```

### Required Accounts
- ✅ Supabase account with existing project
- ✅ Google Cloud Console account  
- ✅ Google OAuth app (existing or new)

### Project Status
- ✅ WordWise AI project cloned locally
- ✅ Current `.env` file with production Supabase credentials

## Quick Setup

### Option 1: Automated Setup (Recommended)
```bash
# Run the automated setup script
./scripts/setup-local-dev.sh

# Follow the prompts and OAuth configuration guide
```

### Option 2: Manual Setup
Follow the [Detailed Setup Steps](#detailed-setup-steps) below.

## Detailed Setup Steps

### Step 1: Install Supabase CLI
```bash
# Install globally
npm install -g supabase

# Verify installation
supabase --version
# Should output version 1.x.x or higher
```

### Step 2: Create Local Environment Configuration
Create `.env.local` for hybrid development:

```bash
# .env.local - Hybrid Development Configuration
# Remote auth, local database

# Remote Supabase (for authentication)
VITE_SUPABASE_URL=https://tnlflwmumalelnyyyfuc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRubGZsd211bWFsZWxueXl5ZnVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwOTgyODEsImV4cCI6MjA2NTY3NDI4MX0.u1s6WfzgwrC4gDcZhvkr56EhSma_3SRIiRyPe32Al3c

# Local database (for development)
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
DIRECT_URL=postgresql://postgres:postgres@localhost:54322/postgres

# APIs
LANGUAGETOOL_API_URL=https://api.languagetool.org
OPENAI_API_KEY=your_openai_key_here
```

### Step 3: Initialize Supabase Project
```bash
# Initialize Supabase configuration
supabase init

# This creates supabase/ directory with config files
```

The `supabase/config.toml` is already configured for hybrid development with auth disabled locally.

### Step 4: Link to Remote Project
```bash
# Login to Supabase
supabase login

# Link to your remote project
supabase link --project-ref tnlflwmumalelnyyyfuc

# Enter your database password when prompted
```

### Step 5: Start Local Development Environment
```bash
# Start local Supabase stack
supabase start

# This downloads Docker images and starts:
# - PostgreSQL on port 54322
# - API Gateway on port 54321  
# - Studio on port 54323
# - Realtime, Storage, etc.
```

### Step 6: Apply Database Schema
```bash
# Reset local database and apply all migrations
supabase db reset

# This creates all tables, RLS policies, indexes
# and applies any existing migrations
```

### Step 7: Generate TypeScript Types
```bash
# Create types directory
mkdir -p src/types

# Generate database types
npm run db:types
# Creates src/types/database.ts with full type definitions
```

### Step 8: Verify Setup
```bash
# Check all services are running
supabase status

# Expected output:
# API URL: http://localhost:54321
# DB URL: postgresql://postgres:postgres@localhost:54322/postgres
# Studio URL: http://localhost:54323
# All services: RUNNING
```

## Google OAuth Configuration

### Single OAuth App for Both Environments

Configure your Google OAuth app to work with both local and production:

1. **Go to Google Cloud Console**
   - Navigate to APIs & Services → Credentials
   - Find your existing OAuth 2.0 Client ID

2. **Add Authorized JavaScript Origins:**
   ```
   https://your-production-domain.com
   http://localhost:5173
   http://localhost:3000
   ```

3. **Add Authorized Redirect URIs:**
   ```
   https://tnlflwmumalelnyyyfuc.supabase.co/auth/v1/callback
   http://localhost:54321/auth/v1/callback
   ```

4. **Save Configuration**

### Supabase Dashboard Configuration

1. **Go to your Supabase project dashboard**
2. **Authentication → Settings**
3. **Update Site URL:**
   ```
   http://localhost:5173
   ```
4. **Add Redirect URLs:**
   ```
   http://localhost:5173
   http://localhost:3000
   https://your-production-domain.com
   ```

**Detailed OAuth setup**: See `docs/OAUTH_SETUP.md`

## Development Workflow

### Daily Development Routine

```bash
# 1. Start local environment
npm run db:start

# 2. Start development server
npm run dev:local

# 3. Open browser
# http://localhost:5173

# 4. Sign in with Google OAuth
# Uses real authentication!

# 5. Develop and test locally
# Fast local database + real auth
```

### Making Schema Changes

```bash
# 1. Create new migration
supabase migration new add_new_feature

# 2. Edit migration file
# supabase/migrations/YYYYMMDDHHMMSS_add_new_feature.sql

# 3. Apply to local database
supabase db reset

# 4. Update TypeScript types
npm run db:types

# 5. Test changes locally
npm run dev:local

# 6. Deploy to production when ready
supabase db push
```

### Common Development Commands

```bash
# Database Management
npm run db:start      # Start local Supabase
npm run db:stop       # Stop local Supabase
npm run db:reset      # Reset and apply migrations
npm run db:seed       # Reset with test data
npm run db:studio     # Open database admin UI
npm run db:types      # Generate TypeScript types

# Development
npm run dev:local     # Start with local config
npm run dev           # Start with production config

# Migration Management  
npm run migrate:new   # Create new migration
npm run migrate:up    # Apply migrations to production
npm run migrate:reset # Reset local database

# Functions
npm run functions:serve   # Serve functions locally
npm run functions:deploy  # Deploy functions to production
```

## Database Management

### Migration System

**Create Migration:**
```bash
supabase migration new descriptive_migration_name
# Creates: supabase/migrations/YYYYMMDDHHMMSS_descriptive_migration_name.sql
```

**Apply Migrations:**
```bash
# Local database
supabase db reset

# Production database  
supabase db push
```

**Migration Example:**
```sql
-- supabase/migrations/20250616000002_add_document_tags.sql

-- Add tags column to documents
ALTER TABLE documents ADD COLUMN tags JSONB DEFAULT '[]';

-- Create index for tag searches
CREATE INDEX idx_documents_tags ON documents USING GIN (tags);

-- Update RLS policy to include tags in queries
-- (Add any necessary policy updates)
```

### Seed Data Management

**Location:** `supabase/seed.sql`

**Apply Seed Data:**
```bash
# Reset database and apply seed data
npm run db:seed

# Manual seed application
psql "postgresql://postgres:postgres@localhost:54322/postgres" < supabase/seed.sql
```

**Seed Data Structure:**
```sql
-- Test documents with various content types
INSERT INTO documents (id, owner, title, content) VALUES 
('test-doc-1', '00000000-0000-0000-0000-000000000000', 'Test Doc', '<p>Content</p>');

-- Pre-populated suggestions for UI testing
INSERT INTO suggestions (doc_id, start, end, type, message, replacements) VALUES 
('test-doc-1', 10, 15, 'spelling', 'Spelling error', '["correction"]');
```

### Database Inspection

**Local Database Studio:**
```bash
npm run db:studio
# Opens http://localhost:54323
```

**Direct Database Access:**
```bash
# Connect via psql
psql "postgresql://postgres:postgres@localhost:54322/postgres"

# Run inspection queries
psql "postgresql://postgres:postgres@localhost:54322/postgres" < supabase/inspect_database.sql
```

**Useful Queries:**
```sql
-- Check tables exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check RLS policies
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';

-- Count documents
SELECT COUNT(*) FROM documents;

-- Check current user (should be NULL in local development)
SELECT auth.uid();
```

## TypeScript Integration

### Automatic Type Generation

```bash
# Generate types from local database
npm run db:types

# Generates: src/types/database.ts
```

### Using Generated Types

```typescript
import { createClient } from '@supabase/supabase-js';
import { Database } from './types/database';

// Create typed client
const supabase = createClient<Database>(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

// Full type safety
const { data, error } = await supabase
  .from('documents')
  .select('*')
  .eq('owner', userId);

// data is typed as Database['public']['Tables']['documents']['Row'][]
```

### Type Definition Example

```typescript
// Auto-generated in src/types/database.ts
export interface Database {
  public: {
    Tables: {
      documents: {
        Row: {
          id: string;
          owner: string;
          title: string | null;
          content: string | null;
          readability: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner: string;
          title?: string | null;
          content?: string | null;
          readability?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          // Partial update types...
        };
      };
    };
  };
}
```

## Testing with Real Data

### Authentication Testing

1. **Start local development:**
   ```bash
   npm run dev:local
   ```

2. **Navigate to app:**
   ```
   http://localhost:5173
   ```

3. **Sign in with Google:**
   - Uses real Google OAuth
   - Creates real user session
   - Works exactly like production

4. **Create test documents:**
   - Documents stored in local database
   - Fast creation and editing
   - Real RLS policy enforcement

### Feature Testing Scenarios

**Grammar Checking:**
```bash
# 1. Create document with grammar errors
# 2. Wait 2 seconds for debounced checking
# 3. See grammar highlights
# 4. Click highlights for suggestions
# 5. Apply corrections
```

**Readability Analysis:**
```bash
# 1. Type complex text with passive voice
# 2. Wait 3 seconds for analysis
# 3. See readability metrics update
# 4. Check Flesch score and passive voice percentage
```

**Performance Testing:**
```bash
# 1. Create large document (1000+ words)
# 2. Test typing responsiveness
# 3. Verify grammar checking completes
# 4. Check database query performance
```

### Test Data Population

**Option 1: Use Seed Data**
```bash
# Reset with comprehensive test data
npm run db:seed
```

**Option 2: Manual Test Data Creation**
```sql
-- After authenticating, get your user ID
SELECT auth.uid();

-- Create test document with your user ID
INSERT INTO documents (owner, title, content) VALUES 
(auth.uid(), 'My Test Document', '<p>Test content with erors.</p>');
```

## Troubleshooting

### Common Issues

**"Supabase not starting"**
```bash
# Check Docker is running
docker --version

# Stop and restart
supabase stop
supabase start

# Check logs
supabase logs
```

**"Authentication not working"**
- Verify Google OAuth URLs include localhost:5173
- Check `.env.local` has correct remote Supabase URL
- Ensure Supabase site URL includes localhost

**"Database connection errors"**
```bash
# Check services status
supabase status

# Restart if needed
supabase stop && supabase start

# Check port availability
lsof -i :54322
```

**"Migration errors"**
```bash
# Check migration syntax
supabase db diff

# Reset and retry
supabase db reset

# Check migration logs
supabase logs db
```

**"Type generation failing"**
```bash
# Ensure database is running
supabase status

# Check tables exist
psql "postgresql://postgres:postgres@localhost:54322/postgres" -c "\dt"

# Regenerate
npm run db:types
```

**"RLS blocking queries"**
- Remember: Local database starts empty
- You need to authenticate first through the app
- Or update seed data with real user IDs

### Environment Switching

**Switch to Local Development:**
```bash
npm run dev:local
# Uses .env.local (remote auth + local database)
```

**Switch to Production:**
```bash
npm run dev
# Uses .env (remote auth + remote database)
```

**Check Current Configuration:**
```bash
# In browser console:
console.log(import.meta.env.VITE_SUPABASE_URL);
# Should show remote URL for both local and production
```

## Production Deployment

### Schema Deployment

```bash
# Deploy all local migrations to production
supabase db push

# This applies any new migrations you've created locally
```

### Function Deployment

```bash
# Deploy Edge Functions
supabase functions deploy grammar_check
supabase functions deploy readability

# Or deploy all functions
npm run functions:deploy
```

### Environment Variables

**Production deployment uses existing `.env`:**
```bash
# .env - Production (no changes needed)
VITE_SUPABASE_URL=https://tnlflwmumalelnyyyfuc.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
LANGUAGETOOL_API_URL=https://api.languagetool.org
OPENAI_API_KEY=your_production_openai_key
```

**No configuration changes needed** because:
- Same Google OAuth Client ID works for both environments
- Same remote Supabase auth server
- Production URLs already configured in OAuth and Supabase

### Deployment Verification

```bash
# 1. Deploy schema changes
supabase db push

# 2. Deploy functions
supabase functions deploy grammar_check

# 3. Test production build locally
npm run build
npm run preview

# 4. Deploy to Vercel (or your hosting platform)
# No environment variable changes needed

# 5. Test production deployment
# https://your-production-domain.com
```

## Architecture Diagram

```
┌─────────────────────┐    ┌──────────────────────┐
│   Frontend          │    │   Google OAuth       │
│   localhost:5173    │◄──►│   (Single App)       │
└─────────────────────┘    └──────────────────────┘
         │
         ▼
┌─────────────────────┐    ┌──────────────────────┐
│   Remote Auth       │    │   Local Database     │
│   Supabase Cloud    │    │   localhost:54322    │
│   (Production)      │    │   (Development)      │
└─────────────────────┘    └──────────────────────┘
         │                           │
         ▼                           ▼
┌─────────────────────┐    ┌──────────────────────┐
│   User Sessions     │    │   Documents          │
│   JWT Tokens        │    │   Suggestions        │
│   Authentication    │    │   Test Data          │
└─────────────────────┘    └──────────────────────┘
```

## Summary

### What You Get
- ✅ **Professional database development** with migrations and version control
- ✅ **Real authentication** using production Google OAuth
- ✅ **Fast local development** with instant database responses
- ✅ **Type safety** with auto-generated TypeScript definitions
- ✅ **Easy deployment** with no configuration changes needed
- ✅ **Production parity** ensuring local tests match production behavior

### Key Benefits
1. **Speed**: Local database responds in milliseconds vs. hundreds of milliseconds for remote
2. **Safety**: Local testing doesn't affect production data
3. **Realism**: Real authentication and user sessions
4. **Productivity**: Professional tools for schema management
5. **Reliability**: Same auth flow as production eliminates deployment surprises

### Next Steps
1. Run the setup script: `./scripts/setup-local-dev.sh`
2. Configure Google OAuth: See `docs/OAUTH_SETUP.md`
3. Start development: `npm run dev:local`
4. Read the development guide: `docs/LOCAL_DEVELOPMENT.md`
5. Begin testing: Use the test scenarios in this guide

---

**Need Help?**
- Check `docs/LOCAL_DEVELOPMENT.md` for detailed workflows
- See `docs/OAUTH_SETUP.md` for authentication setup
- Review `docs/TESTING_GUIDE.md` for comprehensive testing procedures
- Run `./scripts/setup-local-dev.sh` for automated setup