import { useState, useEffect, useCallback } from 'react';
import { AdminService } from '../api/adminService';
export function useAdminUsers() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchUsers = useCallback(async (filters) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await AdminService.getUsers(filters);
            setUsers(data);
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    const updateUser = useCallback(async (id, updates) => {
        try {
            const updatedUser = await AdminService.updateUser(id, updates);
            setUsers(prev => prev.map(user => user.id === id ? updatedUser : user));
            return updatedUser;
        }
        catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);
    const deleteUser = useCallback(async (id) => {
        try {
            await AdminService.deleteUser(id);
            setUsers(prev => prev.filter(user => user.id !== id));
        }
        catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);
    const refreshUsers = useCallback(() => {
        fetchUsers();
    }, [fetchUsers]);
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    return {
        users,
        isLoading,
        error,
        fetchUsers,
        updateUser,
        deleteUser,
        refreshUsers,
    };
}
