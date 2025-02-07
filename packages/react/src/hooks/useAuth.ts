import { useCallback } from 'react';
import { useAuthContext } from '../components/context';
import type { Provider } from '@auth-mate/core';

export function useAuth() {
    const context = useAuthContext();

    const login = useCallback(async (provider: Provider) => {
        await context.login(provider);
    }, [context]);

    const logout = useCallback(async () => {
        await context.logout();
    }, [context]);

    const getToken = useCallback(async () => {
        return context.getToken();
    }, [context]);

    return {
        isAuthenticated: context.isAuthenticated,
        isLoading: context.isLoading,
        user: context.user,
        error: context.error,
        login,
        logout,
        getToken
    };
}
