import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const auth = useAuth();
    return (_jsx(AuthContext.Provider, { value: auth, children: children }));
}
export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}
