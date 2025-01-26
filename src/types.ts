export type BuiltInProvider = 'google' | 'github' | 'microsoft';
export type Provider = BuiltInProvider | (string & {});  // Allow string literal types while maintaining type safety

// Base configuration for all providers
export interface ProviderBaseConfig {
    clientId: string;
    redirectUri: string;
    scope?: string;
    domain?: string;
}

// Separate interface for extra parameters
export interface ExtraParamsConfig {
    authorization?: Record<string, string>;
    token?: Record<string, string>;
    refresh?: Record<string, string>;
}

// Remove extraParams from ProviderBaseConfig and create a new interface
export interface StandardProviderConfig extends ProviderBaseConfig {
    extraParams?: Record<string, string>;
}

// Custom provider configuration
export interface CustomProviderConfig extends ProviderBaseConfig {
    authorizationUrl: string;
    tokenUrl: string;
    userInfoUrl: string;
    refreshTokenUrl?: string;
    userInfoMapping: {
        id: string;
        email: string;
        name: string;
        picture?: string;
        [key: string]: string | undefined;
    };
    headers?: {
        authorization?: Record<string, string>;
        token?: Record<string, string>;
        refresh?: Record<string, string>;
        userInfo?: Record<string, string>;
    };
    extraParams?: ExtraParamsConfig;  // Use the new interface
}

// Provider-specific configurations
export interface GoogleConfig extends StandardProviderConfig {
    responseType?: 'code' | 'token';
    accessType?: 'online' | 'offline';
    prompt?: 'none' | 'consent' | 'select_account';
}

export interface GithubConfig extends StandardProviderConfig {
    enterprise?: {
        domain: string;
    };
    allowSignup?: boolean;
}

export interface MicrosoftConfig extends StandardProviderConfig {
    tenant?: string;
    responseMode?: 'query' | 'fragment' | 'form_post';
}

// Storage and common configuration types remain the same
export type StorageType = 'localStorage' | 'sessionStorage' | 'memory';

export interface CommonConfig {
    storage?: {
        type: StorageType;
        prefix?: string;
    };
    autoRefresh?: {
        enabled: boolean;
        timeBuffer?: number;
    };
    navigation?: {
        loginSuccessPath?: string;
        logoutPath?: string;
        preservePath?: boolean;
    };
}

// Main configuration interface
export interface AuthConfig extends CommonConfig {
    providers: {
        google?: GoogleConfig;
        github?: GithubConfig;
        microsoft?: MicrosoftConfig;
        [key: string]: CustomProviderConfig | StandardProviderConfig | undefined;
    };
}

// User interface
export interface User {
    id: string;
    email: string;
    name: string;
    picture?: string | null;  // Allow null
    provider: Provider;
    raw: any;
}

// Auth state interface
export interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    error: Error | null;
}

// Auth context value interface
export interface AuthContextValue extends AuthState {
    login: (provider: Provider) => Promise<void>;
    logout: () => Promise<void>;
    getToken: () => Promise<string | null>;
}