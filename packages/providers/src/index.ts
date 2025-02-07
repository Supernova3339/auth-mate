import { GoogleProvider } from './providers/google';
import { GitHubProvider } from './providers/github';
import { MicrosoftProvider } from './providers/microsoft';
import { CustomProvider } from './providers/custom';
import type {
  Provider,
  ProviderBaseConfig,
  CustomProviderConfig
} from '@auth-mate/core';

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

// Export provider classes
export { GoogleProvider } from './providers/google';
export { GitHubProvider } from './providers/github';
export { MicrosoftProvider } from './providers/microsoft';
export { CustomProvider } from './providers/custom';
export type { OAuthProvider } from './providers/base';

// Re-export types from core that are relevant to providers
export type {
  Provider,
  ProviderBaseConfig,
  CustomProviderConfig,
  GoogleConfig,
  GithubConfig,
  MicrosoftConfig,
  ExtraParamsConfig,
  User
} from '@auth-mate/core';