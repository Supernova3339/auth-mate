import { describe, it, expect, beforeEach } from 'vitest';
import { CustomProvider } from '../../providers/custom';
import { server } from '../setup';
import { http, HttpResponse } from 'msw';

describe('CustomProvider', () => {
    const config = {
        clientId: 'test-client-id',
        redirectUri: 'http://localhost:3000/callback',
        authorizationUrl: 'https://auth.custom.com/authorize',
        tokenUrl: 'https://auth.custom.com/token',
        userInfoUrl: 'https://api.custom.com/userinfo',
        userInfoMapping: {
            id: 'sub',
            email: 'email',
            name: 'name',
            picture: 'picture'
        }
    };

    let provider: CustomProvider;

    beforeEach(() => {
        provider = new CustomProvider('custom', config);
        sessionStorage.clear();

        // Add custom provider mocks
        server.use(
            http.post('https://auth.custom.com/token', () => {
                return HttpResponse.json({
                    access_token: 'mock-custom-token',
                    expires_in: 3600
                });
            }),
            http.get('https://api.custom.com/userinfo', () => {
                return HttpResponse.json({
                    sub: 'custom-user-id',
                    email: 'user@custom.com',
                    name: 'Custom User',
                    picture: 'https://custom.com/photo.jpg'
                });
            })
        );
    });

    describe('getAuthUrl', () => {
        it('generates valid authorization URL with custom configuration', async () => {
            const url = await provider.getAuthUrl();
            const parsedUrl = new URL(url);

            expect(parsedUrl.origin + parsedUrl.pathname).toBe(config.authorizationUrl);
            expect(parsedUrl.searchParams.get('client_id')).toBe(config.clientId);
            expect(parsedUrl.searchParams.get('redirect_uri')).toBe(config.redirectUri);
        });
    });

    describe('getUserInfo', () => {
        it('maps user info fields correctly', async () => {
            const result = await provider.getUserInfo('test-token');

            expect(result).toEqual({
                id: 'custom-user-id',
                email: 'user@custom.com',
                name: 'Custom User',
                picture: 'https://custom.com/photo.jpg',
                provider: 'custom',
                raw: expect.any(Object)
            });
        });
    });
});
