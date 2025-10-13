# State Management Documentation

## 🏗️ Architecture Overview

The state management system uses Zustand with a slice-based architecture for centralized, type-safe state management.

### **Store Structure**
```
src/state/
├── store.ts                    # Main store configuration
├── types.ts                    # TypeScript type definitions
├── slices/                     # Feature-specific state slices
│   ├── auth.slice.ts          # Authentication state
│   ├── pricing.slice.ts       # Pricing calculations
│   ├── ui.slice.ts            # UI state (theme, modals)
│   ├── admin.slice.ts         # Admin operations
│   └── document.slice.ts      # Document generation
└── middleware/                 # Custom middleware
    └── logger.ts              # Optional logging
```

### **Middleware Stack**
1. **Immer** - Immutable state updates
2. **DevTools** - Browser debugging
3. **Persist** - Selective persistence (auth + theme only)

## 📋 Usage Examples

### **Auth Slice**
```typescript
import { useAuth } from '@/state/store';

function LoginComponent() {
  const { user, isAuthenticated, login, logout, isLoading, error } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
      // User is now logged in
    } catch (error) {
      // Handle login error
      console.error('Login failed:', error);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {isAuthenticated ? (
        <div>
          Welcome, {user?.full_name}!
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={() => handleLogin('user@example.com', 'password')}>
          Login
        </button>
      )}
    </div>
  );
}
```

### **Pricing Slice**
```typescript
import { usePricing } from '@/state/store';

function PricingComponent() {
  const { 
    selectedItems, 
    calculationResult, 
    addItem, 
    removeItem, 
    calculatePricing,
    isCalculating 
  } = usePricing();

  const handleAddItem = (item: PricingItem) => {
    addItem(item);
  };

  const handleCalculate = async () => {
    try {
      await calculatePricing();
      // Results available in calculationResult
    } catch (error) {
      console.error('Calculation failed:', error);
    }
  };

  return (
    <div>
      <h2>Selected Items ({selectedItems.length})</h2>
      {selectedItems.map(item => (
        <div key={item.id}>
          {item.name} - ${item.totalPrice}
          <button onClick={() => removeItem(item.id)}>Remove</button>
        </div>
      ))}
      
      <button onClick={handleCalculate} disabled={isCalculating}>
        {isCalculating ? 'Calculating...' : 'Calculate Total'}
      </button>
      
      {calculationResult && (
        <div>
          <p>Subtotal: ${calculationResult.subtotal}</p>
          <p>Discount: ${calculationResult.discount}</p>
          <p>Total: ${calculationResult.total}</p>
        </div>
      )}
    </div>
  );
}
```

### **UI Slice**
```typescript
import { useUI } from '@/state/store';

function HeaderComponent() {
  const { 
    sidebarOpen, 
    theme, 
    toggleSidebar, 
    setTheme,
    addNotification 
  } = useUI();

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    addNotification({
      type: 'success',
      title: 'Theme Changed',
      message: `Switched to ${newTheme} mode`,
    });
  };

  return (
    <header>
      <button onClick={toggleSidebar}>
        {sidebarOpen ? 'Close' : 'Open'} Sidebar
      </button>
      <button onClick={handleThemeToggle}>
        Switch to {theme === 'light' ? 'dark' : 'light'} mode
      </button>
    </header>
  );
}
```

### **Admin Slice**
```typescript
import { useAdmin } from '@/state/store';

function AdminDashboard() {
  const { 
    users, 
    stats, 
    isLoading, 
    fetchUsers, 
    fetchStats,
    updateUser 
  } = useAdmin();

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const handleUpdateUser = async (userId: string, data: Partial<User>) => {
    try {
      await updateUser(userId, data);
      // User updated successfully
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Users ({users.length})</h2>
      {users.map(user => (
        <div key={user.id}>
          {user.full_name} - {user.role}
          <button onClick={() => handleUpdateUser(user.id, { is_active: !user.is_active })}>
            Toggle Active
          </button>
        </div>
      ))}
      
      {stats && (
        <div>
          <p>Total Users: {stats.totalUsers}</p>
          <p>Total Revenue: ${stats.totalRevenue}</p>
        </div>
      )}
    </div>
  );
}
```

