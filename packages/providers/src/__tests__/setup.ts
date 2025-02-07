import { beforeAll, afterEach, afterAll, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Create a proper storage mock with an internal store
class StorageMock implements Storage {
    private store: Record<string, string> = {};

    clear() {
        this.store = {};
    }

    getItem(key: string) {
        return this.store[key] || null;
    }

    setItem(key: string, value: string) {
        this.store[key] = value;
    }

    removeItem(key: string) {
        delete this.store[key];
    }

    key(index: number) {
        return Object.keys(this.store)[index] || null;
    }

    get length() {
        return Object.keys(this.store).length;
    }
}

// Create storage instances
const sessionStorageMock = new StorageMock();
const localStorageMock = new StorageMock();

// Mock global objects
vi.stubGlobal('sessionStorage', sessionStorageMock);
vi.stubGlobal('localStorage', localStorageMock);
vi.stubGlobal('location', { href: 'http://localhost:3000' });

// Mock crypto using vi.stubGlobal
vi.stubGlobal('crypto', {
    getRandomValues: (array: Uint8Array) => {
        for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }
        return array;
    },
    subtle: {
        digest: async () => {
            return new Uint8Array(32).fill(1);
        }
    }
});

// Mock btoa/atob
vi.stubGlobal('btoa', (str: string) => Buffer.from(str).toString('base64'));
vi.stubGlobal('atob', (str: string) => Buffer.from(str, 'base64').toString());

// Mock server for API calls
export const server = setupServer(
  // Google mocks
  http.post('https://oauth2.googleapis.com/token', () => {
      return HttpResponse.json({
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600
      });
  }),
  http.get('https://www.googleapis.com/oauth2/v3/userinfo', () => {
      return HttpResponse.json({
          sub: 'google-user-id',
          email: 'user@example.com',
          name: 'Test User',
          picture: 'https://example.com/photo.jpg'
      });
  }),

  // GitHub mocks
  http.post('https://github.com/login/oauth/access_token', () => {
      return HttpResponse.json({
          access_token: 'mock-github-token',
          scope: 'read:user,user:email'
      });
  }),
  http.get('https://api.github.com/user', () => {
      return HttpResponse.json({
          id: 123456,
          login: 'testuser',
          name: 'Test User',
          avatar_url: 'https://github.com/avatar.jpg'
      });
  }),
  http.get('https://api.github.com/user/emails', () => {
      return HttpResponse.json([
          { email: 'primary@example.com', primary: true, verified: true },
          { email: 'secondary@example.com', primary: false, verified: true }
      ]);
  }),

  // Microsoft mocks
  http.post('https://login.microsoftonline.com/common/oauth2/v2.0/token', () => {
      return HttpResponse.json({
          access_token: 'mock-ms-token',
          refresh_token: 'mock-ms-refresh-token',
          expires_in: 3600
      });
  }),
  http.get('https://graph.microsoft.com/v1.0/me', () => {
      return HttpResponse.json({
          id: 'ms-user-id',
          displayName: 'Test User',
          mail: 'user@example.com',
          userPrincipalName: 'user@example.com'
      });
  })
);

beforeAll(() => {
    server.listen();
});

afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
    sessionStorageMock.clear();
    localStorageMock.clear();
});

afterAll(() => {
    server.close();
});