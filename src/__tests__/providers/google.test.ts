import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GoogleProvider } from '../../providers/google';
import type { ProviderBaseConfig } from '../../types';

describe('GoogleProvider', () => {
    let provider: GoogleProvider;
    const config: ProviderBaseConfig = {
        clientId: 'test-client-id',
        redirectUri: 'http://localhost:3000/callback',
        scope: 'openid profile email'
    };

    beforeEach(() => {
        provider = new GoogleProvider(config);
        vi.clearAllMocks();
        window.sessionStorage.clear();
    });

    describe('getAuthUrl', () => {
        it('should generate valid authorization URL', async () => {
            const url = await provider.getAuthUrl();
            const parsedUrl = new URL(url);

            expect(parsedUrl.origin).toBe('https://accounts.google.com');
            expect(parsedUrl.pathname).toBe('/o/oauth2/v2/auth');
            expect(parsedUrl.searchParams.get('client_id')).toBe(config.clientId);
            expect(parsedUrl.searchParams.get('redirect_uri')).toBe(config.redirectUri);
            expect(parsedUrl.searchParams.get('scope')).toBe(config.scope);
            expect(parsedUrl.searchParams.get('response_type')).toBe('code');
            expect(parsedUrl.searchParams.get('code_challenge')).toBeTruthy();
            expect(parsedUrl.searchParams.get('code_challenge_method')).toBe('S256');
        });
    });

    describe('handleCallback', () => {
        it('should exchange code for token successfully', async () => {
            // Mock both code verifier and state
            window.sessionStorage.setItem('code_verifier', 'test-verifier');
            window.sessionStorage.setItem('auth_state', 'google:test-state');

            const mockResponse = {
                access_token: 'test-token',
                refresh_token: 'refresh-token',
                expires_in: 3600
            };

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            } as Response);

            const result = await provider.handleCallback('test-code');

            expect(result).toEqual(mockResponse);
            expect(fetch).toHaveBeenCalledWith(
                'https://oauth2.googleapis.com/token',
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    }
                })
            );
        });

        it('should throw error when code verifier is missing', async () => {
            window.sessionStorage.setItem('auth_state', 'google:test-state');

            await expect(provider.handleCallback('test-code'))
                .rejects
                .toThrow('No code verifier found');
        });

        it('should throw error when state is missing', async () => {
            window.sessionStorage.setItem('code_verifier', 'test-verifier');

            await expect(provider.handleCallback('test-code'))
                .rejects
                .toThrow('No state found');
        });
    });

    describe('getUserInfo', () => {
        it('should fetch user info successfully', async () => {
            const mockUser = {
                sub: 'user-id',
                email: 'test@example.com',
                name: 'Test User',
                picture: 'https://example.com/photo.jpg'
            };

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockUser)
            } as Response);

            const result = await provider.getUserInfo('test-token');

            expect(result).toEqual({
                id: mockUser.sub,
                email: mockUser.email,
                name: mockUser.name,
                picture: mockUser.picture,
                provider: 'google',
                raw: mockUser
            });

            expect(fetch).toHaveBeenCalledWith(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                expect.objectContaining({
                    headers: {
                        Authorization: 'Bearer test-token'
                    }
                })
            );
        });

        it('should throw error on failed user info fetch', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                statusText: 'Unauthorized',
                json: () => Promise.resolve({ error: 'invalid_token' })
            } as Response);

            await expect(provider.getUserInfo('test-token'))
                .rejects
                .toThrow('Failed to fetch user info');
        });
    });
});