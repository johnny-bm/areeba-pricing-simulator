import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * ConnectionDiagnostics - Component to help debug connection issues
 */
import { useState } from 'react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, XCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../utils/api';
// Get projectId and API key from environment variables
const projectId = import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0];
const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export function ConnectionDiagnostics() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [results, setResults] = useState(null);
    const runDiagnostics = async () => {
        setIsChecking(true);
        const diagnosticResults = {
            timestamp: new Date().toISOString(),
            projectId: projectId,
            hasApiKey: !!publicAnonKey,
            checks: []
        };
        try {
            // Check 1: Basic connectivity
            diagnosticResults.checks.push({
                name: 'Basic Connectivity',
                status: 'checking',
                message: 'Testing network connection...'
            });
            // Check 2: Health endpoint
            try {
                const healthOk = await api.healthCheck();
                diagnosticResults.checks.push({
                    name: 'Backend Health',
                    status: healthOk ? 'success' : 'failed',
                    message: healthOk ? 'Backend is responding' : 'Backend is not responding'
                });
            }
            catch (error) {
                diagnosticResults.checks.push({
                    name: 'Backend Health',
                    status: 'failed',
                    message: `Error: ${error.message}`
                });
            }
            // Check 3: Ping endpoint
            try {
                const pingOk = await api.ping();
                diagnosticResults.checks.push({
                    name: 'Ping Test',
                    status: pingOk ? 'success' : 'failed',
                    message: pingOk ? 'Ping successful' : 'Ping failed'
                });
            }
            catch (error) {
                diagnosticResults.checks.push({
                    name: 'Ping Test',
                    status: 'failed',
                    message: `Error: ${error.message}`
                });
            }
            // Check 4: Try loading categories (lightweight)
            try {
                await api.loadCategories();
                diagnosticResults.checks.push({
                    name: 'Data Loading',
                    status: 'success',
                    message: 'Successfully loaded data from backend'
                });
            }
            catch (error) {
                diagnosticResults.checks.push({
                    name: 'Data Loading',
                    status: 'failed',
                    message: `Error: ${error.message}`
                });
            }
        }
        catch (error) {
            diagnosticResults.error = error.message;
        }
        setResults(diagnosticResults);
        setIsChecking(false);
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'success':
                return _jsx(CheckCircle, { className: "h-4 w-4 text-green-600" });
            case 'failed':
                return _jsx(XCircle, { className: "h-4 w-4 text-red-600" });
            case 'checking':
                return _jsx(Loader2, { className: "h-4 w-4 text-blue-600 animate-spin" });
            default:
                return null;
        }
    };
    return (_jsx("div", { className: "fixed bottom-4 right-4 z-50", children: _jsxs("div", { className: "bg-card border rounded-lg shadow-lg max-w-md", children: [_jsxs("button", { onClick: () => setIsExpanded(!isExpanded), className: "w-full p-3 flex items-center justify-between hover:bg-accent rounded-lg transition-colors", children: [_jsx("span", { className: "text-sm font-medium", children: "Connection Diagnostics" }), isExpanded ? (_jsx(ChevronDown, { className: "h-4 w-4" })) : (_jsx(ChevronUp, { className: "h-4 w-4" }))] }), isExpanded && (_jsxs("div", { className: "p-4 border-t space-y-3", children: [_jsxs("div", { className: "text-xs text-muted-foreground space-y-1", children: [_jsxs("p", { children: [_jsx("strong", { children: "Project ID:" }), ' ', _jsx("code", { className: "bg-muted px-1 py-0.5 rounded", children: projectId })] }), _jsxs("p", { children: [_jsx("strong", { children: "API Key:" }), ' ', publicAnonKey ? (_jsx("span", { className: "text-green-600", children: "\u2713 Configured" })) : (_jsx("span", { className: "text-red-600", children: "\u2717 Missing" }))] })] }), _jsx(Button, { onClick: runDiagnostics, disabled: isChecking, size: "sm", className: "w-full", children: isChecking ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-3 w-3 mr-2 animate-spin" }), "Running Tests..."] })) : ('Run Connection Tests') }), results && (_jsxs("div", { className: "space-y-2 text-xs", children: [_jsxs("div", { className: "text-muted-foreground", children: [_jsx("strong", { children: "Test Results:" }), " ", new Date(results.timestamp).toLocaleTimeString()] }), results.checks.map((check, index) => (_jsxs("div", { className: "flex items-start gap-2 p-2 bg-muted rounded", children: [getStatusIcon(check.status), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "font-medium", children: check.name }), _jsx("div", { className: "text-muted-foreground", children: check.message })] })] }, index))), results.error && (_jsx(Alert, { variant: "destructive", className: "text-xs", children: _jsx(AlertDescription, { children: results.error }) }))] }))] }))] }) }));
}
