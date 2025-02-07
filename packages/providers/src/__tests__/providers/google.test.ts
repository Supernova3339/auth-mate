import { describe, it, expect, beforeEach } from 'vitest';
import { GoogleProvider } from '../../providers/google';

describe('GoogleProvider', () => {
    let provider: GoogleProvider;
    const config = {
        clientId: 'test-client-id',
        redirectUri: 'http://localhost:3000/callback',
        scope: 'openid profile email'
    };

    beforeEach(() => {
        provider = new GoogleProvider('google', config);
        sessionStorage.clear();
    });

    describe('getAuthUrl', () => {
        it('generates valid authorization URL', async () => {
            const url = await provider.getAuthUrl();
            const parsedUrl = new URL(url);

            expect(parsedUrl.origin).toBe('https://accounts.google.com');
            expect(parsedUrl.pathname).toBe('/o/oauth2/v2/auth');
            expect(parsedUrl.searchParams.get('client_id')).toBe(config.clientId);
            expect(parsedUrl.searchParams.get('redirect_uri')).toBe(config.redirectUri);
            expect(parsedUrl.searchParams.get('scope')).toBe(config.scope);
            expect(parsedUrl.searchParams.get('response_type')).toBe('code');
            expect(parsedUrl.searchParams.get('state')).toMatch(/^google:/);
            expect(parsedUrl.searchParams.get('code_challenge')).toBeTruthy();
            expect(parsedUrl.searchParams.get('code_challenge_method')).toBe('S256');

            // Store values generated during getAuthUrl for handleCallback test
            const codeVerifier = sessionStorage.getItem('code_verifier');
            const authState = sessionStorage.getItem('auth_state');
            expect(codeVerifier).toBeTruthy();
            expect(authState).toBeTruthy();
        });
    });

    describe('handleCallback', () => {
        it('exchanges code for token successfully', async () => {
            // First get the auth URL to generate and store the code verifier
            await provider.getAuthUrl();

            const result = await provider.handleCallback('test-code');

            expect(result).toEqual({
                access_token: 'mock-access-token',
                refresh_token: 'mock-refresh-token',
                expires_in: 3600
            });
        });

        it('throws error when code verifier is missing', async () => {
            await expect(provider.handleCallback('test-code'))
              .rejects
              .toThrow('No code verifier found');
        });
    });

    describe('getUserInfo', () => {
        it('fetches user info successfully', async () => {
            const result = await provider.getUserInfo('test-token');

            expect(result).toEqual({
                id: 'google-user-id',
                email: 'user@example.com',
                name: 'Test User',
                picture: 'https://example.com/photo.jpg',
                provider: 'google',
                raw: expect.any(Object)
            });
        });
    });
});