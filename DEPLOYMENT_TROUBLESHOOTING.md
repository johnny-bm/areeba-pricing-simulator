# Vercel Deployment Troubleshooting Guide

## Issue: Vercel Not Deploying After Commits

### 1. Check Environment Variables in Vercel Dashboard

Go to your Vercel project dashboard and ensure these environment variables are set:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. Manual Deployment Trigger

If automatic deployments aren't working:

1. Go to your Vercel dashboard
2. Navigate to your project: `areeba-pricing-simulator`
3. Click on "Deployments" tab
4. Click "Redeploy" on the latest deployment

### 3. Check Build Logs

In Vercel dashboard:
1. Go to your project
2. Click on the latest deployment
3. Check the "Build Logs" tab for any errors

### 4. Force Redeploy via CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

## Issue: Constant Sync Requirements

### Root Cause: Dropbox Sync Conflicts

Since you're using Dropbox for file storage, this can cause sync conflicts even when working alone.

### Solutions:

#### Option 1: Move Project Out of Dropbox (Recommended)
```bash
# 1. Move project to a local directory
mv "/Users/Johnny/Library/CloudStorage/Dropbox/01 areeba/areeba-Pricing Simulator-202510" "/Users/Johnny/Projects/areeba-pricing-simulator"

# 2. Update your terminal to the new location
cd "/Users/Johnny/Projects/areeba-pricing-simulator"

# 3. Test that everything still works
npm run dev
```

#### Option 2: Configure Dropbox to Ignore Git Files
Create a `.dropboxignore` file in your project root:

```bash
# Add to .dropboxignore
.git/
node_modules/
dist/
.vercel/
*.log
.env.local
```

#### Option 3: Use Dropbox Selective Sync
1. Open Dropbox preferences
2. Go to "Sync" tab
3. Click "Select folders to sync"
4. Uncheck the `areeba-Pricing Simulator-202510` folder
5. Work on the project locally
6. Manually sync when needed

## Quick Fix Commands

### Force Vercel Deployment:
```bash
# Push any pending changes
git add .
git commit -m "Force Vercel deployment"
git push origin main

# Check deployment status
curl -s "https://api.vercel.com/v1/deployments?projectId=prj_5aUEYEENojokbLbaClVZXvCgePL6" | jq '.deployments[0].state'
```

### Check Git Status:
```bash
git status
git log --oneline -3
git remote -v
```

### Verify Build Works:
```bash
npm run build:prod
```

## Environment Variables Checklist

Make sure these are set in Vercel dashboard:

- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] `NODE_ENV=production` (should be automatic)

## Next Steps

1. **Immediate**: Check Vercel dashboard for environment variables
2. **Short-term**: Move project out of Dropbox
3. **Long-term**: Set up proper CI/CD pipeline
