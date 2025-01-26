import { OAuthProvider } from './base';
import type { CustomProviderConfig, User, Provider } from '../types';
import { generateState, generateCodeVerifier, generateCodeChallenge } from '../utils';

export class CustomProvider extends OAuthProvider {
    constructor(
        private providerName: Provider,
        private customConfig: CustomProviderConfig
    ) {
        super(customConfig);
    }

    async getAuthUrl(): Promise<string> {
        const state = generateState(this.providerName);
        const codeVerifier = generateCodeVerifier();
        const codeChallenge = await generateCodeChallenge(codeVerifier);

        sessionStorage.setItem('code_verifier', codeVerifier);
        sessionStorage.setItem('auth_state', state);

        const params = new URLSearchParams({
            client_id: this.config.clientId,
            redirect_uri: this.config.redirectUri,
            response_type: 'code',
            scope: this.customConfig.scope || '',
            state,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
            ...(this.customConfig.extraParams?.authorization || {})
        });

        return `${this.customConfig.authorizationUrl}?${params.toString()}`;
    }

    async handleCallback(code: string) {
        const codeVerifier = sessionStorage.getItem('code_verifier');
        const storedState = sessionStorage.getItem('auth_state');

        if (!codeVerifier) {
            throw new Error('No code verifier found - PKCE verification failed');
        }

        if (!storedState) {
            throw new Error('No state found - potential CSRF attack');
        }

        const response = await fetch(this.customConfig.tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                ...this.customConfig.headers?.token
            },
            body: new URLSearchParams({
                client_id: this.config.clientId,
                redirect_uri: this.config.redirectUri,
                grant_type: 'authorization_code',
                code,
                code_verifier: codeVerifier,
                ...(this.customConfig.extraParams?.token || {})
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(`Failed to exchange code for token: ${error.error_description || error.error || response.statusText}`);
        }

        sessionStorage.removeItem('code_verifier');
        sessionStorage.removeItem('auth_state');

        return response.json();
    }

    async refreshToken(refresh_token: string) {
        if (!this.customConfig.refreshTokenUrl) {
            throw new Error('Refresh token URL not configured for this provider');
        }

        const response = await fetch(this.customConfig.refreshTokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                ...this.customConfig.headers?.refresh
            },
            body: new URLSearchParams({
                client_id: this.config.clientId,
                grant_type: 'refresh_token',
                refresh_token,
                ...(this.customConfig.extraParams?.refresh || {})
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(`Failed to refresh token: ${error.error_description || error.error || response.statusText}`);
        }

        return response.json();
    }

    async getUserInfo(accessToken: string): Promise<User> {
        const response = await fetch(this.customConfig.userInfoUrl, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                ...this.customConfig.headers?.userInfo
            }
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(`Failed to fetch user info: ${error.error_description || error.error || response.statusText}`);
        }

        const data = await response.json();

        return {
            id: this.getNestedValue(data, this.customConfig.userInfoMapping.id),
            email: this.getNestedValue(data, this.customConfig.userInfoMapping.email),
            name: this.getNestedValue(data, this.customConfig.userInfoMapping.name),
            picture: this.customConfig.userInfoMapping.picture
                ? this.getNestedValue(data, this.customConfig.userInfoMapping.picture)
                : undefined,
            provider: this.providerName,
            raw: data
        };
    }

    private getNestedValue(obj: any, path: string): string {
        return path.split('.').reduce((acc, part) => acc?.[part], obj) as string;
    }
}