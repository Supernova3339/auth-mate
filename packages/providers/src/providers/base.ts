import type { Provider, ProviderBaseConfig, User } from '@auth-mate/core';

export abstract class OAuthProvider {
    protected provider: Provider;

    constructor(provider: Provider, protected config: ProviderBaseConfig) {
        this.provider = provider;
    }

    abstract getAuthUrl(): Promise<string>;
    abstract getUserInfo(accessToken: string): Promise<User>;
    abstract handleCallback(code: string): Promise<{
        access_token: string;
        refresh_token?: string;
        expires_in?: number;
    }>;
    abstract refreshToken?(refresh_token: string): Promise<{
        access_token: string;
        refresh_token?: string;
        expires_in?: number;
    }>;
}