# Vercel Deployment Guide

## Quick Start

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy to Production
```bash
# Option 1: Use the deployment script (recommended)
npm run deploy:vercel:script

# Option 2: Direct deployment
npm run deploy:vercel
```

## Environment Variables Setup

### Required Environment Variables in Vercel Dashboard:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add these variables:

```
VITE_SUPABASE_URL=https://ajeakgiahmhqekntpzgl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqZWFrZ2lhaG1ocWVrbnRwemdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NTYwODQsImV4cCI6MjA3NDIzMjA4NH0.miG36VTjWDxxAE6bigEDLwn8jvzSDWPE6Gjpi0jEgM8
NODE_ENV=production
```

## Configuration Files

### vercel.json
The project includes a properly configured `vercel.json` with:
- Correct build command: `npm run build:prod`
- Output directory: `dist`
- Framework: `vite`
- SPA routing support
- Node.js 18.x runtime for functions

### .vercelignore
Excludes unnecessary files from deployment:
- `node_modules/`
- Development files
- Log files
- IDE files

## Build Process

### Local Build Test
```bash
# Test the production build locally
npm run build:prod

# Preview the build
npm run preview
```

### Build Commands
- `npm run build` - Development build with TypeScript check
- `npm run build:prod` - Production build optimized for Vercel
- `npm run vercel:build` - Alias for production build

## Deployment Options

### Option 1: Automatic Deployment (Recommended)
1. Connect your GitHub repository to Vercel
2. Push to main branch
3. Vercel automatically deploys

### Option 2: Manual Deployment
```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel
```

### Option 3: Using Deployment Script
```bash
npm run deploy:vercel:script
```

## Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Check build locally
npm run build:prod

# Check for TypeScript errors
npm run type-check

# Check for linting errors
npm run lint
```

#### 2. Environment Variables Not Working
- Verify variables are set in Vercel dashboard
- Check variable names match exactly (case-sensitive)
- Redeploy after adding new variables

#### 3. Routing Issues
- Ensure `vercel.json` has proper rewrites configuration
- Check that all routes redirect to `index.html`

#### 4. Supabase Connection Issues
- Verify Supabase URL and key are correct
- Check CORS settings in Supabase dashboard
- Ensure Supabase project is active

### Debug Commands

```bash
# Check Vercel CLI status
vercel whoami

# Check project status
vercel ls

# View deployment logs
vercel logs [deployment-url]

# Check environment variables
vercel env ls
```

## Performance Optimization

### Build Optimizations
- Terser minification enabled
- Manual chunk splitting for vendor libraries
- Source maps disabled for production
- Tree shaking enabled

### Vercel Optimizations
- Edge functions for Supabase integration
- Automatic HTTPS
- Global CDN
- Automatic scaling

## Monitoring

### Vercel Analytics
- Enable in Vercel dashboard
- Monitor performance metrics
- Track user behavior

### Error Tracking
- Check Vercel function logs
- Monitor Supabase logs
- Set up error tracking (Sentry, etc.)

## Security

### Environment Variables
- Never commit `.env` files
- Use Vercel dashboard for secrets
- Rotate keys regularly

### CORS Configuration
- Update Supabase CORS settings
- Restrict to your Vercel domain
- Monitor for unauthorized access

## Maintenance

### Regular Tasks
1. **Update Dependencies**: `npm update`
2. **Security Audit**: `npm audit`
3. **Performance Review**: Check Vercel analytics
4. **Log Monitoring**: Review error logs

### Scaling Considerations
- Vercel automatically handles scaling
- Monitor usage limits
- Upgrade plan if needed

## Support

### Vercel Documentation
- [Vercel Docs](https://vercel.com/docs)
- [Vite on Vercel](https://vercel.com/guides/deploying-vitejs-to-vercel)

### Project-Specific Issues
- Check this repository's issues
- Review deployment troubleshooting guide
- Contact project maintainers
