# Deployment Guide

## Overview

This guide covers deploying the Areeba Pricing Simulator to production environments.

## Prerequisites

- Node.js 18+
- npm or yarn
- Vercel account (recommended)
- Supabase project
- Environment variables configured

## Environment Setup

### Required Environment Variables

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Feature Flags
VITE_USE_NEW_ARCHITECTURE=true
VITE_USE_NEW_PRICING=true

# Production Settings
NODE_ENV=production
```

### Optional Environment Variables

```bash
# Analytics
VITE_ANALYTICS_ID=your_analytics_id

# Error Tracking
VITE_SENTRY_DSN=your_sentry_dsn

# Performance Monitoring
VITE_PERFORMANCE_MONITORING=true
```

## Build Process

### Local Build

```bash
# Install dependencies
npm install

# Run type checking
npm run type-check

# Run tests
npm test

# Build for production
npm run build

# Preview build
npm run preview
```

### Build Verification

```bash
# Check build output
ls -la dist/

# Verify static assets
ls -la dist/assets/

# Test build locally
npm run preview
```

## Deployment Options

### Vercel (Recommended)

#### Automatic Deployment

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy
   vercel
   ```

2. **Configure Environment Variables**
   - Go to Vercel Dashboard
   - Select your project
   - Go to Settings > Environment Variables
   - Add all required variables

3. **Configure Build Settings**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "installCommand": "npm install"
   }
   ```

#### Manual Deployment

```bash
# Build the project
npm run build

# Deploy to Vercel
vercel --prod

# Or deploy specific version
vercel --prod --version=1.0.0
```

### Netlify

#### Configuration File

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Deploy

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

### AWS S3 + CloudFront

#### Build and Upload

```bash
# Build
npm run build

# Install AWS CLI
npm i -g aws-cli

# Configure AWS
aws configure

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## Database Setup

### Supabase Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note down URL and anon key

2. **Run Migrations**
   ```bash
   # Install Supabase CLI
   npm i -g supabase
   
   # Login
   supabase login
   
   # Link project
   supabase link --project-ref your-project-ref
   
   # Run migrations
   supabase db push
   ```

3. **Configure Row Level Security**
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE pricing_scenarios ENABLE ROW LEVEL SECURITY;
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   
   -- Create policies
   CREATE POLICY "Users can view own scenarios" ON pricing_scenarios
     FOR SELECT USING (auth.uid() = created_by);
   
   CREATE POLICY "Users can insert own scenarios" ON pricing_scenarios
     FOR INSERT WITH CHECK (auth.uid() = created_by);
   ```

## Production Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Build succeeds without errors
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Security policies configured
- [ ] Performance optimizations enabled
- [ ] Error tracking configured
- [ ] Analytics configured

### Post-Deployment

- [ ] Application loads correctly
- [ ] Authentication works
- [ ] Database connections successful
- [ ] All features functional
- [ ] Performance monitoring active
- [ ] Error tracking active
- [ ] Analytics tracking active

## Monitoring and Maintenance

### Health Checks

```typescript
// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await database.healthCheck();
    
    // Check external services
    await externalServices.healthCheck();
    
    res.json({ status: 'healthy', timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      error: error.message,
      timestamp: new Date()
    });
  }
});
```

### Performance Monitoring

```typescript
// Performance monitoring setup
import { performance } from 'perf_hooks';

const performanceMiddleware = (req, res, next) => {
  const start = performance.now();
  
  res.on('finish', () => {
    const duration = performance.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
  });
  
  next();
};
```

### Error Tracking

```typescript
// Sentry configuration
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

## Rollback Strategy

### Quick Rollback

```bash
# Vercel rollback
vercel rollback

# Netlify rollback
netlify rollback

# AWS rollback
aws s3 sync s3://your-bucket-backup/ s3://your-bucket-name --delete
```

### Database Rollback

```bash
# Supabase rollback
supabase db reset --linked

# Or specific migration
supabase migration up --target 20231201000000
```

## Security Considerations

### Environment Variables

- Never commit `.env` files
- Use secure secret management
- Rotate keys regularly
- Use different keys for different environments

### Database Security

- Enable Row Level Security (RLS)
- Use least privilege access
- Regular security audits
- Monitor for suspicious activity

### Application Security

- Enable HTTPS
- Set security headers
- Validate all inputs
- Sanitize outputs
- Regular dependency updates

## Troubleshooting

### Common Issues

#### Build Failures

```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Database Connection Issues

```bash
# Check Supabase status
supabase status

# Verify environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

#### Performance Issues

```bash
# Analyze bundle size
npm run analyze

# Check for memory leaks
npm run test:memory

# Profile performance
npm run profile
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev

# Enable verbose build
npm run build -- --verbose

# Enable detailed error reporting
NODE_ENV=development npm run build
```

## Support

For deployment issues:

1. Check the logs in your deployment platform
2. Verify environment variables
3. Test locally first
4. Check database connectivity
5. Review security policies

## Maintenance Schedule

- **Daily**: Monitor error rates and performance
- **Weekly**: Review security logs
- **Monthly**: Update dependencies
- **Quarterly**: Security audit and penetration testing
