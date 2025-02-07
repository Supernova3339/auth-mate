import { describe, it, expect, beforeEach } from 'vitest';
import { GitHubProvider } from '../../providers/github';

describe('GitHubProvider', () => {
    let provider: GitHubProvider;
    const config = {
        clientId: 'test-client-id',
        redirectUri: 'http://localhost:3000/callback',
        scope: 'read:user user:email'
    };

    beforeEach(() => {
        provider = new GitHubProvider('github', config);
        sessionStorage.clear();
    });

    describe('getAuthUrl', () => {
        it('generates valid authorization URL', async () => {
            const url = await provider.getAuthUrl();
            const parsedUrl = new URL(url);

            expect(parsedUrl.origin).toBe('https://github.com');
            expect(parsedUrl.pathname).toBe('/login/oauth/authorize');
            expect(parsedUrl.searchParams.get('client_id')).toBe(config.clientId);
            expect(parsedUrl.searchParams.get('redirect_uri')).toBe(config.redirectUri);
            expect(parsedUrl.searchParams.get('scope')).toBe(config.scope);
            expect(parsedUrl.searchParams.get('state')).toMatch(/^github:/);
        });
    });

    describe('getUserInfo', () => {
        it('fetches and combines user info successfully', async () => {
            const result = await provider.getUserInfo('test-token');

            expect(result).toEqual({
                id: '123456',
                email: 'primary@example.com',
                name: 'Test User',
                picture: 'https://github.com/avatar.jpg',
                provider: 'github',
                raw: expect.any(Object)
            });
        });
    });
});