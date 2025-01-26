import { defaultConfig, defaultProviderConfig, providerDefaults } from './defaults';
import { validateConfig } from './validation';
import { StorageManager } from './storage';
import type { AuthConfig } from '../types';

export function createConfig(config: AuthConfig): Required<AuthConfig> {
    // Validate the config
    validateConfig(config);

    // Merge with defaults
    const mergedConfig: Required<AuthConfig> = {
        ...defaultConfig,
        ...config,
        storage: {
            ...defaultConfig.storage,
            ...config.storage
        },
        autoRefresh: {
            ...defaultConfig.autoRefresh,
            ...config.autoRefresh
        },
        navigation: {
            ...defaultConfig.navigation,
            ...config.navigation
        },
        providers: {}
    };

    // Merge provider configs with their defaults
    Object.entries(config.providers).forEach(([name, providerConfig]) => {
        if (!providerConfig) return;

        const baseConfig = {
            ...defaultProviderConfig,
            ...providerConfig
        };

        if (name in providerDefaults) {
            mergedConfig.providers[name] = {
                ...providerDefaults[name as keyof typeof providerDefaults],
                ...baseConfig
            };
        } else {
            mergedConfig.providers[name] = baseConfig;
        }
    });

    return mergedConfig;
}

export { StorageManager };
export type * from '../types';