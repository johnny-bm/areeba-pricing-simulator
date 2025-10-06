import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../shared/components/ui/card';
import { Button } from '../../../shared/components/ui/button';
import { Alert, AlertDescription } from '../../../shared/components/ui/alert';
import { AlertTriangle, RefreshCw, LogIn } from 'lucide-react';
export class AuthErrorBoundary extends Component {
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
                });
            }
        });
        Object.defineProperty(this, "handleGoToLogin", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                window.location.href = '/login';
            }
        });
        this.state = {
            hasError: false,
            error: null,
        };
    }
    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error,
        };
    }
    componentDidCatch(error, errorInfo) {
        this.setState({ error });
        // Log auth-specific errors
        console.error('Auth ErrorBoundary caught an error:', error, errorInfo);
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }
    render() {
        if (this.state.hasError) {
            return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-background p-4", children: _jsxs(Card, { className: "w-full max-w-md", children: [_jsxs(CardHeader, { className: "text-center", children: [_jsx("div", { className: "mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100", children: _jsx(AlertTriangle, { className: "h-6 w-6 text-red-600" }) }), _jsx(CardTitle, { className: "text-xl", children: "Authentication Error" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs(Alert, { variant: "destructive", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "There was an error with the authentication system. Please try logging in again." })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { onClick: this.handleRetry, className: "flex-1", children: [_jsx(RefreshCw, { className: "mr-2 h-4 w-4" }), "Try Again"] }), _jsxs(Button, { variant: "outline", onClick: this.handleGoToLogin, className: "flex-1", children: [_jsx(LogIn, { className: "mr-2 h-4 w-4" }), "Go to Login"] })] })] })] }) }));
        }
        return this.props.children;
    }
}
