import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext } from './context';
import { StorageManager, type AuthConfig, type AuthState, type Provider } from '@auth-mate/core';
import { createProvider } from '@auth-mate/providers';

const initialState: AuthState = {
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null
};

interface AuthProviderProps {
    children: React.ReactNode;
    config: AuthConfig;
}

export function AuthProvider({ children, config }: AuthProviderProps) {
    const [state, setState] = useState<AuthState>(initialState);
    const storage = useMemo(() => new StorageManager(config.storage || {
        type: 'localStorage',
        prefix: 'auth:'
    }), [config.storage]);

    useEffect(() => {
        const checkAuth = async () => {
            const token = storage.get('token');
            if (!token) {
                setState(prev => ({ ...prev, isLoading: false }));
                return;
            }

            try {
                const provider = storage.get('provider');
                if (!provider) throw new Error('No provider found');

                const oauthProvider = createProvider(provider as Provider, config.providers[provider]!);
                const user = await oauthProvider.getUserInfo(token);

                setState({
                    isAuthenticated: true,
                    isLoading: false,
                    user,
                    error: null
                });
            } catch (error) {
                storage.clear();
                setState({
                    isAuthenticated: false,
                    isLoading: false,
                    user: null,
                    error: error as Error
                });
            }
        };

        checkAuth();
    }, [config.providers, storage]);

    const login = useCallback(async (provider: Provider) => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }));

            const providerConfig = config.providers[provider];
            if (!providerConfig) {
                throw new Error(`Provider ${provider} not configured`);
            }

            const oauthProvider = createProvider(provider, providerConfig);
            const authUrl = await oauthProvider.getAuthUrl();

            storage.set('provider', provider);
            window.location.href = authUrl;
        } catch (error) {
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error as Error
            }));
        }
    }, [config.providers, storage]);

    const logout = useCallback(async () => {
        storage.clear();
        setState({
            ...initialState,
            isLoading: false
        });

        if (config.navigation?.logoutPath) {
            window.location.href = config.navigation.logoutPath;
        }
    }, [config.navigation?.logoutPath, storage]);

    const getToken = useCallback(async () => {
        return storage.get('token');
    }, [storage]);

    const value = useMemo(() => ({
        ...state,
        login,
        logout,
        getToken
    }), [state, login, logout, getToken]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}