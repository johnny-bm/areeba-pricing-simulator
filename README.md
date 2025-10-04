# Areeba Pricing Simulator

An enterprise SPA for IT services pricing and proposals built with React, TypeScript, and Supabase.

## Features

- Dynamic pricing calculator with tiered pricing
- Drag-and-drop scenario builder
- Authentication (user login) + Guest mode
- Admin panel for managing services/categories
- PDF export functionality
- Auto-add service logic based on configuration
- Rate limiting (guest: 5/hr, user: 100/hr)
- Input sanitization (XSS/SQL injection prevention)

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui (Radix UI + Tailwind CSS v4)
- **Routing**: React Router v6
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Edge Functions**: Hono framework on Deno runtime
- **Email**: Resend API

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Development

```bash
npm run dev
```

### 4. Build for Production

```bash
npm run build
```

## Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy

### Supabase Edge Functions

The backend uses Supabase Edge Functions. Deploy them separately:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-id

# Deploy functions
supabase functions deploy
```

## Database Schema

The application uses the following Supabase tables:

- `user_profiles` - User management with roles
- `services` - Pricing items with tiered pricing
- `categories` - Service organization
- `configurations` - Dynamic client config fields
- `simulator_submissions` - Saved user scenarios
- `guest_scenarios` - Anonymous submissions
- `invite_codes` - Invite-based user creation
- `kv_store_228aa219` - Session persistence

## Security Features

- CORS protection with production allowlist
- Rate limiting for guest and authenticated users
- Input sanitization and validation
- Secure authentication with Supabase Auth
- XSS and SQL injection prevention

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

UNLICENSED - All rights reserved by areeba
# Deployment trigger
# Trigger Vercel deployment
# Deploy with environment variables
