import { generateState, generateCodeVerifier, generateCodeChallenge } from '@auth-mate/core';
import { OAuthProvider } from './base';
import type { User } from '@auth-mate/core';

export class GoogleProvider extends OAuthProvider {
    private readonly AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
    private readonly TOKEN_URL = 'https://oauth2.googleapis.com/token';
    private readonly USER_INFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';

    async getAuthUrl(): Promise<string> {
        const state = generateState('google');
        const codeVerifier = generateCodeVerifier();
        const codeChallenge = await generateCodeChallenge(codeVerifier);

        sessionStorage.setItem('code_verifier', codeVerifier);
        sessionStorage.setItem('auth_state', state);

        const params = new URLSearchParams({
            client_id: this.config.clientId,
            redirect_uri: this.config.redirectUri,
            response_type: 'code',
            scope: this.config.scope || 'openid email profile',
            access_type: 'offline',
            prompt: 'consent',
            state,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256'
        });

        return `${this.AUTH_URL}?${params.toString()}`;
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

        const response = await fetch(this.TOKEN_URL, {
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
            }),
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
        const response = await fetch(this.TOKEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: this.config.clientId,
                grant_type: 'refresh_token',
                refresh_token,
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(`Failed to refresh token: ${error.error_description || error.error || response.statusText}`);
        }

        return response.json();
    }

    async getUserInfo(accessToken: string): Promise<User> {
        const response = await fetch(this.USER_INFO_URL, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(`Failed to fetch user info: ${error.error_description || error.error || response.statusText}`);
        }

        const data = await response.json();

        return {
            id: data.sub,
            email: data.email,
            name: data.name,
            picture: data.picture,
            provider: 'google',
            raw: data
        };
    }
}