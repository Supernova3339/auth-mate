import React, {useCallback, useMemo, useState} from 'react';
import {AuthContext} from './context';
import {createStorage} from './storage';
import {createProvider} from './providers';
import type {AuthConfig, AuthState, Provider} from './types';

const initialState: AuthState = {
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null
};

export function AuthProvider({
                                 children,
                                 config
                             }: {
    children: React.ReactNode;
    config: AuthConfig;
}) {
    const [state, setState] = useState<AuthState>(initialState);
    const storage = useMemo(() => createStorage({
        type: config.storage?.type || 'localStorage',
        prefix: config.storage?.prefix
    }), [config.storage?.type, config.storage?.prefix]);

    const login = useCallback(async (provider: Provider) => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }));

            const providerConfig = config.providers[provider];
            if (!providerConfig) {
                throw new Error(`Provider ${provider} not configured`);
            }

            const oauthProvider = createProvider(provider, providerConfig);
            window.location.href = await oauthProvider.getAuthUrl();
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error as Error
            }));
        }
    }, [config.providers]);

    const logout = useCallback(async () => {
        storage.clear();
        setState({
            ...initialState,
            isLoading: false
        });
    }, [storage]);

    const getToken = useCallback(async () => {
        return storage.get('token');
    }, [storage]);

    // ... rest of the implementation

    const value = useMemo(
        () => ({
            ...state,
            login,
            logout,
            getToken
        }),
        [state, login, logout, getToken]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}