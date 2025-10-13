# Getting Started

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

## Quick Setup

```bash
# Clone the repository
git clone <repository-url>
cd areeba-pricing-simulator

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Run development server
npm run dev
```

## Development Workflow

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Run Tests**
   ```bash
   npm test              # Unit tests
   npm run test:integration  # Integration tests
   npm run test:e2e      # End-to-end tests
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── core/              # Clean Architecture layers
│   ├── domain/        # Business logic
│   ├── application/   # Use cases
│   └── infrastructure/ # External concerns
├── presentation/      # React components
├── state/            # State management
└── config/           # Application configuration
```

## Architecture

This project follows **Clean Architecture** principles:

- **Domain Layer**: Business entities and rules
- **Application Layer**: Use cases and interfaces
- **Infrastructure Layer**: Database, external APIs
- **Presentation Layer**: React components

## Code Standards

- TypeScript strict mode
- ESLint + Prettier
- 100% test coverage
- No `any` types
- Clean Architecture compliance

## Troubleshooting

See [Testing Guide](./TESTING_GUIDE.md) for testing issues.
See [Architecture Guide](../architecture/CLEAN_ARCHITECTURE.md) for design questions.
