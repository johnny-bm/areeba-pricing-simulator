import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from '../shared/components/ui/sonner';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { AppRouter } from './router';
import { AppProviders } from './providers';
function App() {
    return (_jsx(ErrorBoundary, { children: _jsx(BrowserRouter, { children: _jsxs(AppProviders, { children: [_jsx(AppRouter, {}), _jsx(Toaster, {})] }) }) }));
}
export default App;
