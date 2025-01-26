import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GitHubProvider } from '../../providers/github';
import type { ProviderBaseConfig } from '../../types';

describe('GitHubProvider', () => {
    let provider: GitHubProvider;
    const config: ProviderBaseConfig = {
        clientId: 'github-client-id',
        redirectUri: 'http://localhost:3000/callback',
        scope: 'read:user user:email'
    };

    beforeEach(() => {
        provider = new GitHubProvider(config);
        vi.clearAllMocks();
        window.sessionStorage.clear();
    });

    describe('getAuthUrl', () => {
        it('should generate valid authorization URL', async () => {
            const url = await provider.getAuthUrl();
            const parsedUrl = new URL(url);

            expect(parsedUrl.origin + parsedUrl.pathname).toBe('https://github.com/login/oauth/authorize');
            expect(parsedUrl.searchParams.get('client_id')).toBe(config.clientId);
            expect(parsedUrl.searchParams.get('redirect_uri')).toBe(config.redirectUri);
            expect(parsedUrl.searchParams.get('scope')).toBe(config.scope);
            expect(parsedUrl.searchParams.get('state')).toMatch(/^github:/);
            expect(parsedUrl.searchParams.get('code_challenge')).toBeTruthy();
            expect(parsedUrl.searchParams.get('code_challenge_method')).toBe('S256');
        });

        it('should handle enterprise domain configuration', async () => {
            const enterpriseProvider = new GitHubProvider({
                ...config,
                domain: 'github.enterprise.com'
            });

            const url = await enterpriseProvider.getAuthUrl();
            const parsedUrl = new URL(url);

            expect(parsedUrl.origin).toBe('https://github.enterprise.com');
            expect(parsedUrl.pathname).toBe('/login/oauth/authorize');
        });
    });

    describe('handleCallback', () => {
        it('should exchange code for token successfully', async () => {
            window.sessionStorage.setItem('code_verifier', 'test-verifier');
            window.sessionStorage.setItem('auth_state', 'github:test-state');

            const mockResponse = {
                access_token: 'github-token',
                token_type: 'bearer',
                scope: config.scope
            };

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            } as Response);

            const result = await provider.handleCallback('test-code');

            expect(result).toEqual(mockResponse);
            expect(fetch).toHaveBeenCalledWith(
                'https://github.com/login/oauth/access_token',
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    }
                })
            );
        });

        it('should throw error when code verifier is missing', async () => {
            window.sessionStorage.setItem('auth_state', 'github:test-state');

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
            const mockUserResponse = {
                id: 123456,
                login: 'testuser',
                name: 'Test User',
                avatar_url: 'https://github.com/avatar.jpg'
            };

            const mockEmailsResponse = [
                { email: 'private@example.com', primary: false, verified: true },
                { email: 'public@example.com', primary: true, verified: true }
            ];

            vi.mocked(fetch)
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve(mockUserResponse)
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve(mockEmailsResponse)
                } as Response);

            const result = await provider.getUserInfo('test-token');

            expect(result).toEqual({
                id: '123456',
                email: 'public@example.com',
                name: 'Test User',
                picture: 'https://github.com/avatar.jpg',
                provider: 'github',
                raw: mockUserResponse
            });

            expect(fetch).toHaveBeenCalledWith(
                'https://api.github.com/user',
                expect.objectContaining({
                    headers: {
                        Authorization: 'Bearer test-token',
                        Accept: 'application/vnd.github.v3+json'
                    }
                })
            );

            expect(fetch).toHaveBeenCalledWith(
                'https://api.github.com/user/emails',
                expect.objectContaining({
                    headers: {
                        Authorization: 'Bearer test-token',
                        Accept: 'application/vnd.github.v3+json'
                    }
                })
            );
        });

        it('should use login as name if name is not provided', async () => {
            const mockUserResponse = {
                id: 123456,
                login: 'testuser',
                avatar_url: 'https://github.com/avatar.jpg'
            };

            const mockEmailsResponse = [
                { email: 'test@example.com', primary: true, verified: true }
            ];

            vi.mocked(fetch)
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve(mockUserResponse)
                } as Response)
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve(mockEmailsResponse)
                } as Response);

            const result = await provider.getUserInfo('test-token');

            expect(result.name).toBe('testuser');
        });

        it('should throw error on failed user info fetch', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                statusText: 'Unauthorized',
                json: () => Promise.resolve({ message: 'Bad credentials' })
            } as Response);

            await expect(provider.getUserInfo('test-token'))
                .rejects
                .toThrow('Failed to fetch user info');
        });
    });
});