# Environment Setup Guide

## Overview

This guide covers setting up development, staging, and production environments for the Areeba Pricing Simulator.

## Development Environment

### Prerequisites

- Node.js 18+ (use nvm for version management)
- npm or yarn
- Git
- VS Code (recommended)
- Supabase CLI

### Setup Steps

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd areeba-pricing-simulator
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit environment variables
   nano .env
   ```

4. **Database Setup**
   ```bash
   # Start local Supabase
   supabase start
   
   # Run migrations
   supabase db reset
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

### Development Environment Variables

```bash
# .env.development
NODE_ENV=development
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your_local_anon_key
VITE_USE_NEW_ARCHITECTURE=true
VITE_USE_NEW_PRICING=true
VITE_DEBUG=true
```

## Staging Environment

### Setup

1. **Create Staging Project**
   - Create new Supabase project for staging
   - Configure staging database
   - Set up staging deployment

2. **Environment Variables**
   ```bash
   # .env.staging
   NODE_ENV=staging
   VITE_SUPABASE_URL=your_staging_supabase_url
   VITE_SUPABASE_ANON_KEY=your_staging_anon_key
   VITE_USE_NEW_ARCHITECTURE=true
   VITE_USE_NEW_PRICING=true
   VITE_DEBUG=false
   ```

3. **Deploy to Staging**
   ```bash
   # Build for staging
   npm run build:staging
   
   # Deploy to staging
   npm run deploy:staging
   ```

## Production Environment

### Setup

1. **Production Database**
   - Create production Supabase project
   - Configure production database
   - Set up backup strategy

2. **Environment Variables**
   ```bash
   # .env.production
   NODE_ENV=production
   VITE_SUPABASE_URL=your_production_supabase_url
   VITE_SUPABASE_ANON_KEY=your_production_anon_key
   VITE_USE_NEW_ARCHITECTURE=true
   VITE_USE_NEW_PRICING=true
   VITE_DEBUG=false
   VITE_ANALYTICS_ID=your_analytics_id
   VITE_SENTRY_DSN=your_sentry_dsn
   ```

3. **Deploy to Production**
   ```bash
   # Build for production
   npm run build:production
   
   # Deploy to production
   npm run deploy:production
   ```

## Environment-Specific Configuration

### Development

```typescript
// config/development.ts
export const config = {
  api: {
    baseUrl: 'http://localhost:3000',
    timeout: 10000,
  },
  features: {
    debugMode: true,
    mockData: true,
    hotReload: true,
  },
  logging: {
    level: 'debug',
    console: true,
  },
};
```

### Staging

```typescript
// config/staging.ts
export const config = {
  api: {
    baseUrl: 'https://staging-api.areeba.com',
    timeout: 15000,
  },
  features: {
    debugMode: false,
    mockData: false,
    hotReload: false,
  },
  logging: {
    level: 'info',
    console: false,
  },
};
```

### Production

```typescript
// config/production.ts
export const config = {
  api: {
    baseUrl: 'https://api.areeba.com',
    timeout: 30000,
  },
  features: {
    debugMode: false,
    mockData: false,
    hotReload: false,
  },
  logging: {
    level: 'error',
    console: false,
  },
};
```

## Database Configuration

### Supabase Setup

1. **Create Projects**
   ```bash
   # Development
   supabase projects create areeba-pricing-dev
   
   # Staging
   supabase projects create areeba-pricing-staging
   
   # Production
   supabase projects create areeba-pricing-prod
   ```

2. **Configure Environments**
   ```bash
   # Link development
   supabase link --project-ref dev-project-ref
   
   # Link staging
   supabase link --project-ref staging-project-ref
   
   # Link production
   supabase link --project-ref prod-project-ref
   ```

3. **Run Migrations**
   ```bash
   # Development
   supabase db push
   
   # Staging
   supabase db push --project-ref staging-project-ref
   
   # Production
   supabase db push --project-ref prod-project-ref
   ```

### Database Security

