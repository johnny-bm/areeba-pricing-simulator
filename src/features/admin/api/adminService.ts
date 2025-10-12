import { api } from '../../../utils/api';
import { AdminUser, AdminInvite, AdminScenario, AdminGuestSubmission, AdminStats, AdminFilters } from '../../../types/domain';
import { ADMIN_ERRORS } from '../constants';

export class AdminService {
  /**
   * Get admin statistics
   */
  static async getStats(): Promise<AdminStats> {
    try {
      const stats = await api.getAdminStats();
      return stats;
    } catch (error) {
      throw new Error(`Failed to fetch admin stats: ${(error as Error).message}`);
    }
  }

  /**
   * Get all users with optional filtering
   */
  static async getUsers(filters?: AdminFilters, currentUserRole?: string): Promise<AdminUser[]> {
    try {
      // Security check: Only admins and owners can view users
      if (!currentUserRole || !['admin', 'owner'].includes(currentUserRole)) {
        throw new Error('Insufficient permissions: Admin access required');
      }
      
      const users = await api.getUsers(filters);
      return users.map(user => ({
        ...user,
        lastLogin: user.last_login,
        loginCount: user.login_count
      }));
    } catch (error) {
      throw new Error(`Failed to fetch users: ${(error as Error).message}`);
    }
  }

  /**
   * Get user by ID
   */
  static async getUser(id: string, currentUserRole?: string): Promise<AdminUser | null> {
    try {
      // Security check: Only admins and owners can view user details
      if (!currentUserRole || !['admin', 'owner'].includes(currentUserRole)) {
        throw new Error('Insufficient permissions: Admin access required');
      }
      
      const user = await api.getUser(id);
      if (!user) return null;
      
      return {
        ...user,
        lastLogin: user.last_login,
        loginCount: user.login_count
      };
    } catch (error) {
      throw new Error(`Failed to fetch user: ${(error as Error).message}`);
    }
  }

