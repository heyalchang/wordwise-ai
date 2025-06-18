# Local Development Setup Guide

**Purpose**: Set up hybrid local development with remote authentication and local database for WordWise AI.

## Overview

This setup provides:
- 🚀 **Fast local database development** with instant schema changes
- 🔐 **Real authentication** using your existing Google OAuth
- 📦 **Professional migration management** with version control
- 🔄 **Easy sync** between local development and production
- 🛠 **Automatic TypeScript type generation**

## Prerequisites

### Required Software
```bash
# Install Supabase CLI
npm install -g supabase

# Verify installation
supabase --version
```

### Required Accounts
- Supabase account with existing project
- Google OAuth app configured (see OAUTH_SETUP.md)

## Initial Setup

### 1. Initialize Supabase Project
```bash
# From project root
supabase init

# This creates supabase/ directory with config files
```

### 2. Link to Remote Project
```bash
# Link to your remote Supabase project
supabase login
supabase link --project-ref tnlflwmumalelnyyyfuc

# You'll be prompted for your database password
```

### 3. Start Local Development Environment
```bash
# Start local Supabase stack (excluding auth)
supabase start

# This will download Docker images and start:
# - PostgreSQL on port 54322
# - API Gateway on port 54321  
# - Studio on port 54323
# - Realtime on port 54324
```

### 4. Verify Local Setup
```bash
# Check status
supabase status

# Should show services running:
# API URL: http://localhost:54321
# DB URL: postgresql://postgres:postgres@localhost:54322/postgres
# Studio URL: http://localhost:54323
```

## Environment Configuration

### 1. Create Local Environment File
Create `.env.local` for development:

```bash
# .env.local - Hybrid development configuration
VITE_SUPABASE_URL=https://tnlflwmumalelnyyyfuc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRubGZsd211bWFsZWxueXl5ZnVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwOTgyODEsImV4cCI6MjA2NTY3NDI4MX0.u1s6WfzgwrC4gDcZhvkr56EhSma_3SRIiRyPe32Al3c

# For direct database access and migrations
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
DIRECT_URL=postgresql://postgres:postgres@localhost:54322/postgres

# API URLs
LANGUAGETOOL_API_URL=https://api.languagetool.org
OPENAI_API_KEY=your-openai-api-key-here  # Optional for initial development
```

### 2. Update Package.json Scripts
Add development and migration scripts:

```json
{
  "scripts": {
    "dev": "vite --port 5173",
    "dev:local": "cp .env.local .env && vite --port 5173",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    
    "db:start": "supabase start",
    "db:stop": "supabase stop", 
    "db:reset": "supabase db reset",
    "db:seed": "supabase db reset --seed",
    "db:diff": "supabase db diff",
    "db:push": "supabase db push",
    "db:types": "supabase gen types typescript --local > src/types/database.ts",
    "db:studio": "supabase studio",
    
    "migrate:new": "supabase migration new",
    "migrate:up": "supabase db push",
    "migrate:reset": "supabase db reset",
    
    "functions:serve": "supabase functions serve",
    "functions:deploy": "supabase functions deploy"
  }
}
```

## Database Migration Setup

### 1. Create Proper Migration Structure
```bash
# Create new migration for existing schema
supabase migration new initial_schema

# This creates: supabase/migrations/YYYYMMDDHHMMSS_initial_schema.sql
```

### 2. Convert Existing Schema to Migration
Move your schema from `01_complete_setup.sql` to the new migration file:

```bash
# Copy content from supabase/migrations/01_complete_setup.sql
# to the new migration file created above
```

### 3. Create Seed Data File
```bash
# Create seed data file
mkdir -p supabase/seed
cp supabase/seed.sql supabase/seed/seed.sql
```

### 4. Apply Migrations to Local Database
```bash
# Reset local database and apply all migrations
supabase db reset

# This will:
# 1. Drop and recreate local database
# 2. Apply all migrations in order
# 3. Run seed data if available
```

## Development Workflow

### Daily Development Flow
```bash
# 1. Start local environment
npm run db:start

# 2. Start development server with local config
npm run dev:local

# 3. Your app now runs on http://localhost:5173 with:
#    - Remote authentication (Google OAuth works)
#    - Local database (fast schema changes)
```

### Making Schema Changes
```bash
# 1. Create a new migration
supabase migration new add_new_feature

# 2. Edit the migration file in supabase/migrations/
# 3. Apply to local database
supabase db reset

# 4. Generate TypeScript types
npm run db:types

# 5. Test your changes locally
npm run dev:local

# 6. When ready, deploy to production
supabase db push
```

