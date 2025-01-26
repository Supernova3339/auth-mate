interface StorageOptions {
    type: 'localStorage' | 'sessionStorage' | 'memory';
    prefix?: string;
}

interface CustomStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
    clear(): void;
    key(index: number): string | null;
    length: number;
}

export class StorageManager {
    private storage: CustomStorage;
    private prefix: string;
    public memoryStorage: Map<string, string>; // Changed to public
    private isMemoryStorage: boolean;

    constructor(options: StorageOptions) {
        this.prefix = options.prefix || 'auth:';
        this.memoryStorage = new Map();
        this.isMemoryStorage = options.type === 'memory';

        if (options.type === 'localStorage') {
            this.storage = window.localStorage as CustomStorage;
        } else if (options.type === 'sessionStorage') {
            this.storage = window.sessionStorage as CustomStorage;
        } else {
            // Capture memoryStorage reference for closure
            const memoryStorage = this.memoryStorage;

            // Fixed memory storage implementation
            this.storage = {
                get length() {
                    return memoryStorage.size;
                },
                clear: () => memoryStorage.clear(),
                getItem: (key: string) => memoryStorage.get(key) ?? null,
                key: (index: number) => Array.from(memoryStorage.keys())[index] || null,
                removeItem: (key: string) => memoryStorage.delete(key),
                setItem: (key: string, value: string) => memoryStorage.set(key, value)
            };
        }
    }

    private getKey(key: string): string {
        return `${this.prefix}${key}`;
    }

    get(key: string): string | null {
        const fullKey = this.getKey(key);
        return this.storage.getItem(fullKey);
    }

    set(key: string, value: string): void {
        const fullKey = this.getKey(key);
        this.storage.setItem(fullKey, value);
    }

    remove(key: string): void {
        const fullKey = this.getKey(key);
        this.storage.removeItem(fullKey);
    }

    clear(): void {
        if (this.isMemoryStorage) {
            // For memory storage, remove only items with the prefix
            for (const key of Array.from(this.memoryStorage.keys())) {
                if (key.startsWith(this.prefix)) {
                    this.memoryStorage.delete(key);
                }
            }
        } else {
            // For web storage
            const keysToRemove: string[] = [];
            for (let i = 0; i < this.storage.length; i++) {
                const key = this.storage.key(i);
                if (key && key.startsWith(this.prefix)) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => this.storage.removeItem(key));
        }
    }
}

export const createStorage = (options: StorageOptions) => new StorageManager(options);