import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { lazy, Suspense } from 'react';
import { Card, CardContent } from '../../../shared/components/ui/card';
import { Loader2 } from 'lucide-react';
const AdminDashboard = lazy(() => import('./AdminDashboard'));
export function AdminDashboardLazy({ onExportData }) {
    return (_jsx(Suspense, { fallback: _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-center", children: [_jsx(Loader2, { className: "h-6 w-6 animate-spin mr-2" }), _jsx("span", { children: "Loading dashboard..." })] }) }) }), children: _jsx(AdminDashboard, { onExportData: onExportData }) }));
}
