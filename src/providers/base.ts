import type { ProviderBaseConfig, User } from '../types';

export abstract class OAuthProvider {
    constructor(protected config: ProviderBaseConfig) {}

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