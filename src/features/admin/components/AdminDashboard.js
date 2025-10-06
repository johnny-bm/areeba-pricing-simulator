import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Badge } from '../../../shared/components/ui/badge';
import { Button } from '../../../shared/components/ui/button';
import { useAdminStats } from '../hooks/useAdminStats';
import { formatPrice } from '../../../utils/formatters';
import { Users, UserCheck, FileText, DollarSign, TrendingUp, Download } from 'lucide-react';
export function AdminDashboard({ onExportData }) {
    const { stats, isLoading, error, refreshStats } = useAdminStats();
    if (isLoading) {
        return (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: Array.from({ length: 4 }).map((_, i) => (_jsxs(Card, { className: "animate-pulse", children: [_jsx(CardHeader, { className: "pb-2", children: _jsx("div", { className: "h-4 bg-gray-200 rounded w-3/4" }) }), _jsx(CardContent, { children: _jsx("div", { className: "h-8 bg-gray-200 rounded w-1/2" }) })] }, i))) }));
    }
    if (error) {
        return (_jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-red-600 mb-4", children: error }), _jsx(Button, { onClick: refreshStats, variant: "outline", children: "Retry" })] }) }) }));
    }
    if (!stats) {
        return null;
    }
    const statCards = [
        {
            title: 'Total Users',
            value: stats.totalUsers.toLocaleString(),
            icon: _jsx(Users, { className: "h-4 w-4" }),
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            title: 'Active Users',
            value: stats.activeUsers.toLocaleString(),
            icon: _jsx(UserCheck, { className: "h-4 w-4" }),
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            title: 'Total Scenarios',
            value: stats.totalScenarios.toLocaleString(),
            icon: _jsx(FileText, { className: "h-4 w-4" }),
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
        },
        {
            title: 'Guest Submissions',
            value: stats.totalGuestSubmissions.toLocaleString(),
            icon: _jsx(UserCheck, { className: "h-4 w-4" }),
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
        },
        {
            title: 'Total Revenue',
            value: formatPrice(stats.totalRevenue),
            icon: _jsx(DollarSign, { className: "h-4 w-4" }),
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            title: 'Avg Scenario Value',
            value: formatPrice(stats.averageScenarioValue),
            icon: _jsx(TrendingUp, { className: "h-4 w-4" }),
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
    ];
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-2xl font-bold", children: "Dashboard" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: refreshStats, variant: "outline", size: "sm", children: "Refresh" }), onExportData && (_jsxs(Button, { onClick: onExportData, variant: "outline", size: "sm", children: [_jsx(Download, { className: "mr-2 h-4 w-4" }), "Export Data"] }))] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: statCards.map((stat, index) => (_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: stat.title }), _jsx("div", { className: `p-2 rounded-full ${stat.bgColor}`, children: _jsx("div", { className: stat.color, children: stat.icon }) })] }), _jsx(CardContent, { children: _jsx("div", { className: "text-2xl font-bold", children: stat.value }) })] }, index))) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "User Activity" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Active Users" }), _jsxs(Badge, { variant: "secondary", children: [((stats.activeUsers / stats.totalUsers) * 100).toFixed(1), "%"] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Guest Conversion" }), _jsxs(Badge, { variant: "secondary", children: [stats.totalGuestSubmissions > 0
                                                            ? ((stats.totalScenarios / stats.totalGuestSubmissions) * 100).toFixed(1)
                                                            : 0, "%"] })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Revenue Insights" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Total Revenue" }), _jsx("span", { className: "font-semibold", children: formatPrice(stats.totalRevenue) })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Avg per Scenario" }), _jsx("span", { className: "font-semibold", children: formatPrice(stats.averageScenarioValue) })] })] }) })] })] })] }));
}
export default AdminDashboard;
