#!/bin/bash

# Vercel Deployment Script for areeba Pricing Simulator
# This script ensures proper deployment to Vercel

set -e

echo "🚀 Starting Vercel deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel@latest
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please log in to Vercel:"
    vercel login
fi

# Run pre-deployment checks
echo "🔍 Running pre-deployment checks..."

# Type check
echo "📝 Running TypeScript type check..."
npm run type-check

# Lint check
echo "🔧 Running ESLint..."
npm run lint

# Build test
echo "🏗️ Testing production build..."
npm run build:prod

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not created"
    exit 1
fi

echo "✅ Pre-deployment checks passed!"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment completed!"
echo "🌐 Your app should be available at your Vercel URL"
echo "📊 Check deployment status at: https://vercel.com/dashboard"
