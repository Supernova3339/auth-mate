import { describe, it, expect, beforeEach } from 'vitest';
import { MicrosoftProvider } from '../../providers/microsoft';

describe('MicrosoftProvider', () => {
    let provider: MicrosoftProvider;
    const config = {
        clientId: 'test-client-id',
        redirectUri: 'http://localhost:3000/callback',
        scope: 'openid profile email User.Read'
    };

    beforeEach(() => {
        provider = new MicrosoftProvider('microsoft', config);
        sessionStorage.clear();
    });

    describe('getAuthUrl', () => {
        it('generates valid authorization URL', async () => {
            const url = await provider.getAuthUrl();
            const parsedUrl = new URL(url);

            expect(parsedUrl.origin).toBe('https://login.microsoftonline.com');
            expect(parsedUrl.pathname).toBe('/common/oauth2/v2.0/authorize');
            expect(parsedUrl.searchParams.get('client_id')).toBe(config.clientId);
            expect(parsedUrl.searchParams.get('redirect_uri')).toBe(config.redirectUri);
            expect(parsedUrl.searchParams.get('scope')).toBe(config.scope);
            expect(parsedUrl.searchParams.get('response_mode')).toBe('query');
        });
    });

    describe('getUserInfo', () => {
        it('fetches user info successfully', async () => {
            const result = await provider.getUserInfo('test-token');

            expect(result).toEqual({
                id: 'ms-user-id',
                email: 'user@example.com',
                name: 'Test User',
                picture: null,
                provider: 'microsoft',
                raw: expect.any(Object)
            });
        });
    });
});