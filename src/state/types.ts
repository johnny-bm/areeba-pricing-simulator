/**
 * State Management Types
 * 
 * Centralized type definitions for Zustand store
 */

import { User } from '@/types/domain';

// Auth Types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// Pricing Types
export interface PricingItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: string;
  unit: string;
  quantity: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  totalPrice: number;
}

export interface Scenario {
  id: string;
  name: string;
  clientName: string;
  projectName: string;
  items: PricingItem[];
  total: number;
  createdAt: string;
}

export interface PricingResult {
  subtotal: number;
  discount: number;
  total: number;
  savings: number;
  savingsRate: number;
}

export interface PricingState {
  selectedItems: PricingItem[];
  scenario: Scenario | null;
  isCalculating: boolean;
  calculationResult: PricingResult | null;
  error: string | null;
}

export interface PricingActions {
  addItem: (item: PricingItem) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  updateItemDiscount: (itemId: string, discount: number, type: 'percentage' | 'fixed') => void;
  clearItems: () => void;
  calculatePricing: () => Promise<void>;
  setScenario: (scenario: Scenario | null) => void;
  reset: () => void;
  setError: (error: string | null) => void;
}

// UI Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  activeModal: string | null;
  notifications: Notification[];
}

export interface UIActions {
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

// Admin Types
export interface AdminStats {
  totalUsers: number;
  totalScenarios: number;
  totalGuestSubmissions: number;
  totalRevenue: number;
  activeUsers: number;
  averageScenarioValue: number;
}

export interface AdminState {
  users: User[];
  stats: AdminStats | null;
  isLoading: boolean;
  error: string | null;
}

export interface AdminActions {
  fetchUsers: () => Promise<void>;
  fetchStats: () => Promise<void>;
  updateUser: (userId: string, data: Partial<User>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  setUsers: (users: User[]) => void;
  setStats: (stats: AdminStats | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// Document Types
export interface Document {
  id: string;
  name: string;
  type: 'proposal' | 'quote' | 'invoice';
  content: string;
  templateId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  name: string;
  type: 'proposal' | 'quote' | 'invoice';
  content: string;
  isActive: boolean;
  createdAt: string;
}

export interface DocumentState {
  currentDocument: Document | null;
  templates: Template[];
  isGenerating: boolean;
  error: string | null;
}

export interface DocumentActions {
  setDocument: (document: Document | null) => void;
  generatePDF: (documentId: string) => Promise<void>;
  loadTemplates: () => Promise<void>;
  setTemplates: (templates: Template[]) => void;
  setGenerating: (generating: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// Store Types
export interface StoreState {
  auth: AuthState & AuthActions;
  pricing: PricingState & PricingActions;
  ui: UIState & UIActions;
  admin: AdminState & AdminActions;
  document: DocumentState & DocumentActions;
}