  /**
   * Update user
   */
  static async updateUser(id: string, updates: Partial<AdminUser>, currentUserRole?: string, targetUserRole?: string): Promise<AdminUser> {
    try {
      // Security check: Only admins and owners can update users
      if (!currentUserRole || !['admin', 'owner'].includes(currentUserRole)) {
        throw new Error('Insufficient permissions: Admin access required');
      }
      
      // Additional check: Admins cannot modify other admins or owners
      if (currentUserRole === 'admin' && targetUserRole && ['admin', 'owner'].includes(targetUserRole)) {
        throw new Error('Insufficient permissions: Cannot modify admin or owner accounts');
      }
      
      const updatedUser = await api.updateUser(id, updates);
      return {
        ...updatedUser,
        lastLogin: updatedUser.last_login,
        loginCount: updatedUser.login_count
      };
    } catch (error) {
      throw new Error(`Failed to update user: ${(error as Error).message}`);
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(id: string, currentUserRole?: string, targetUserRole?: string): Promise<void> {
    try {
      // Security check: Only admins and owners can delete users
      if (!currentUserRole || !['admin', 'owner'].includes(currentUserRole)) {
        throw new Error('Insufficient permissions: Admin access required');
      }
      
      // Additional check: Admins cannot delete other admins or owners
      if (currentUserRole === 'admin' && targetUserRole && ['admin', 'owner'].includes(targetUserRole)) {
        throw new Error('Insufficient permissions: Cannot delete admin or owner accounts');
      }
      
      await api.deleteUser(id);
    } catch (error) {
      throw new Error(`Failed to delete user: ${(error as Error).message}`);
    }
  }

  /**
   * Get all invites
   */
  static async getInvites(currentUserRole?: string): Promise<AdminInvite[]> {
    try {
      // Security check: Only admins and owners can view invites
      if (!currentUserRole || !['admin', 'owner'].includes(currentUserRole)) {
        throw new Error('Insufficient permissions: Admin access required');
      }
      
      const invites = await api.getInvites();
      return invites;
    } catch (error) {
      throw new Error(`Failed to fetch invites: ${(error as Error).message}`);
    }
  }

  /**
   * Create invite
   */
  static async createInvite(invite: Omit<AdminInvite, 'id' | 'created_at' | 'used_at'>, currentUserRole?: string): Promise<AdminInvite> {
    try {
      // Security check: Only admins and owners can create invites
      if (!currentUserRole || !['admin', 'owner'].includes(currentUserRole)) {
        throw new Error('Insufficient permissions: Admin access required');
      }
      
      const newInvite = await api.createInvite(invite);
      return newInvite;
    } catch (error) {
      throw new Error(`Failed to create invite: ${(error as Error).message}`);
    }
  }

  /**
   * Delete invite
   */
  static async deleteInvite(id: string, currentUserRole?: string): Promise<void> {
    try {
      // Security check: Only admins and owners can delete invites
      if (!currentUserRole || !['admin', 'owner'].includes(currentUserRole)) {
        throw new Error('Insufficient permissions: Admin access required');
      }
      
      await api.deleteInvite(id);
    } catch (error) {
      throw new Error(`Failed to delete invite: ${(error as Error).message}`);
    }
  }

  /**
   * Get all scenarios
   */
  static async getScenarios(filters?: AdminFilters): Promise<AdminScenario[]> {
    try {
      const scenarios = await api.loadScenarios();
      // TODO(types): Apply filters when implemented
      return scenarios.map(scenario => ({
        id: scenario.id || '',
        name: 'Unnamed Scenario', // TODO(types): Add name field to ScenarioData
        created_at: scenario.createdAt || new Date().toISOString(),
        updated_at: scenario.updatedAt || new Date().toISOString(),
        status: 'draft' as const, // TODO(types): Add status field to ScenarioData
        total_price: scenario.summary?.totalProjectCost || 0,
        user_id: scenario.userId || null
      }));
    } catch (error) {
      throw new Error(`Failed to fetch scenarios: ${(error as Error).message}`);
    }
  }

  /**
   * Get scenario by ID
   */
  static async getScenario(id: string): Promise<AdminScenario | null> {
    try {
      const scenario = await api.getScenarioData(id);
      if (!scenario) return null;
      
      return {
        id: scenario.id || '',
        name: 'Unnamed Scenario', // TODO(types): Add name field to ScenarioData
        created_at: scenario.createdAt || new Date().toISOString(),
        updated_at: scenario.updatedAt || new Date().toISOString(),
        status: 'draft' as const, // TODO(types): Add status field to ScenarioData
        total_price: scenario.summary?.totalProjectCost || 0,
        user_id: scenario.userId || null
      };
    } catch (error) {
      throw new Error(`Failed to fetch scenario: ${(error as Error).message}`);
    }
  }

  /**
   * Delete scenario
   */
  static async deleteScenario(id: string): Promise<void> {
    try {
      await api.deleteScenario(id);
    } catch (error) {
      throw new Error(`Failed to delete scenario: ${(error as Error).message}`);
    }
  }

  /**
   * Get all guest submissions
   */
  static async getGuestSubmissions(filters?: AdminFilters): Promise<AdminGuestSubmission[]> {
    try {
      const submissions = await api.loadGuestSubmissions();
      // TODO(types): Apply filters when implemented
      return submissions.map(submission => ({
        id: submission.id || '',
        email: submission.email || '',
        first_name: submission.first_name || '',
        last_name: submission.last_name || '',
        company_name: submission.company_name || '',
        scenario_name: submission.scenario_name || '',
        total_price: submission.total_price || 0,
        status: submission.status || 'submitted',
        created_at: submission.created_at || new Date().toISOString()
      }));
    } catch (error) {
      throw new Error(`Failed to fetch guest submissions: ${(error as Error).message}`);
    }
  }

  /**
   * Get guest submission by ID
   */
  static async getGuestSubmission(id: string): Promise<AdminGuestSubmission | null> {
    try {
      const submission = await api.getGuestScenarioData(id);
      if (!submission) return null;
      
      return {
        id: submission.id || '',
        email: submission.email || '',
        first_name: submission.first_name || '',
        last_name: submission.last_name || '',
        company_name: submission.company_name || '',
        scenario_name: submission.scenario_name || '',
        total_price: submission.total_price || 0,
        status: submission.status || 'submitted',
        created_at: submission.created_at || new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to fetch guest submission: ${(error as Error).message}`);
    }
  }

  /**
   * Delete guest submission
   * TODO(types): Implement guest submission deletion
   */
  static async deleteGuestSubmission(id: string): Promise<void> {
    try {
      // TODO(types): Implement guest submission deletion
      throw new Error('Guest submission deletion not implemented yet');
    } catch (error) {
      throw new Error(`Failed to delete guest submission: ${(error as Error).message}`);
    }
  }

  /**
   * Export data
   */
  static async exportData(type: 'users' | 'scenarios' | 'guest_submissions', format: 'csv' | 'json' = 'csv', currentUserRole?: string): Promise<Blob> {
    try {
      // Security check: Only admins and owners can export data
      if (!currentUserRole || !['admin', 'owner'].includes(currentUserRole)) {
        throw new Error('Insufficient permissions: Admin access required');
      }
      
      let data: any[] = [];
      
      switch (type) {
        case 'users':
          data = await this.getUsers(undefined, currentUserRole);
          break;
        case 'scenarios':
          data = await this.getScenarios();
          break;
        case 'guest_submissions':
          data = await this.getGuestSubmissions();
          break;
      }
      
      if (format === 'json') {
        return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      } else {
        // Convert to CSV
        if (data.length === 0) {
          return new Blob([''], { type: 'text/csv' });
        }
        
        const headers = Object.keys(data[0]);
        const csvContent = [
          headers.join(','),
          ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
        ].join('\n');
        
        return new Blob([csvContent], { type: 'text/csv' });
      }
    } catch (error) {
      throw new Error(`Failed to export data: ${(error as Error).message}`);
    }
  }

  /**
   * Check if user has admin permissions
   */
  static hasPermission(userRole: string, permission: string): boolean {
    const rolePermissions: Record<string, string[]> = {
      owner: ['manage_users', 'manage_invites', 'view_analytics', 'manage_settings', 'export_data'],
      admin: ['manage_users', 'manage_invites', 'view_analytics', 'export_data'],
      member: ['view_analytics'],
    };

    return rolePermissions[userRole]?.includes(permission) || false;
  }

  /**
   * Validate admin action
   */
  static validateAction(userRole: string, targetUserRole: string, action: string): boolean {
    // Owner can do anything
    if (userRole === 'owner') {
      return true;
    }

    // Admin can manage members but not other admins or owners
    if (userRole === 'admin') {
      if (action === 'delete' && targetUserRole === 'owner') {
        return false;
      }
      if (targetUserRole === 'admin' || targetUserRole === 'owner') {
        return false;
      }
      return true;
    }

    // Members can only view
    return action === 'read';
  }
}
