# Features

This folder contains feature-based modules. Each feature should be self-contained with its own components, hooks, and utilities.

## Structure
- `auth/` - Authentication and user management
- `admin/` - Admin panel features
- `simulator/` - Pricing simulator
- `configuration/` - System configuration
- `guest/` - Guest user features
- `pdfBuilder/` - PDF generation features
- `pricing/` - Pricing management

## Guidelines
- Each feature should export via index.ts
- Keep features independent
- Share common code via src/components or src/utils
- Use consistent naming conventions (PascalCase for components)
- Include proper TypeScript types
