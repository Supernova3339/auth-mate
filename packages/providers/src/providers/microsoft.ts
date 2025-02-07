import { OAuthProvider } from './base';
import { generateState, generateCodeVerifier, generateCodeChallenge } from '@auth-mate/core';
import type { ProviderBaseConfig, User } from '@auth-mate/core';

export class MicrosoftProvider extends OAuthProvider {
    private readonly tenant: string;

    constructor(provider: string, config: ProviderBaseConfig) {
        super(provider, config);
        this.tenant = config.domain || 'common';
    }

    private get baseUrl() {
        return `https://login.microsoftonline.com/${this.tenant}`;
    }

    private get authUrl() {
        return `${this.baseUrl}/oauth2/v2.0/authorize`;
    }

    private get tokenUrl() {
        return `${this.baseUrl}/oauth2/v2.0/token`;
    }

    async getAuthUrl(): Promise<string> {
        const state = generateState('microsoft');
        const codeVerifier = generateCodeVerifier();
        const codeChallenge = await generateCodeChallenge(codeVerifier);

        sessionStorage.setItem('code_verifier', codeVerifier);
        sessionStorage.setItem('auth_state', state);

        const params = new URLSearchParams({
            client_id: this.config.clientId,
            redirect_uri: this.config.redirectUri,
            response_type: 'code',
            response_mode: 'query',
            scope: this.config.scope || 'openid profile email User.Read',
            state,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256'
        });

        return `${this.authUrl}?${params.toString()}`;
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

        const response = await fetch(this.tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: this.config.clientId,
                redirect_uri: this.config.redirectUri,
                grant_type: 'authorization_code',
                code,
                code_verifier: codeVerifier,
                scope: this.config.scope || 'openid profile email User.Read'
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
        const response = await fetch(this.tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: this.config.clientId,
                grant_type: 'refresh_token',
                refresh_token,
                scope: this.config.scope || 'openid profile email User.Read'
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(`Failed to refresh token: ${error.error_description || error.error || response.statusText}`);
        }

        return response.json();
    }

    async getUserInfo(accessToken: string): Promise<User> {
        const response = await fetch('https://graph.microsoft.com/v1.0/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(`Failed to fetch user info: ${error.error_description || error.error || response.statusText}`);
        }

        const data = await response.json();

        return {
            id: data.id,
            email: data.mail || data.userPrincipalName,
            name: data.displayName,
            picture: null, // Microsoft Graph API requires additional permissions for photo
            provider: 'microsoft',
            raw: data
        };
    }
}