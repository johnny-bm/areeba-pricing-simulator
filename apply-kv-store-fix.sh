#!/bin/bash

# Quick fix for kv_store RLS policies
# This script applies the necessary RLS policies to fix 406 errors

echo "🔧 Applying kv_store RLS policies..."

# Check if service role key is available
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ SUPABASE_SERVICE_ROLE_KEY environment variable not set"
    echo "   Please set it in your .env file or run:"
    echo "   export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here"
    echo ""
    echo "   Alternatively, run the SQL manually in your Supabase dashboard:"
    echo "   https://supabase.com/dashboard/project/ajeakgiahmhqekntpzgl/sql"
    exit 1
fi

# Apply the RLS policies using the migration file
if [ -f "supabase/migrations/20250113000002_fix_kv_store_rls.sql" ]; then
    echo "📄 Found migration file, applying RLS policies..."
    npx supabase db push --linked
    echo "✅ RLS policies applied successfully!"
else
    echo "❌ Migration file not found"
    echo "   Please run the SQL manually in your Supabase dashboard"
    exit 1
fi

echo ""
echo "🎉 kv_store access fix completed!"
echo "   The 406 errors should now be resolved."
