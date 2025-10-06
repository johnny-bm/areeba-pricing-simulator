#!/bin/bash

# Quick Vercel Deployment Script
# This script provides a simple way to deploy to Vercel

set -e

echo "🚀 Quick Vercel Deployment"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Build the project
echo "🏗️ Building project..."
npm run build:prod

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not created"
    exit 1
fi

echo "✅ Build completed successfully!"

# Instructions for manual deployment
echo ""
echo "📋 Next steps for Vercel deployment:"
echo "1. Install Vercel CLI: npm install -g vercel"
echo "2. Login to Vercel: vercel login"
echo "3. Deploy: vercel --prod"
echo ""
echo "Or use the Vercel dashboard:"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Import your GitHub repository"
echo "3. Set environment variables:"
echo "   - VITE_SUPABASE_URL=https://ajeakgiahmhqekntpzgl.supabase.co"
echo "   - VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqZWFrZ2lhaG1ocWVrbnRwemdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NTYwODQsImV4cCI6MjA3NDIzMjA4NH0.miG36VTjWDxxAE6bigEDLwn8jvzSDWPE6Gjpi0jEgM8"
echo "4. Deploy!"
