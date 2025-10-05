// Auth-related types
export interface User {
  id: string;
  email: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  invite_id?: string;
  expires_at?: string;
}

export interface Invite {
  id: string;
  email: string;
  invite_code: string;
  role: UserRole;
  created_by: string;
  created_at: string;
  expires_at: string;
  used_at?: string;
}

export type UserRole = 'member' | 'admin' | 'owner';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  inviteCode: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}
