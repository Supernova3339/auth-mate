import type { StorageConfig } from '../types';

interface StorageInterface {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
    clear(): void;
    key(index: number): string | null;
    readonly length: number;
}

class MemoryStorage implements StorageInterface {
    private store = new Map<string, string>();

    getItem(key: string): string | null {
        return this.store.get(key) ?? null;
    }

    setItem(key: string, value: string): void {
        this.store.set(key, value);
    }

    removeItem(key: string): void {
        this.store.delete(key);
    }

    clear(): void {
        this.store.clear();
    }

    key(index: number): string | null {
        return Array.from(this.store.keys())[index] || null;
    }

    get length(): number {
        return this.store.size;
    }
}

export class StorageManager {
    private storage: StorageInterface;
    private prefix: string;

    constructor(config: StorageConfig) {
        this.prefix = config.prefix || 'auth:';

        if (config.type === 'localStorage') {
            this.storage = window?.localStorage ?? new MemoryStorage();
        } else if (config.type === 'sessionStorage') {
            this.storage = window?.sessionStorage ?? new MemoryStorage();
        } else {
            this.storage = new MemoryStorage();
        }
    }

    private getKey(key: string): string {
        return `${this.prefix}${key}`;
    }

    get(key: string): string | null {
        return this.storage.getItem(this.getKey(key));
    }

    set(key: string, value: string): void {
        this.storage.setItem(this.getKey(key), value);
    }

    remove(key: string): void {
        this.storage.removeItem(this.getKey(key));
    }

    clear(): void {
        const keysToRemove: string[] = [];

        for (let i = 0; i < this.storage.length; i++) {
            const key = this.storage.key(i);
            if (key?.startsWith(this.prefix)) {
                keysToRemove.push(key);
            }
        }

        keysToRemove.forEach(key => this.storage.removeItem(key));
    }
}