### **Document Slice**
```typescript
import { useDocument } from '@/state/store';

function DocumentManager() {
  const { 
    currentDocument, 
    templates, 
    isGenerating, 
    generatePDF,
    loadTemplates 
  } = useDocument();

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleGeneratePDF = async (documentId: string) => {
    try {
      await generatePDF(documentId);
      // PDF generated successfully
    } catch (error) {
      console.error('PDF generation failed:', error);
    }
  };

  return (
    <div>
      <h2>Templates ({templates.length})</h2>
      {templates.map(template => (
        <div key={template.id}>
          {template.name} - {template.type}
          <button 
            onClick={() => handleGeneratePDF(template.id)}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate PDF'}
          </button>
        </div>
      ))}
    </div>
  );
}
```

## 🔄 Migration Guide

### **Old Pattern (React Context) ❌**
```typescript
// Old: Context-based auth
import { useAuth } from '@/features/auth/hooks/useAuth';
const { user, login, logout } = useAuth();

// Old: Local state in components
const [selectedItems, setSelectedItems] = useState([]);
const [isLoading, setIsLoading] = useState(false);
```

### **New Pattern (Zustand) ✅**
```typescript
// New: Zustand store
import { useAuth, usePricing } from '@/state/store';
const { user, login, logout } = useAuth();
const { selectedItems, addItem, removeItem } = usePricing();
```

### **Migration Steps**
1. **Replace Context imports** with Zustand selectors
2. **Remove local state** that's now in store
3. **Update action calls** to use store methods
4. **Remove Context providers** from component tree

## 🧪 Testing Guide

### **Testing Components with Store**
```typescript
import { render, screen } from '@testing-library/react';
import { useAppStore } from '@/state/store';
import { MyComponent } from './MyComponent';

// Mock the store for testing
const mockStore = {
  auth: {
    user: { id: '1', email: 'test@example.com' },
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
  },
  // ... other slices
};

jest.mock('@/state/store', () => ({
  useAppStore: () => mockStore,
}));

test('renders user information', () => {
  render(<MyComponent />);
  expect(screen.getByText('test@example.com')).toBeInTheDocument();
});
```

### **Testing Store Slices**
```typescript
import { create } from 'zustand';
import { createAuthSlice } from '../auth.slice';

test('auth slice initial state', () => {
  const store = create((...args) => createAuthSlice(...args));
  const state = store.getState();
  
  expect(state.user).toBeNull();
  expect(state.isAuthenticated).toBe(false);
});
```

## 🎯 Best Practices

### **Dos ✅**
- Use typed selector hooks (`useAuth()`, `usePricing()`)
- Handle loading and error states
- Use async actions with try/catch
- Test state changes and side effects
- Keep business logic in slices, not components

### **Don'ts ❌**
- Don't access store directly (use selectors)
- Don't mutate state directly (use actions)
- Don't put UI logic in store
- Don't forget error handling
- Don't persist sensitive data

### **Performance Tips**
- Use specific selectors to avoid unnecessary re-renders
- Memoize expensive calculations
- Use immer for complex state updates
- Keep slices focused and small

## 🔧 Development Tools

### **Redux DevTools**
- Install Redux DevTools browser extension
- Store appears as "Areeba Pricing Store"
- View state changes and time travel

### **Persistence**
- Only auth and theme are persisted
- Pricing and admin data are session-only
- Clear storage to reset persisted state

### **TypeScript Support**
- Full type safety with strict mode
- IntelliSense for all actions and state
- Compile-time error checking

## 📊 Store Structure Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Zustand Store                            │
├─────────────────────────────────────────────────────────────┤
│  Auth Slice          │  Pricing Slice      │  UI Slice      │
│  - user              │  - selectedItems    │  - theme       │
│  - isAuthenticated   │  - calculationResult│  - sidebarOpen │
│  - login()           │  - addItem()        │  - setTheme()  │
│  - logout()         │  - calculatePricing()│  - openModal() │
├─────────────────────────────────────────────────────────────┤
│  Admin Slice         │  Document Slice                     │
│  - users             │  - currentDocument                  │
│  - stats             │  - templates                        │
│  - fetchUsers()      │  - generatePDF()                    │
│  - updateUser()      │  - loadTemplates()                  │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Next Steps

1. **Replace Context usage** in components
2. **Update imports** to use new selectors
3. **Remove old Context providers**
4. **Test all functionality** works correctly
5. **Add error boundaries** for store errors
