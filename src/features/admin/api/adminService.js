import { api } from '../../../utils/api';
export class AdminService {
    /**
     * Get admin statistics
     */
    static async getStats() {
        try {
            const response = await api.getAdminStats();
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to fetch admin stats: ${error.message}`);
        }
    }
    /**
     * Get all users with optional filtering
     */
    static async getUsers(filters) {
        try {
            const response = await api.getUsers(filters);
            return response.data || [];
        }
        catch (error) {
            throw new Error(`Failed to fetch users: ${error.message}`);
        }
    }
    /**
     * Get user by ID
     */
    static async getUser(id) {
        try {
            const response = await api.getUser(id);
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to fetch user: ${error.message}`);
        }
    }
    /**
     * Update user
     */
    static async updateUser(id, updates) {
        try {
            const response = await api.updateUser(id, updates);
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to update user: ${error.message}`);
        }
    }
    /**
     * Delete user
     */
    static async deleteUser(id) {
        try {
            await api.deleteUser(id);
        }
        catch (error) {
            throw new Error(`Failed to delete user: ${error.message}`);
        }
    }
    /**
     * Get all invites
     */
    static async getInvites() {
        try {
            const response = await api.getInvites();
            return response.data || [];
        }
        catch (error) {
            throw new Error(`Failed to fetch invites: ${error.message}`);
        }
    }
    /**
     * Create invite
     */
    static async createInvite(invite) {
        try {
            const response = await api.createInvite(invite);
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to create invite: ${error.message}`);
        }
    }
    /**
     * Delete invite
     */
    static async deleteInvite(id) {
        try {
            await api.deleteInvite(id);
        }
        catch (error) {
            throw new Error(`Failed to delete invite: ${error.message}`);
        }
    }
    /**
     * Get all scenarios
     */
    static async getScenarios(filters) {
        try {
            const response = await api.getScenarios(filters);
            return response.data || [];
        }
        catch (error) {
            throw new Error(`Failed to fetch scenarios: ${error.message}`);
        }
    }
    /**
     * Get scenario by ID
     */
    static async getScenario(id) {
        try {
            const response = await api.getScenario(id);
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to fetch scenario: ${error.message}`);
        }
    }
    /**
     * Delete scenario
     */
    static async deleteScenario(id) {
        try {
            await api.deleteScenario(id);
        }
        catch (error) {
            throw new Error(`Failed to delete scenario: ${error.message}`);
        }
    }
    /**
     * Get all guest submissions
     */
    static async getGuestSubmissions(filters) {
        try {
            const response = await api.getGuestSubmissions(filters);
            return response.data || [];
        }
        catch (error) {
            throw new Error(`Failed to fetch guest submissions: ${error.message}`);
        }
    }
    /**
     * Get guest submission by ID
     */
    static async getGuestSubmission(id) {
        try {
            const response = await api.getGuestSubmission(id);
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to fetch guest submission: ${error.message}`);
        }
    }
    /**
     * Delete guest submission
     */
    static async deleteGuestSubmission(id) {
        try {
            await api.deleteGuestSubmission(id);
        }
        catch (error) {
            throw new Error(`Failed to delete guest submission: ${error.message}`);
        }
    }
    /**
     * Export data
     */
    static async exportData(type, format = 'csv') {
        try {
            const response = await api.exportData(type, format);
            return response.data;
        }
        catch (error) {
            throw new Error(`Failed to export data: ${error.message}`);
        }
    }
    /**
     * Check if user has admin permissions
     */
    static hasPermission(userRole, permission) {
        const rolePermissions = {
            owner: ['manage_users', 'manage_invites', 'view_analytics', 'manage_settings', 'export_data'],
            admin: ['manage_users', 'manage_invites', 'view_analytics', 'export_data'],
            member: ['view_analytics'],
        };
        return rolePermissions[userRole]?.includes(permission) || false;
    }
    /**
     * Validate admin action
     */
    static validateAction(userRole, targetUserRole, action) {
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
