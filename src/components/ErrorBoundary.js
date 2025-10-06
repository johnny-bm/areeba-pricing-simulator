import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Button } from './ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from "sonner";
export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        Object.defineProperty(this, "handleRetry", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                this.setState({
                    hasError: false,
                    error: null,
                    errorInfo: null
                });
            }
        });
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }
    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error,
            errorInfo: null
        };
    }
    componentDidCatch(error, errorInfo) {
        console.error('🚨 Error Boundary caught an error:', error, errorInfo);
        // Log specific details for JSON parsing errors
        if (error.message && error.message.includes('JSON')) {
            console.error('🚨 JSON parsing error in React component:', {
                error: error.message,
                stack: error.stack,
                componentStack: errorInfo.componentStack
            });
            // Show a toast notification for JSON errors
            toast.error('Data parsing error', {
                description: 'Please refresh the page to resolve this issue.',
                duration: 5000
            });
        }
        this.setState({
            error,
            errorInfo
        });
    }
    render() {
        if (this.state.hasError) {
            const { error } = this.state;
            // Use custom fallback if provided
            if (this.props.fallback) {
                const FallbackComponent = this.props.fallback;
                return _jsx(FallbackComponent, { error: error, retry: this.handleRetry });
            }
            // Default error UI
            const isJsonError = error?.message?.includes('JSON');
            return (_jsx("div", { className: "min-h-screen bg-background p-4 flex items-center justify-center", children: _jsxs("div", { className: "text-center max-w-md", children: [_jsx("div", { className: "w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-destructive/10 rounded-full", children: _jsx(AlertTriangle, { className: "h-8 w-8 text-destructive" }) }), _jsx("h2", { className: "text-xl mb-2", children: isJsonError ? 'Data Format Error' : 'Something went wrong' }), _jsx("p", { className: "text-muted-foreground mb-4", children: isJsonError
                                ? 'There was an issue parsing data from the server. This usually resolves itself with a page refresh.'
                                : 'An unexpected error occurred. Please try refreshing the page.' }), _jsxs("div", { className: "flex gap-2 justify-center mb-4", children: [_jsxs(Button, { onClick: this.handleRetry, variant: "default", children: [_jsx(RefreshCw, { className: "h-4 w-4 mr-2" }), "Try Again"] }), _jsx(Button, { onClick: () => window.location.reload(), variant: "outline", children: "Refresh Page" })] }), process.env.NODE_ENV === 'development' && error && (_jsxs("details", { className: "text-left mt-4 p-4 bg-muted rounded-lg", children: [_jsx("summary", { className: "cursor-pointer text-sm font-medium mb-2", children: "Error Details (Development Only)" }), _jsxs("pre", { className: "text-xs text-muted-foreground whitespace-pre-wrap break-all", children: [error.message, error.stack && `\n\nStack trace:\n${error.stack}`] })] })), isJsonError && (_jsx("div", { className: "mt-4 p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg", children: _jsxs("p", { className: "text-sm text-orange-800 dark:text-orange-200", children: [_jsx("strong", { children: "\uD83D\uDCA1 Tip:" }), " JSON parsing errors are usually temporary server issues. Refreshing the page typically resolves this problem."] }) }))] }) }));
        }
        return this.props.children;
    }
}
// Higher-order component for easier usage
export function withErrorBoundary(Component, fallback) {
    return function WrappedComponent(props) {
        return (_jsx(ErrorBoundary, { fallback: fallback, children: _jsx(Component, { ...props }) }));
    };
}
