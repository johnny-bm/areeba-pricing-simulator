import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
export class ErrorBoundary extends Component {
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
                    errorInfo: null,
                });
            }
        });
        Object.defineProperty(this, "handleGoHome", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                window.location.href = '/';
            }
        });
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }
    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error,
            errorInfo: null,
        };
    }
    componentDidCatch(error, errorInfo) {
        this.setState({
            error,
            errorInfo,
        });
        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('ErrorBoundary caught an error:', error, errorInfo);
        }
        // Call custom error handler if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
        // Log error to external service in production
        if (process.env.NODE_ENV === 'production') {
            // TODO: Implement error logging service (e.g., Sentry, LogRocket)
            console.error('Production error:', error, errorInfo);
        }
    }
    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }
            // Default error UI
            return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-background p-4", children: _jsxs(Card, { className: "w-full max-w-md", children: [_jsxs(CardHeader, { className: "text-center", children: [_jsx("div", { className: "mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100", children: _jsx(AlertTriangle, { className: "h-6 w-6 text-red-600" }) }), _jsx(CardTitle, { className: "text-xl", children: "Something went wrong" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs(Alert, { variant: "destructive", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "An unexpected error occurred. Please try refreshing the page or contact support if the problem persists." })] }), process.env.NODE_ENV === 'development' && this.state.error && (_jsxs("div", { className: "rounded-md bg-gray-100 p-3", children: [_jsx("h4", { className: "text-sm font-medium text-gray-900 mb-2", children: "Error Details:" }), _jsx("pre", { className: "text-xs text-gray-700 whitespace-pre-wrap", children: this.state.error.toString() }), this.state.errorInfo && (_jsx("pre", { className: "text-xs text-gray-700 whitespace-pre-wrap mt-2", children: this.state.errorInfo.componentStack }))] })), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { onClick: this.handleRetry, className: "flex-1", children: [_jsx(RefreshCw, { className: "mr-2 h-4 w-4" }), "Try Again"] }), _jsxs(Button, { variant: "outline", onClick: this.handleGoHome, className: "flex-1", children: [_jsx(Home, { className: "mr-2 h-4 w-4" }), "Go Home"] })] })] })] }) }));
        }
        return this.props.children;
    }
}
