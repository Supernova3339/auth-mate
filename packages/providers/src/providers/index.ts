import { GoogleProvider } from './google';
import { GitHubProvider } from './github';
import { MicrosoftProvider } from './microsoft';
import { CustomProvider } from './custom';
import type { Provider, ProviderBaseConfig, CustomProviderConfig } from '@auth-mate/core';

export function createProvider(type: Provider, config: ProviderBaseConfig | CustomProviderConfig) {
    switch (type) {
        case 'google':
            return new GoogleProvider(type, config as ProviderBaseConfig);
        case 'github':
            return new GitHubProvider(type, config as ProviderBaseConfig);
        case 'microsoft':
            return new MicrosoftProvider(type, config as ProviderBaseConfig);
        default:
            // Assume it's a custom provider if not one of the built-in ones
            if ('authorizationUrl' in config) {
                return new CustomProvider(type, config as CustomProviderConfig);
            }
            throw new Error(`Unsupported provider: ${type}`);
    }
}

export { OAuthProvider } from './base';
export { GoogleProvider } from './google';
export { GitHubProvider } from './github';
export { MicrosoftProvider } from './microsoft';
export { CustomProvider } from './custom';