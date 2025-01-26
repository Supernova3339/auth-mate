import { CommonConfig, StorageType } from "../types";

export class StorageManager {
    private type: StorageType;
    private prefix: string;
    private memoryStore: Map<string, string>;

    constructor(config: NonNullable<CommonConfig['storage']>) {
        this.type = config.type;
        this.prefix = config.prefix ?? ''; // Provide a default empty string if prefix is undefined
        this.memoryStore = new Map();
    }

    private getStorage(): Storage | Map<string, string> {
        switch (this.type) {
            case 'localStorage':
                return window.localStorage;
            case 'sessionStorage':
                return window.sessionStorage;
            case 'memory':
                return this.memoryStore;
            default:
                throw new Error(`Unsupported storage type: ${this.type}`);
        }
    }

    private getKey(key: string): string {
        return `${this.prefix}${key}`;
    }

    get(key: string): string | null {
        const storage = this.getStorage();
        const fullKey = this.getKey(key);

        if (storage instanceof Map) {
            return storage.get(fullKey) || null;
        }

        return storage.getItem(fullKey);
    }

    set(key: string, value: string): void {
        const storage = this.getStorage();
        const fullKey = this.getKey(key);

        if (storage instanceof Map) {
            storage.set(fullKey, value);
        } else {
            storage.setItem(fullKey, value);
        }
    }

    remove(key: string): void {
        const storage = this.getStorage();
        const fullKey = this.getKey(key);

        if (storage instanceof Map) {
            storage.delete(fullKey);
        } else {
            storage.removeItem(fullKey);
        }
    }

    clear(): void {
        const storage = this.getStorage();

        if (storage instanceof Map) {
            storage.clear();
        } else {
            Object.keys(storage).forEach(key => {
                if (key.startsWith(this.prefix)) {
                    storage.removeItem(key);
                }
            });
        }
    }
}