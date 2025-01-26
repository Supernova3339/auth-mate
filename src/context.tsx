import { createContext, useContext } from 'react';
import {AuthContextValue} from "./types";

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}