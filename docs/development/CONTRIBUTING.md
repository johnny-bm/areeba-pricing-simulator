# Contributing Guide

## Welcome Contributors! 🎉

Thank you for your interest in contributing to the Areeba Pricing Simulator! This guide will help you get started with contributing to our project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Process](#contributing-process)
- [Code Standards](#code-standards)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)

## 🤝 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors. Please:

- **Be respectful** and inclusive in all interactions
- **Be constructive** in feedback and discussions
- **Be patient** with newcomers and learning processes
- **Be collaborative** and help others succeed

### Unacceptable Behavior

- Harassment, discrimination, or offensive language
- Personal attacks or trolling
- Spam or off-topic discussions
- Any behavior that makes others feel unwelcome

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **VS Code** (recommended) - [Download here](https://code.visualstudio.com/)
- **Supabase account** - [Sign up here](https://supabase.com/)

### Fork and Clone

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/areeba-pricing-simulator.git
   cd areeba-pricing-simulator
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/areeba/pricing-simulator.git
   ```

## 🛠️ Development Setup

### 1. Install Dependencies

```bash
# Install all dependencies
npm install

# Install additional development tools
npm install -g @typescript-eslint/parser
npm install -g prettier
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env.local

# Edit environment variables
# Add your Supabase credentials
```

**Required Environment Variables:**
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup

```bash
# Run database migrations
npm run db:migrate

# Seed development data
npm run db:seed
```

### 4. Start Development Server

```bash
# Start the development server
npm run dev

# Open http://localhost:3000
```

### 5. Verify Setup

```bash
# Run all tests
npm run test:all

# Check code quality
npm run lint
npm run type-check

# Verify security
npm run security-check
```

## 🔄 Contributing Process

### 1. Choose an Issue

- Look for issues labeled `good first issue` for beginners
- Check `help wanted` for more complex tasks
- Create a new issue if you have an idea

### 2. Create a Branch

```bash
# Create and switch to feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-description
```

**Branch Naming Convention:**
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test improvements

### 3. Make Changes

- Write clean, readable code
- Follow our coding standards
- Add tests for new functionality
- Update documentation as needed

### 4. Test Your Changes

```bash
# Run all tests
npm run test:all

# Run specific test suites
npm run test              # Unit tests
npm run test:integration  # Integration tests
npm run test:critical    # Critical path tests
npm run test:performance # Performance tests
npm run test:e2e         # E2E tests

# Check code quality
npm run lint
npm run type-check
npm run format:check

# Security check
npm run security-check
```

### 5. Commit Changes

```bash
# Stage changes
git add .

# Commit with conventional commit message
git commit -m "feat: add new pricing calculation feature"

# Push to your fork
git push origin feature/your-feature-name
```

## 📝 Code Standards

### TypeScript Guidelines

```typescript
// ✅ Good - Explicit types
interface UserProfile {
  id: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
}

// ✅ Good - Type guards
function isUserProfile(obj: unknown): obj is UserProfile {
  return typeof obj === 'object' && obj !== null && 'id' in obj;
}

// ❌ Bad - Any types
function processData(data: any): any {
  return data;
}

// ❌ Bad - Implicit any
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

### React Component Guidelines

```typescript
// ✅ Good - Functional component with proper typing
interface PricingItemProps {
  item: PricingItem;
  onSelect: (item: PricingItem) => void;
  isSelected: boolean;
}

export const PricingItem: React.FC<PricingItemProps> = ({
  item,
  onSelect,
  isSelected
}) => {
  const handleClick = useCallback(() => {
    onSelect(item);
  }, [item, onSelect]);

  return (
    <div
      className={`pricing-item ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
    >
      <h3>{item.name}</h3>
      <p>${item.defaultPrice}</p>
    </div>
  );
};
```

### File Organization

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components
│   └── features/       # Feature-specific components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── services/           # API and external services
└── stores/             # State management
```

### Naming Conventions

- **Files**: `kebab-case` (e.g., `pricing-item.tsx`)
- **Components**: `PascalCase` (e.g., `PricingItem`)
- **Functions**: `camelCase` (e.g., `calculateTotal`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`)
- **Types/Interfaces**: `PascalCase` (e.g., `UserProfile`)

## 🧪 Testing Requirements

### Test Coverage

- **Minimum Coverage**: 90%
- **Critical Paths**: 100% coverage required
- **New Features**: Must include tests

### Test Types

#### Unit Tests
```typescript
// Example: PricingItem.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { PricingItem } from '../PricingItem';

describe('PricingItem', () => {
  it('should render item details', () => {
    const mockItem = {
      id: '1',
      name: 'Test Item',
      defaultPrice: 100
    };

    render(<PricingItem item={mockItem} onSelect={jest.fn()} isSelected={false} />);
    
    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByText('$100')).toBeInTheDocument();
  });

  it('should call onSelect when clicked', () => {
    const mockOnSelect = jest.fn();
    const mockItem = { id: '1', name: 'Test Item', defaultPrice: 100 };

    render(<PricingItem item={mockItem} onSelect={mockOnSelect} isSelected={false} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnSelect).toHaveBeenCalledWith(mockItem);
  });
});
```

#### Integration Tests
```typescript
// Example: API.test.ts
import { api } from '../utils/api';

describe('API Integration', () => {
  it('should load pricing items', async () => {
    const items = await api.loadPricingItems('simulator-1');
    expect(Array.isArray(items)).toBe(true);
  });
});
```

### Test Best Practices

- **Arrange-Act-Assert**: Structure tests clearly
- **Descriptive Names**: Use clear, descriptive test names
- **Single Responsibility**: Test one thing per test
- **Mock External Dependencies**: Use mocks for external services
- **Test Edge Cases**: Include error conditions and edge cases

## 📋 Pull Request Process

### 1. Pre-Submission Checklist

- [ ] All tests pass (`npm run test:all`)
- [ ] Code coverage meets requirements (90%+)
- [ ] No linting errors (`npm run lint`)
- [ ] TypeScript compilation successful (`npm run type-check`)
- [ ] Security scan passes (`npm run security-check`)
- [ ] Documentation updated (if needed)
- [ ] Commit messages follow conventional format

### 2. Create Pull Request

```bash
# Push your branch
git push origin feature/your-feature-name

# Create PR on GitHub
# Use the PR template provided
```

### 3. PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project standards
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### 4. Review Process

- **Automated Checks**: CI/CD pipeline runs automatically
- **Code Review**: At least one maintainer review required
- **Testing**: All tests must pass
- **Security**: Security scan must pass

## 🐛 Issue Guidelines

### Creating Issues

#### Bug Reports
```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '....'
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 91]
- Version: [e.g., 2.1.0]
```

#### Feature Requests
```markdown
**Feature Description**
Clear description of the feature

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should this be implemented?

**Alternatives**
Other solutions considered
```

### Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `priority: high` - High priority
- `priority: medium` - Medium priority
- `priority: low` - Low priority

## 📚 Documentation

### Code Documentation

```typescript
/**
 * Calculates the total price for a list of pricing items
 * @param items - Array of pricing items
 * @param discounts - Optional discounts to apply
 * @returns Total price with discounts applied
 * @throws {Error} When items array is empty
 * @example
 * ```typescript
 * const items = [{ price: 100 }, { price: 200 }];
 * const total = calculateTotal(items, { percentage: 10 });
 * console.log(total); // 270
 * ```
 */
export function calculateTotal(
  items: PricingItem[],
  discounts?: DiscountConfig
): number {
  // Implementation
}
```

### README Updates

- Update README.md for significant changes
- Add new features to feature list
- Update installation instructions if needed
- Document new environment variables

## 🚀 Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped
- [ ] Release notes prepared

## 🆘 Getting Help

### Resources

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/areeba/pricing-simulator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/areeba/pricing-simulator/discussions)
- **Code Review**: Ask for help in PR comments

### Common Issues

#### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Test Failures
```bash
# Run tests with verbose output
npm run test -- --verbose

# Run specific test file
npm run test -- PricingItem.test.tsx
```

#### TypeScript Errors
```bash
# Check TypeScript configuration
npm run type-check

# Generate type definitions
npm run build
```

## 🎉 Recognition

### Contributors

We recognize all contributors in our:
- **README.md** - Contributor list
- **CHANGELOG.md** - Release notes
- **GitHub Contributors** - Automatic recognition

### Contribution Types

- **Code**: Bug fixes, features, improvements
- **Documentation**: Guides, examples, tutorials
- **Testing**: Test cases, bug reports
- **Design**: UI/UX improvements
- **Community**: Helping others, discussions

---

**Thank you for contributing to the Areeba Pricing Simulator! Your contributions help make this project better for everyone. 🚀**
