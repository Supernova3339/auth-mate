import {CommonConfig, ProviderBaseConfig} from "../types";

export const defaultConfig: Required<CommonConfig> = {
    storage: {
        type: 'localStorage',
        prefix: 'auth:'
    },
    autoRefresh: {
        enabled: true,
        timeBuffer: 300 // 5 minutes
    },
    navigation: {
        loginSuccessPath: '/',
        logoutPath: '/',
        preservePath: true
    }
};

export const defaultProviderConfig: Partial<ProviderBaseConfig> = {
    scope: 'openid profile email'
};

export const providerDefaults = {
    google: {
        responseType: 'code',
        accessType: 'offline',
        prompt: 'consent'
    },
    github: {
        allowSignup: true
    },
    microsoft: {
        tenant: 'common',
        responseMode: 'query'
    }
} as const;