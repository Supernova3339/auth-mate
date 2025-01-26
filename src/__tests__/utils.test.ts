import { describe, it, expect } from 'vitest';
import { generateState, generateCodeVerifier, generateCodeChallenge, base64URLEncode, parseToken } from '../utils';

describe('Utils', () => {
    describe('generateState', () => {
        it('should generate a state string with provider prefix', () => {
            const state = generateState('google');
            expect(state).toMatch(/^google:/);
            expect(state.length).toBeGreaterThan('google:'.length);
        });
    });

    describe('PKCE Utils', () => {
        it('should generate valid code verifier', () => {
            const verifier = generateCodeVerifier();
            expect(verifier).toMatch(/^[A-Za-z0-9_-]+$/);
            expect(verifier.length).toBeGreaterThanOrEqual(43);
            expect(verifier.length).toBeLessThanOrEqual(128);
        });

        it('should generate valid code challenge', async () => {
            const verifier = generateCodeVerifier();
            const challenge = await generateCodeChallenge(verifier);
            expect(challenge).toMatch(/^[A-Za-z0-9_-]+$/);
            expect(challenge.length).toBeGreaterThan(0);
        });

        it('should base64URL encode correctly', () => {
            const testData = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
            const encoded = base64URLEncode(testData);
            expect(encoded).not.toContain('+');
            expect(encoded).not.toContain('/');
            expect(encoded).not.toContain('=');
        });
    });

    describe('parseToken', () => {
        it('should parse valid JWT token', () => {
            const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZXhwIjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
            const parsed = parseToken(token);
            expect(parsed).toHaveProperty('exp');
            expect(parsed?.exp).toBe(1516239022);
        });

        it('should return null for invalid token', () => {
            const parsed = parseToken('invalid-token');
            expect(parsed).toBeNull();
        });
    });
});