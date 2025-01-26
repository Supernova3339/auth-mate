import { GoogleProvider } from './google';
import { GitHubProvider } from './github';
import { MicrosoftProvider } from './microsoft';
import { CustomProvider } from './custom';
import type { Provider, ProviderBaseConfig, CustomProviderConfig } from '../types';

export function createProvider(type: Provider, config: ProviderBaseConfig | CustomProviderConfig) {
    switch (type) {
        case 'google':
            return new GoogleProvider(config as ProviderBaseConfig);
        case 'github':
            return new GitHubProvider(config as ProviderBaseConfig);
        case 'microsoft':
            return new MicrosoftProvider(config as ProviderBaseConfig);
        default:
            // Assume it's a custom provider if not one of the built-in ones
            if ('authorizationUrl' in config) {
                return new CustomProvider(type, config as CustomProviderConfig);
            }
            throw new Error(`Unsupported provider: ${type}`);
    }
}