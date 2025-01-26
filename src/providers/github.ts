import { OAuthProvider } from './base';
import type {ProviderBaseConfig, User} from '../types';
import { generateState, generateCodeVerifier, generateCodeChallenge } from '../utils';

export class GitHubProvider extends OAuthProvider {
    private readonly baseUrl: string;
    private readonly apiUrl: string;

    constructor(config: ProviderBaseConfig) {
        super(config);
        // Handle enterprise domains
        if (config.domain) {
            this.baseUrl = `https://${config.domain}`;
            this.apiUrl = `https://${config.domain}/api/v3`;
        } else {
            this.baseUrl = 'https://github.com';
            this.apiUrl = 'https://api.github.com';
        }
    }

    private get authUrl() {
        return `${this.baseUrl}/login/oauth/authorize`;
    }

    private get tokenUrl() {
        return `${this.baseUrl}/login/oauth/access_token`;
    }

    private get userUrl() {
        return `${this.apiUrl}/user`;
    }

    async getAuthUrl(): Promise<string> {
        const state = generateState('github');
        const codeVerifier = generateCodeVerifier();
        const codeChallenge = await generateCodeChallenge(codeVerifier);

        sessionStorage.setItem('code_verifier', codeVerifier);
        sessionStorage.setItem('auth_state', state);

        const params = new URLSearchParams({
            client_id: this.config.clientId,
            redirect_uri: this.config.redirectUri,
            scope: this.config.scope || 'read:user user:email',
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
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: this.config.clientId,
                redirect_uri: this.config.redirectUri,
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

    async refreshToken(refresh_token: string): Promise<{
        access_token: string;
        refresh_token?: string;
        expires_in?: number;
    }> {
        throw new Error('GitHub does not support token refresh. Use a new authorization flow to get a new token.');
    }

    async getUserInfo(accessToken: string): Promise<User> {
        const [userResponse, emailsResponse] = await Promise.all([
            fetch(this.userUrl, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/vnd.github.v3+json',
                },
            }),
            fetch(`${this.userUrl}/emails`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/vnd.github.v3+json',
                },
            }),
        ]);

        if (!userResponse.ok || !emailsResponse.ok) {
            const error = await userResponse.json().catch(() => ({}));
            throw new Error(`Failed to fetch user info: ${error.error_description || error.error || userResponse.statusText}`);
        }

        const userData = await userResponse.json();
        const emailsData = await emailsResponse.json();
        const primaryEmail = emailsData.find((email: any) => email.primary)?.email;

        return {
            id: String(userData.id),
            email: primaryEmail || userData.email,
            name: userData.name || userData.login,
            picture: userData.avatar_url,
            provider: 'github' as const,
            raw: userData
        };
    }
}