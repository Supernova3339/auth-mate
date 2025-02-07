import { beforeAll, afterEach, vi } from 'vitest';

// Mock Storage implementation
class StorageMock implements Storage {
    private store: Record<string, string> = {};

    get length(): number {
        return Object.keys(this.store).length;
    }

    clear(): void {
        this.store = {};
    }

    getItem(key: string): string | null {
        return this.store[key] || null;
    }

    setItem(key: string, value: string): void {
        this.store[key] = value;
    }

    removeItem(key: string): void {
        delete this.store[key];
    }

    key(index: number): string | null {
        return Object.keys(this.store)[index] || null;
    }
}

// Create mock instances
const localStorageMock = new StorageMock();
const sessionStorageMock = new StorageMock();

beforeAll(() => {
    // Use vi.stubGlobal for mocking
    vi.stubGlobal('localStorage', localStorageMock);
    vi.stubGlobal('sessionStorage', sessionStorageMock);

    // Mock crypto API
    vi.stubGlobal('crypto', {
        getRandomValues: (array: Uint8Array) => {
            for (let i = 0; i < array.length; i++) {
                array[i] = Math.floor(Math.random() * 256);
            }
            return array;
        },
        subtle: {
            // Ignore unused parameters with an underscore prefix
            digest: async (_algorithm: string, _data: Uint8Array) => {
                return new Uint8Array(32).fill(1);
            }
        }
    } as unknown as Crypto);

    // Mock btoa/atob
    vi.stubGlobal('btoa', (str: string) => Buffer.from(str).toString('base64'));
    vi.stubGlobal('atob', (str: string) => Buffer.from(str, 'base64').toString());
});

afterEach(() => {
    // Clear storage after each test
    localStorageMock.clear();
    sessionStorageMock.clear();
    vi.clearAllMocks();
});