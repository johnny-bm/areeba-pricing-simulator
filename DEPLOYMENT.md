# Deployment Guide

This guide covers deploying the Areeba Pricing Simulator to Vercel and setting up the GitHub repository.

## Prerequisites

- GitHub account
- Vercel account
- Supabase project with Edge Functions deployed

## Step 1: GitHub Repository Setup

### Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Repository name: `areeba-pricing-simulator`
3. Description: "Areeba Pricing Simulator - IT Services Quote and Proposal Generator"
4. Set to **Private** (recommended for enterprise use)
5. Don't initialize with README (we already have one)

### Push to GitHub

```bash
# Add GitHub remote (replace with your actual GitHub URL)
git remote add origin https://github.com/johnnybm-areeba/areeba-pricing-simulator.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 2: Vercel Deployment

### Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository: `areeba-pricing-simulator`
4. Vercel will auto-detect it's a Vite project

### Configure Environment Variables

In Vercel dashboard, go to your project settings and add:

```
VITE_SUPABASE_URL=https://ajeakgiahmhqekntpzgl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqZWFrZ2lhaG1ocWVrbnRwemdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NTYwODQsImV4cCI6MjA3NDIzMjA4NH0.miG36VTjWDxxAE6bigEDLwn8jvzSDWPE6Gjpi0jEgM8
```

### Deploy

1. Click "Deploy" in Vercel
2. Vercel will automatically build and deploy your project
3. You'll get a production URL like: `https://areeba-pricing-simulator.vercel.app`

## Step 3: Supabase Edge Functions

### Deploy Backend Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref ajeakgiahmhqekntpzgl

# Deploy functions
supabase functions deploy make-server-228aa219
supabase functions deploy send-invite
```

### Configure CORS

Update your Supabase Edge Functions to allow your Vercel domain:

1. Go to Supabase Dashboard → Edge Functions
2. Edit the `make-server-228aa219` function
3. Update CORS settings to include your Vercel domain:

```typescript
// In your Edge Function
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://your-app.vercel.app',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}
```

## Step 4: Production Configuration

### Update CORS in Supabase

1. Go to Supabase Dashboard → Settings → API
2. Update "Site URL" to your Vercel domain
3. Add your Vercel domain to "Additional Redirect URLs"

### Environment Variables for Production

Make sure these are set in Vercel:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

## Step 5: Testing

### Test the Deployment

1. Visit your Vercel URL
2. Test guest mode: `https://your-app.vercel.app/simulators?mode=guest`
3. Test authentication flow
4. Test admin panel (if you have admin access)
5. Test PDF generation

### Monitor Performance

- Check Vercel Analytics for performance metrics
- Monitor Supabase Edge Function logs
- Set up error tracking (optional)

## Troubleshooting

### Common Issues

1. **CORS Errors**: Update Supabase CORS settings
2. **Environment Variables**: Double-check all env vars are set in Vercel
3. **Build Failures**: Check Vercel build logs for TypeScript errors
4. **Edge Function Timeouts**: Increase timeout in Supabase dashboard

### Debug Steps

1. Check browser console for errors
2. Check Vercel function logs
3. Check Supabase Edge Function logs
4. Test API endpoints directly

## Security Considerations

### Production Security

1. **CORS**: Restrict to your Vercel domain only
2. **Rate Limiting**: Already implemented in Edge Functions
3. **Input Validation**: Already implemented
4. **Authentication**: Supabase Auth handles this
5. **Environment Variables**: Never commit secrets to Git

### Monitoring

1. Set up Vercel Analytics
2. Monitor Supabase usage
3. Set up error tracking (Sentry, etc.)
4. Monitor Edge Function performance

## Maintenance

### Regular Tasks

1. **Updates**: Keep dependencies updated
2. **Monitoring**: Check logs regularly
3. **Backups**: Supabase handles database backups
4. **Security**: Review access logs periodically

### Scaling

- Vercel automatically scales
- Supabase scales automatically
- Monitor usage and upgrade plans if needed
