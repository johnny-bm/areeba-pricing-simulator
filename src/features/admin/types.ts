// Admin feature types
export interface AdminUser {
  id: string;
  email: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  role: 'member' | 'admin' | 'owner';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  invite_id?: string;
  expires_at?: string;
}

export interface AdminInvite {
  id: string;
  email: string;
  invite_code: string;
  role: 'member' | 'admin' | 'owner';
  created_by: string;
  created_at: string;
  expires_at: string;
  used_at?: string;
}

export interface AdminScenario {
  id: string;
  user_id: string;
  client_name?: string;
  project_name?: string;
  total_cost: number;
  created_at: string;
  updated_at: string;
}

export interface AdminGuestSubmission {
  id: string;
  session_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  phone?: string;
  total_cost: number;
  created_at: string;
  updated_at: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalScenarios: number;
  totalGuestSubmissions: number;
  totalRevenue: number;
  averageScenarioValue: number;
}

export interface AdminFilters {
  dateRange?: {
    start: Date;
    end: Date;
  };
  userRole?: string;
  status?: string;
  searchTerm?: string;
}

export interface AdminTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}

export interface AdminTableRow {
  id: string;
  [key: string]: any;
}