1. **Row Level Security (RLS)**
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE pricing_scenarios ENABLE ROW LEVEL SECURITY;
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE pricing_items ENABLE ROW LEVEL SECURITY;
   ```

2. **Security Policies**
   ```sql
   -- Users can only access their own data
   CREATE POLICY "Users can view own scenarios" ON pricing_scenarios
     FOR SELECT USING (auth.uid() = created_by);
   
   CREATE POLICY "Users can insert own scenarios" ON pricing_scenarios
     FOR INSERT WITH CHECK (auth.uid() = created_by);
   
   CREATE POLICY "Users can update own scenarios" ON pricing_scenarios
     FOR UPDATE USING (auth.uid() = created_by);
   
   CREATE POLICY "Users can delete own scenarios" ON pricing_scenarios
     FOR DELETE USING (auth.uid() = created_by);
   ```

## Feature Flags

### Configuration

```typescript
// src/config/features.ts
export const features = {
  useNewArchitecture: process.env.VITE_USE_NEW_ARCHITECTURE === 'true',
  useNewPricing: process.env.VITE_USE_NEW_PRICING === 'true',
  enableAnalytics: process.env.VITE_ANALYTICS_ID !== undefined,
  enableErrorTracking: process.env.VITE_SENTRY_DSN !== undefined,
  enablePerformanceMonitoring: process.env.VITE_PERFORMANCE_MONITORING === 'true',
};
```

### Usage

```typescript
// In components
import { features } from '@/config/features';

if (features.useNewArchitecture) {
  // Use new architecture
} else {
  // Use legacy architecture
}
```

## Monitoring and Logging

### Development

```typescript
// Development logging
const logger = {
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, data);
    }
  },
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data);
  },
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${message}`, error);
  },
};
```

### Production

```typescript
// Production logging with Sentry
import * as Sentry from '@sentry/react';

const logger = {
  debug: (message: string, data?: any) => {
    // No debug logging in production
  },
  info: (message: string, data?: any) => {
    Sentry.addBreadcrumb({
      message,
      level: 'info',
      data,
    });
  },
  error: (message: string, error?: Error) => {
    Sentry.captureException(error || new Error(message));
  },
};
```

## Testing Environments

### Unit Tests

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- PricingItem.test.ts
```

### Integration Tests

```bash
# Run integration tests
npm run test:integration

# Run with database
npm run test:integration:db
```

### E2E Tests

```bash
# Run E2E tests
npm run test:e2e

# Run specific test
npm run test:e2e -- --grep "pricing flow"
```

## Environment Validation

### Validation Script

```typescript
// scripts/validate-environment.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
  VITE_USE_NEW_ARCHITECTURE: z.string().transform(val => val === 'true'),
  VITE_USE_NEW_PRICING: z.string().transform(val => val === 'true'),
});

export function validateEnvironment() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('Environment validation failed:', error);
    process.exit(1);
  }
}
```

### Health Checks

```typescript
// Health check endpoints
export const healthChecks = {
  database: async () => {
    // Check database connection
    const client = createSupabaseClient();
    const { error } = await client.from('users').select('count').limit(1);
    return !error;
  },
  
  externalServices: async () => {
    // Check external service availability
    const response = await fetch('https://api.external-service.com/health');
    return response.ok;
  },
  
  overall: async () => {
    const checks = await Promise.all([
      healthChecks.database(),
      healthChecks.externalServices(),
    ]);
    
    return checks.every(check => check);
  },
};
```

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   ```bash
   # Check if .env file exists
   ls -la .env*
   
   # Verify environment variables
   echo $VITE_SUPABASE_URL
   ```

2. **Database Connection Issues**
   ```bash
   # Check Supabase status
   supabase status
   
   # Verify database URL
   echo $VITE_SUPABASE_URL
   ```

3. **Build Failures**
   ```bash
   # Clear cache
   rm -rf node_modules package-lock.json
   npm install
   
   # Check TypeScript errors
   npm run type-check
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