### Database Operations
```bash
# Reset local database (fresh start)
npm run db:reset

# Reset with seed data
npm run db:seed

# Open database studio
npm run db:studio
# Opens http://localhost:54323

# Generate TypeScript types
npm run db:types
# Updates src/types/database.ts

# Create schema diff (for migrations)
npm run db:diff
```

## TypeScript Integration

### 1. Generate Database Types
```bash
# Generate types from local database
npm run db:types

# This creates src/types/database.ts with:
# - All table definitions
# - Column types  
# - Relationship types
# - JSON field types
```

### 2. Use Generated Types
```typescript
// src/types/database.ts (auto-generated)
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
          id?: string;
          owner?: string;
          title?: string | null;
          content?: string | null;
          readability?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Usage in your code
import { Database } from './types/database';

const supabase = createClient<Database>(url, key);

// Now you get full type safety!
const { data } = await supabase
  .from('documents')
  .select('*')
  .eq('owner', userId);
// data is properly typed as Database['public']['Tables']['documents']['Row'][]
```

## Edge Functions Development

### 1. Local Function Development
```bash
# Serve functions locally
npm run functions:serve

# Functions available at:
# http://localhost:54321/functions/v1/grammar_check
# http://localhost:54321/functions/v1/readability
```

### 2. Deploy Functions
```bash
# Deploy individual function
supabase functions deploy grammar_check

# Deploy all functions
npm run functions:deploy
```

## Data Management

### 1. Seed Data for Testing
```sql
-- supabase/seed/seed.sql
-- Insert test data after migrations run
INSERT INTO documents (id, owner, title, content) VALUES 
('test-1', auth.uid(), 'Test Document', '<p>Hello world!</p>');
```

### 2. Reset and Seed
```bash
# Reset database and run seed data
npm run db:seed

# Manual seed (if not using reset)
psql "postgresql://postgres:postgres@localhost:54322/postgres" < supabase/seed/seed.sql
```

## Production Deployment

### 1. Deploy Schema Changes
```bash
# Deploy migrations to production
supabase db push

# This applies all local migrations to remote database
```

### 2. Deploy Functions
```bash
# Deploy functions to production
supabase functions deploy grammar_check
supabase functions deploy readability
```

### 3. Verify Production
```bash
# Check remote database status
supabase db inspect

# Generate types from production (for verification)
supabase gen types typescript > src/types/database-prod.ts
```

## Development Tips

### 1. Database Inspection
```bash
# Open local database studio
npm run db:studio

# Connect to local database directly
psql "postgresql://postgres:postgres@localhost:54322/postgres"

# Run inspection queries
psql "postgresql://postgres:postgres@localhost:54322/postgres" < supabase/inspect_database.sql
```

### 2. Authentication Testing
```bash
# Test with real Google OAuth (works because auth is remote)
# 1. Go to http://localhost:5173
# 2. Sign in with Google
# 3. Create documents (stored in local database)
# 4. Test grammar checking and other features
```

### 3. Performance Testing
```bash
# Test with large documents in local database
# Fast because database is local
# Real authentication ensures proper RLS testing
```

## Troubleshooting

### "Supabase not starting"
```bash
# Check Docker is running
docker --version

# Stop and restart
supabase stop
supabase start

# Check logs
supabase logs
```

### "Authentication not working"
- Verify Google OAuth configured correctly (see OAUTH_SETUP.md)
- Check that VITE_SUPABASE_URL points to remote project
- Ensure site URL in Supabase includes localhost:5173

### "Database migrations failing"
```bash
# Check migration syntax
supabase db diff

# Reset and try again
supabase db reset

# Check logs
supabase logs db
```

### "Type generation failing"
```bash
# Ensure database is running
supabase status

# Check local database has tables
psql "postgresql://postgres:postgres@localhost:54322/postgres" -c "\dt"

# Regenerate types
supabase gen types typescript --local > src/types/database.ts
```

## Example Development Session

```bash
# Morning routine
cd wordwise-ai
npm run db:start        # Start local database
npm run dev:local       # Start dev server with local config

# Make a schema change
supabase migration new add_document_tags
# Edit the migration file
npm run db:reset        # Apply migrations
npm run db:types        # Update TypeScript types

# Test changes
# http://localhost:5173 - sign in with Google, test features

# Deploy when ready
supabase db push        # Deploy schema to production
git add . && git commit -m "Add document tags feature"

# End of day
npm run db:stop         # Stop local services
```

This setup gives you the best of both worlds: real authentication for proper testing and fast local database development for schema changes and feature development.

---

**Next**: See `DATABASE_SETUP.md` for database verification and `TESTING_GUIDE.md` for comprehensive testing procedures.