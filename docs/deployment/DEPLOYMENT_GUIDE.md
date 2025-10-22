# Deployment Guide

## Overview

This guide covers deploying the Areeba Pricing Simulator to production environments with security, performance, and reliability best practices.

## 🚀 Deployment Options

### 1. Vercel (Recommended)

#### Prerequisites
- Vercel account
- GitHub repository connected
- Environment variables configured

#### Deployment Steps

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy from project directory
   vercel
   ```

2. **Configure Environment Variables**
   ```bash
   # In Vercel dashboard or via CLI
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   vercel env add VITE_USE_NEW_ARCHITECTURE
   vercel env add VITE_USE_NEW_PRICING
   ```

3. **Production Build Configuration**
   ```json
   // vercel.json
   {
     "buildCommand": "npm run build:prod",
     "outputDirectory": "dist",
     "framework": "vite",
     "functions": {
       "app/api/**/*.ts": {
         "runtime": "nodejs18.x"
       }
     },
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           {
             "key": "X-Content-Type-Options",
             "value": "nosniff"
           },
           {
             "key": "X-Frame-Options",
             "value": "DENY"
           },
           {
             "key": "X-XSS-Protection",
             "value": "1; mode=block"
           }
         ]
       }
     ]
   }
   ```

### 2. Netlify

#### Deployment Configuration
```toml
# netlify.toml
[build]
  command = "npm run build:prod"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. AWS S3 + CloudFront

#### S3 Configuration
```bash
# Create S3 bucket
aws s3 mb s3://your-pricing-simulator-bucket

# Upload build files
aws s3 sync dist/ s3://your-pricing-simulator-bucket --delete

# Set bucket policy for static website hosting
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-pricing-simulator-bucket/*"
    }
  ]
}
```

#### CloudFront Configuration
```json
{
  "Origins": [
    {
      "DomainName": "your-pricing-simulator-bucket.s3.amazonaws.com",
      "Id": "S3-origin",
      "S3OriginConfig": {
        "OriginAccessIdentity": "origin-access-identity/cloudfront/XXXXXXXX"
      }
    }
  ],
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-origin",
    "ViewerProtocolPolicy": "redirect-to-https",
    "Compress": true,
    "CachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
  },
  "CustomErrorResponses": [
    {
      "ErrorCode": 404,
      "ResponsePagePath": "/index.html",
      "ResponseCode": "200"
    }
  ]
}
```

### 4. Docker Deployment

#### Dockerfile
```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build:prod

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
```

## 🔧 Environment Configuration

### Production Environment Variables
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key

# Feature Flags
VITE_USE_NEW_ARCHITECTURE=true
VITE_USE_NEW_PRICING=true

# Security
VITE_ENABLE_SECURITY_CHECKS=true
VITE_ENABLE_RATE_LIMITING=true

# Performance
VITE_ENABLE_BUNDLE_ANALYSIS=false
VITE_ENABLE_PERFORMANCE_MONITORING=true
```

### Environment Validation
```typescript
// src/config/env.ts
export function validateProductionEnvironment(): void {
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];

  const missing = requiredVars.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate URL format
  try {
    new URL(import.meta.env.VITE_SUPABASE_URL);
  } catch {
    throw new Error('Invalid Supabase URL format');
  }

  // Check for development credentials in production
  if (import.meta.env.PROD) {
    const url = import.meta.env.VITE_SUPABASE_URL;
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      throw new Error('Development credentials detected in production');
    }
  }
}
```

## 🔒 Security Configuration

### Security Headers
```typescript
// Security middleware
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};
```

### HTTPS Configuration
```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

## 📊 Performance Optimization

### Bundle Optimization
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          utils: ['lodash-es', 'date-fns']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
```

### Caching Strategy
```typescript
// Service worker for caching
const CACHE_NAME = 'pricing-simulator-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});
```

## 🧪 Pre-Deployment Checklist

### Code Quality
- [ ] All tests pass (`npm run test:all`)
- [ ] Code coverage meets requirements (90%+)
- [ ] No linting errors (`npm run lint`)
- [ ] TypeScript compilation successful (`npm run type-check`)
- [ ] Security scan passes (`npm run security-check`)

### Performance
- [ ] Bundle size analysis completed (`npm run analyze-bundle`)
- [ ] Performance tests pass (`npm run test:performance`)
- [ ] Lighthouse score 90+
- [ ] Core Web Vitals within targets

### Security
- [ ] No hardcoded credentials
- [ ] Environment variables properly configured
- [ ] Security headers configured
- [ ] HTTPS enabled
- [ ] Rate limiting configured

### Database
- [ ] Database migrations applied
- [ ] Row Level Security policies active
- [ ] Backup strategy implemented
- [ ] Monitoring configured

## 📈 Monitoring & Observability

### Application Monitoring
```typescript
// Performance monitoring
const performanceObserver = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    if (entry.entryType === 'navigation') {
      console.log('Navigation timing:', entry);
    }
  });
});

performanceObserver.observe({ entryTypes: ['navigation', 'measure'] });
```

### Error Tracking
```typescript
// Error boundary with tracking
class ErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Send to monitoring service
    this.trackError(error, errorInfo);
  }
  
  trackError(error: Error, errorInfo: ErrorInfo) {
    // Implementation for error tracking service
  }
}
```

### Health Checks
```typescript
// Health check endpoint
export async function GET() {
  try {
    // Check database connection
    await supabase.from('pricing_items').select('id').limit(1);
    
    return new Response(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      status: 'unhealthy',
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:all
      - run: npm run security-check
      - run: npm run analyze-bundle

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build:prod
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🚨 Rollback Strategy

### Automated Rollback
```bash
# Rollback to previous version
vercel rollback

# Or via API
curl -X POST "https://api.vercel.com/v1/deployments/$DEPLOYMENT_ID/rollback" \
  -H "Authorization: Bearer $VERCEL_TOKEN"
```

### Manual Rollback
```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or deploy specific version
vercel --prod --force
```

## 📋 Post-Deployment

### Verification Steps
1. **Functionality Testing**
   - [ ] All features work correctly
   - [ ] User authentication works
   - [ ] Data persistence works
   - [ ] PDF generation works

2. **Performance Verification**
   - [ ] Page load times acceptable
   - [ ] API response times good
   - [ ] No memory leaks
   - [ ] Bundle size within limits

3. **Security Verification**
   - [ ] HTTPS working
   - [ ] Security headers present
   - [ ] No exposed credentials
   - [ ] Rate limiting active

### Monitoring Setup
- [ ] Error tracking configured
- [ ] Performance monitoring active
- [ ] Uptime monitoring enabled
- [ ] Log aggregation working

---

**For troubleshooting and advanced deployment scenarios, see the [Troubleshooting Guide](./TROUBLESHOOTING.md).**
