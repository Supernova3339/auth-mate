import { vi } from 'vitest';

// Mock storage implementation
class StorageMock {
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

    get length() {
        return Object.keys(this.store).length;
    }

    key(index: number) {
        return Object.keys(this.store)[index] || null;
    }
}

// Mock window object
const windowMock = {
    crypto: {
        getRandomValues: (array: Uint8Array) => {
            for (let i = 0; i < array.length; i++) {
                array[i] = Math.floor(Math.random() * 256);
            }
            return array;
        },
        subtle: {
            digest: async (algorithm: string, data: Uint8Array) => {
                // Simple mock implementation for SHA-256
                return new Uint8Array(32).fill(1);
            }
        }
    },
    btoa: (str: string) => Buffer.from(str).toString('base64'),
    atob: (str: string) => Buffer.from(str, 'base64').toString(),
    localStorage: new StorageMock(),
    sessionStorage: new StorageMock(),
    location: {
        href: '',
        pathname: '/test'
    }
};

// Setup global mocks
vi.stubGlobal('window', windowMock);
vi.stubGlobal('localStorage', windowMock.localStorage);
vi.stubGlobal('sessionStorage', windowMock.sessionStorage);
vi.stubGlobal('crypto', windowMock.crypto);

// Mock fetch globally
vi.stubGlobal('fetch', vi.fn());