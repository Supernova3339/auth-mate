import {AuthConfig, CustomProviderConfig} from "../types";

export class ConfigurationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ConfigurationError';
    }
}

export function validateConfig(config: AuthConfig): asserts config is AuthConfig {
    // Validate common config
    if (config.storage?.type && !['localStorage', 'sessionStorage', 'memory'].includes(config.storage.type)) {
        throw new ConfigurationError(`Invalid storage type: ${config.storage.type}`);
    }

    // Validate providers
    if (!config.providers || Object.keys(config.providers).length === 0) {
        throw new ConfigurationError('At least one provider must be configured');
    }

    // Validate each provider
    Object.entries(config.providers).forEach(([name, providerConfig]) => {
        if (!providerConfig) return;

        if (!providerConfig.clientId) {
            throw new ConfigurationError(`Client ID is required for provider: ${name}`);
        }

        if (!providerConfig.redirectUri) {
            throw new ConfigurationError(`Redirect URI is required for provider: ${name}`);
        }

        // Validate custom provider
        if ('authorizationUrl' in providerConfig) {
            validateCustomProvider(name, providerConfig as CustomProviderConfig);
        }
    });
}

function validateCustomProvider(name: string, config: CustomProviderConfig) {
    if (!config.authorizationUrl) {
        throw new ConfigurationError(`Authorization URL is required for custom provider: ${name}`);
    }

    if (!config.tokenUrl) {
        throw new ConfigurationError(`Token URL is required for custom provider: ${name}`);
    }

    if (!config.userInfoUrl) {
        throw new ConfigurationError(`User info URL is required for custom provider: ${name}`);
    }

    if (!config.userInfoMapping) {
        throw new ConfigurationError(`User info mapping is required for custom provider: ${name}`);
    }

    const requiredMappings = ['id', 'email', 'name'];
    requiredMappings.forEach(field => {
        if (!config.userInfoMapping[field]) {
            throw new ConfigurationError(`User info mapping must include '${field}' for custom provider: ${name}`);
        }
    });
}
