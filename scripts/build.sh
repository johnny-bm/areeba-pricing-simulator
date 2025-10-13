#!/bin/bash

# Production build script
set -e

echo "🚀 Starting production build..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Please run from project root."
  exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run type checking
echo "🔍 Running type check..."
npm run type-check

# Run tests
echo "🧪 Running tests..."
npm test

# Build for production
echo "🏗️ Building for production..."
npm run build

# Verify build output
if [ ! -d "dist" ]; then
  echo "❌ Error: Build failed - dist directory not found"
  exit 1
fi

echo "✅ Production build complete!"
echo "📁 Build output: dist/"
echo "📊 Bundle size:"
du -sh dist/

echo "🎉 Ready for deployment!"
