#!/bin/bash

# WordWise AI Local Development Setup Script
# This script sets up the hybrid development environment

set -e

echo "🚀 Setting up WordWise AI Local Development Environment"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

echo "✅ Supabase CLI found"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local for hybrid development..."
    cat > .env.local << EOF
# Hybrid Development Configuration
# Remote auth, local database

# Remote Supabase (for authentication)
VITE_SUPABASE_URL=https://tnlflwmumalelnyyyfuc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRubGZsd211bWFsZWxueXl5ZnVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwOTgyODEsImV4cCI6MjA2NTY3NDI4MX0.u1s6WfzgwrC4gDcZhvkr56EhSma_3SRIiRyPe32Al3c

# Local database (for development)
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
DIRECT_URL=postgresql://postgres:postgres@localhost:54322/postgres

# APIs
LANGUAGETOOL_API_URL=https://api.languagetool.org
OPENAI_API_KEY=your-openai-api-key-here  # Optional
EOF
    echo "✅ Created .env.local"
else
    echo "✅ .env.local already exists"
fi

# Initialize Supabase project if not already done
if [ ! -f supabase/config.toml ]; then
    echo "📁 Initializing Supabase project..."
    supabase init
fi

echo "✅ Supabase project initialized"

# Start local Supabase
echo "🔄 Starting local Supabase..."
supabase start

# Wait a moment for services to start
sleep 5

echo "🗄️  Applying database migrations..."
supabase db reset

echo "📊 Generating TypeScript types..."
mkdir -p src/types
supabase gen types typescript --local > src/types/database.ts

echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Configure Google OAuth (see docs/OAUTH_SETUP.md)"
echo "2. Start development: npm run dev:local"
echo "3. Open http://localhost:5173"
echo "4. Sign in with Google OAuth (uses remote auth)"
echo "5. Create test data or run seed script"
echo ""
echo "🔧 Useful commands:"
echo "npm run dev:local    # Start development with local database"
echo "npm run db:studio    # Open database studio"
echo "npm run db:reset     # Reset and apply all migrations"
echo "npm run db:types     # Generate TypeScript types"
echo ""
echo "📚 Documentation:"
echo "docs/LOCAL_DEVELOPMENT.md  # Complete development guide"
echo "docs/OAUTH_SETUP.md        # Google OAuth configuration"
echo "docs/DATABASE_SETUP.md     # Database verification"