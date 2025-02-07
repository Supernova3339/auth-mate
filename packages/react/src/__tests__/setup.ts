import '@testing-library/jest-dom';
import { afterEach, beforeAll, vi } from 'vitest';

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

beforeAll(() => {
    // Create separate instances for localStorage and sessionStorage
    const localStorageMock = new StorageMock();
    const sessionStorageMock = new StorageMock();

    // Mock storage using vi.stubGlobal
    vi.stubGlobal('localStorage', localStorageMock);
    vi.stubGlobal('sessionStorage', sessionStorageMock);

    // Also mock window.crypto if needed by your tests
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
});

afterEach(() => {
    // Clear storage after each test
    localStorage.clear();
    sessionStorage.clear();

    // Clear mocks
    vi.clearAllMocks();
});