import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MicrosoftProvider } from '../../providers/microsoft';
import type { ProviderBaseConfig } from '../../types';

describe('MicrosoftProvider', () => {
    let provider: MicrosoftProvider;
    const config: ProviderBaseConfig = {
        clientId: 'ms-client-id',
        redirectUri: 'http://localhost:3000/callback',
        scope: 'openid profile email User.Read'
    };

    beforeEach(() => {
        provider = new MicrosoftProvider(config);
        vi.clearAllMocks();
        window.sessionStorage.clear();
    });

    describe('getAuthUrl', () => {
        it('should generate valid authorization URL', async () => {
            const url = await provider.getAuthUrl();
            const parsedUrl = new URL(url);

            expect(parsedUrl.origin + parsedUrl.pathname).toBe('https://login.microsoftonline.com/common/oauth2/v2.0/authorize');
            expect(parsedUrl.searchParams.get('client_id')).toBe(config.clientId);
            expect(parsedUrl.searchParams.get('redirect_uri')).toBe(config.redirectUri);
            expect(parsedUrl.searchParams.get('scope')).toBe(config.scope);
            expect(parsedUrl.searchParams.get('response_type')).toBe('code');
            expect(parsedUrl.searchParams.get('response_mode')).toBe('query');
            expect(parsedUrl.searchParams.get('state')).toMatch(/^microsoft:/);
            expect(parsedUrl.searchParams.get('code_challenge')).toBeTruthy();
            expect(parsedUrl.searchParams.get('code_challenge_method')).toBe('S256');
        });

        it('should handle custom tenant configuration', async () => {
            const tenantProvider = new MicrosoftProvider({
                ...config,
                domain: 'tenant-id'
            });

            const url = await tenantProvider.getAuthUrl();
            const parsedUrl = new URL(url);

            expect(parsedUrl.pathname).toBe('/tenant-id/oauth2/v2.0/authorize');
        });
    });

    describe('refreshToken', () => {
        it('should refresh token successfully', async () => {
            const mockResponse = {
                access_token: 'new-ms-token',
                refresh_token: 'new-ms-refresh-token',
                expires_in: 3600
            };

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            } as Response);

            const result = await provider.refreshToken('old-refresh-token');

            expect(result).toEqual(mockResponse);

            // Convert URLSearchParams to string to make it easier to test
            const calls = vi.mocked(fetch).mock.calls;
            const lastCall = calls[calls.length - 1];
            const requestInit = lastCall[1] as RequestInit;
            const bodyString = requestInit.body?.toString() || '';

            // Instead of testing the exact encoding, test for the presence of key-value pairs
            expect(bodyString).toContain('refresh_token=old-refresh-token');
            expect(bodyString).toContain('grant_type=refresh_token');
            expect(bodyString).toContain(`client_id=${config.clientId}`);

            // Create URLSearchParams to parse the body string
            const params = new URLSearchParams(bodyString);
            expect(params.get('scope')).toBe(config.scope);
        });

        it('should throw error on failed refresh', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                statusText: 'Bad Request',
                json: () => Promise.resolve({ error: 'invalid_grant' })
            } as Response);

            await expect(provider.refreshToken('invalid-token'))
                .rejects
                .toThrow('Failed to refresh token');
        });
    });

    describe('getUserInfo', () => {
        it('should fetch user info successfully', async () => {
            const mockResponse = {
                id: 'ms-user-id',
                userPrincipalName: 'user@example.com',
                displayName: 'Test User',
                mail: 'user@example.com'
            };

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            } as Response);

            const result = await provider.getUserInfo('test-token');

            expect(result).toEqual({
                id: 'ms-user-id',
                email: 'user@example.com',
                name: 'Test User',
                picture: null,  // Microsoft Graph API requires additional permissions for photo
                provider: 'microsoft',
                raw: mockResponse
            });

            expect(fetch).toHaveBeenCalledWith(
                'https://graph.microsoft.com/v1.0/me',
                expect.objectContaining({
                    headers: {
                        Authorization: 'Bearer test-token',
                        'Content-Type': 'application/json',
                    }
                })
            );
        });

        it('should use userPrincipalName as email if mail is not provided', async () => {
            const mockResponse = {
                id: 'ms-user-id',
                userPrincipalName: 'user@example.com',
                displayName: 'Test User'
            };

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            } as Response);

            const result = await provider.getUserInfo('test-token');

            expect(result.email).toBe('user@example.com');
            expect(result.picture).toBeNull();
        });

        it('should throw error on failed user info fetch', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                statusText: 'Unauthorized',
                json: () => Promise.resolve({ error: { message: 'Invalid token' } })
            } as Response);

            await expect(provider.getUserInfo('test-token'))
                .rejects
                .toThrow('Failed to fetch user info');
        });
    });
});