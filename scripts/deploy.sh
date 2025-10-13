#!/bin/bash

# Deployment script
set -e

echo "🚀 Starting deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Please run from project root."
  exit 1
fi

# Check if build exists
if [ ! -d "dist" ]; then
  echo "❌ Error: dist directory not found. Run build first."
  exit 1
fi

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
if command -v vercel &> /dev/null; then
  vercel --prod
else
  echo "❌ Error: Vercel CLI not found. Install with: npm i -g vercel"
  exit 1
fi

echo "✅ Deployment complete!"
echo "🔗 Check your deployment at the URL provided above"
