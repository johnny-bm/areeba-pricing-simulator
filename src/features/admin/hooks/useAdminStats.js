import { useState, useEffect, useCallback } from 'react';
import { AdminService } from '../api/adminService';
export function useAdminStats() {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchStats = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await AdminService.getStats();
            setStats(data);
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    const refreshStats = useCallback(() => {
        fetchStats();
    }, [fetchStats]);
    useEffect(() => {
        fetchStats();
    }, [fetchStats]);
    return {
        stats,
        isLoading,
        error,
        refreshStats,
    };
}
