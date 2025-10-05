import { api } from '../../../utils/api';
import { AdminUser, AdminInvite, AdminScenario, AdminGuestSubmission, AdminStats, AdminFilters } from '../types';
import { ADMIN_ERRORS } from '../constants';

export class AdminService {
  /**
   * Get admin statistics
   */
  static async getStats(): Promise<AdminStats> {
    try {
      const response = await api.getAdminStats();
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch admin stats: ${(error as Error).message}`);
    }
  }

  /**
   * Get all users with optional filtering
   */
  static async getUsers(filters?: AdminFilters): Promise<AdminUser[]> {
    try {
      const response = await api.getUsers(filters);
      return response.data || [];
    } catch (error) {
      throw new Error(`Failed to fetch users: ${(error as Error).message}`);
    }
  }

  /**
   * Get user by ID
   */
  static async getUser(id: string): Promise<AdminUser | null> {
    try {
      const response = await api.getUser(id);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch user: ${(error as Error).message}`);
    }
  }

  /**
   * Update user
   */
  static async updateUser(id: string, updates: Partial<AdminUser>): Promise<AdminUser> {
    try {
      const response = await api.updateUser(id, updates);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update user: ${(error as Error).message}`);
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(id: string): Promise<void> {
    try {
      await api.deleteUser(id);
    } catch (error) {
      throw new Error(`Failed to delete user: ${(error as Error).message}`);
    }
  }

  /**
   * Get all invites
   */
  static async getInvites(): Promise<AdminInvite[]> {
    try {
      const response = await api.getInvites();
      return response.data || [];
    } catch (error) {
      throw new Error(`Failed to fetch invites: ${(error as Error).message}`);
    }
  }

  /**
   * Create invite
   */
  static async createInvite(invite: Omit<AdminInvite, 'id' | 'created_at' | 'used_at'>): Promise<AdminInvite> {
    try {
      const response = await api.createInvite(invite);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create invite: ${(error as Error).message}`);
    }
  }

  /**
   * Delete invite
   */
  static async deleteInvite(id: string): Promise<void> {
    try {
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
      const response = await api.getScenarios(filters);
      return response.data || [];
    } catch (error) {
      throw new Error(`Failed to fetch scenarios: ${(error as Error).message}`);
    }
  }

  /**
   * Get scenario by ID
   */
  static async getScenario(id: string): Promise<AdminScenario | null> {
    try {
      const response = await api.getScenario(id);
      return response.data;
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
      const response = await api.getGuestSubmissions(filters);
      return response.data || [];
    } catch (error) {
      throw new Error(`Failed to fetch guest submissions: ${(error as Error).message}`);
    }
  }

  /**
   * Get guest submission by ID
   */
  static async getGuestSubmission(id: string): Promise<AdminGuestSubmission | null> {
    try {
      const response = await api.getGuestSubmission(id);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch guest submission: ${(error as Error).message}`);
    }
  }

  /**
   * Delete guest submission
   */
  static async deleteGuestSubmission(id: string): Promise<void> {
    try {
      await api.deleteGuestSubmission(id);
    } catch (error) {
      throw new Error(`Failed to delete guest submission: ${(error as Error).message}`);
    }
  }

  /**
   * Export data
   */
  static async exportData(type: 'users' | 'scenarios' | 'guest_submissions', format: 'csv' | 'json' = 'csv'): Promise<Blob> {
    try {
      const response = await api.exportData(type, format);
      return response.data;
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
