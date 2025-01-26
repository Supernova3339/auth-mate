import { describe, it, expect, beforeEach } from 'vitest';
import { CustomProvider } from '../../providers/custom';
import type { CustomProviderConfig } from '../../types';

describe('CustomProvider', () => {
    let provider: CustomProvider;
    const config: CustomProviderConfig = {
        clientId: 'test-client-id',
        redirectUri: 'http://localhost:3000/callback',
        authorizationUrl: 'https://auth.example.com/authorize',
        tokenUrl: 'https://auth.example.com/token',
        userInfoUrl: 'https://api.example.com/userinfo',
        userInfoMapping: {
            id: 'user_id',
            email: 'email_address',
            name: 'full_name'
        }
    };

    beforeEach(() => {
        provider = new CustomProvider('custom', config);
    });

    describe('getAuthUrl', () => {
        it('should generate valid authorization URL with custom configuration', async () => {
            const url = await provider.getAuthUrl();
            const parsedUrl = new URL(url);

            expect(parsedUrl.origin + parsedUrl.pathname).toBe(config.authorizationUrl);
            expect(parsedUrl.searchParams.get('client_id')).toBe(config.clientId);
            expect(parsedUrl.searchParams.get('redirect_uri')).toBe(config.redirectUri);
        });

        it('should include custom authorization parameters', async () => {
            const providerWithParams = new CustomProvider('custom', {
                ...config,
                extraParams: {
                    authorization: {
                        audience: 'api://default',
                        resource: 'https://api.example.com'
                    }
                }
            });

            const url = await providerWithParams.getAuthUrl();
            const parsedUrl = new URL(url);

            expect(parsedUrl.searchParams.get('audience')).toBe('api://default');
            expect(parsedUrl.searchParams.get('resource')).toBe('https://api.example.com');
        });
    });

    describe('getUserInfo', () => {
        it('should map user info fields correctly', async () => {
            const mockResponse = {
                user_id: '123',
                email_address: 'test@example.com',
                full_name: 'Test User',
                other_field: 'value'
            };

            (fetch as any).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            const result = await provider.getUserInfo('test-token');

            expect(result).toEqual({
                id: '123',
                email: 'test@example.com',
                name: 'Test User',
                provider: 'custom',
                raw: mockResponse
            });
        });

        it('should handle nested user info mapping', async () => {
            const providerWithNested = new CustomProvider('custom', {
                ...config,
                userInfoMapping: {
                    id: 'data.user.id',
                    email: 'data.user.email',
                    name: 'data.user.name'
                }
            });

            const mockResponse = {
                data: {
                    user: {
                        id: '123',
                        email: 'test@example.com',
                        name: 'Test User'
                    }
                }
            };

            (fetch as any).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            const result = await providerWithNested.getUserInfo('test-token');

            expect(result).toEqual({
                id: '123',
                email: 'test@example.com',
                name: 'Test User',
                provider: 'custom',
                raw: mockResponse
            });
        });

        it('should throw error with proper message on failed request', async () => {
            (fetch as any).mockResolvedValueOnce({
                ok: false,
                statusText: 'Unauthorized',
                json: () => Promise.resolve({ error: 'invalid_token' })
            });

            await expect(provider.getUserInfo('test-token'))
                .rejects
                .toThrow('Failed to fetch user info');
        });
    });
});