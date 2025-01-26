export function generateState(provider: string): string {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return `${provider}:${Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('')}`;
}

export function generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return base64URLEncode(array);
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return base64URLEncode(new Uint8Array(digest));
}

export function base64URLEncode(buffer: Uint8Array): string {
    const chars = Array.from(buffer).map(b => String.fromCharCode(b)).join('');
    try {
        const base64 = window.btoa(chars);
        return base64
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    } catch (error) {
        // Fallback for test environment
        const base64 = Buffer.from(buffer).toString('base64');
        return base64
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }
}

export function parseToken(token: string): { exp: number } | null {
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;

        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = window.atob(base64);
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
}