import {CustomProviderConfig, GithubConfig, GoogleConfig, MicrosoftConfig, StandardProviderConfig} from "./providers";

export type StorageType = 'localStorage' | 'sessionStorage' | 'memory';

export interface StorageConfig {
    type: StorageType;
    prefix?: string;
}

export interface AutoRefreshConfig {
    enabled: boolean;
    timeBuffer?: number; // seconds before expiry to refresh
}

export interface NavigationConfig {
    loginSuccessPath?: string;
    logoutPath?: string;
    preservePath?: boolean;
}

export interface CommonConfig {
    storage?: StorageConfig;
    autoRefresh?: AutoRefreshConfig;
    navigation?: NavigationConfig;
}

export interface AuthConfig extends CommonConfig {
    providers: {
        google?: GoogleConfig;
        github?: GithubConfig;
        microsoft?: MicrosoftConfig;
        [key: string]: CustomProviderConfig | StandardProviderConfig | undefined;
    };
}