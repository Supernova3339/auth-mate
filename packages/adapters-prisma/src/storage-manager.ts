import { PrismaStorage, type PrismaStorageConfig } from './adapter';

/**
 * PrismaStorageManager is a wrapper around PrismaStorage that provides
 * synchronous-like interface to match the core StorageManager API.
 *
 * It uses a cache to provide immediate results while database operations
 * happen in the background.
 */
export class PrismaStorageManager {
  private storage: PrismaStorage;
  private cache: Map<string, string>;
  private initialized: boolean = false;
  private readonly initPromise: Promise<void>;

  /**
   * Create a new PrismaStorageManager
   * @param config Configuration for the Prisma storage adapter
   */
  constructor(config: PrismaStorageConfig = {}) {
    this.storage = new PrismaStorage(config);
    this.cache = new Map<string, string>();

    // Initialize the cache from database
    this.initPromise = this.init();
  }

  /**
   * Initialize the cache from the database
   * This happens automatically when the manager is created
   */
  private async init(): Promise<void> {
    try {
      const keys = await this.storage.keys();

      for (const key of keys) {
        const value = await this.storage.getItem(key);
        if (value !== null) {
          this.cache.set(key, value);
        }
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize PrismaStorageManager:', error);
      throw error;
    }
  }

  /**
   * Ensure the manager is initialized before performing operations
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initPromise;
    }
  }

  /**
   * Get an item from storage
   * @param key The key to retrieve
   * @returns The value or null if not found
   */
  async get(key: string): Promise<string | null> {
    await this.ensureInitialized();

    const cachedValue = this.cache.get(key);
    if (cachedValue !== undefined) {
      return cachedValue;
    }

    const value = await this.storage.getItem(key);

    // Update cache if value exists
    if (value !== null) {
      this.cache.set(key, value);
    }

    return value;
  }

  /**
   * Store an item in storage
   * @param key The key to store
   * @param value The value to store
   */
  async set(key: string, value: string): Promise<void> {
    await this.ensureInitialized();

    // Update cache immediately
    this.cache.set(key, value);

    // Then update database
    await this.storage.setItem(key, value);
  }

  /**
   * Remove an item from storage
   * @param key The key to remove
   */
  async remove(key: string): Promise<void> {
    await this.ensureInitialized();

    // Update cache immediately
    this.cache.delete(key);

    // Then update database
    await this.storage.removeItem(key);
  }

  /**
   * Clear all items with the configured prefix
   */
  async clear(): Promise<void> {
    await this.ensureInitialized();

    // Clear cache
    this.cache.clear();

    // Clear database entries
    await this.storage.clear();
  }

  /**
   * Close the database connection when done using the manager
   */
  async disconnect(): Promise<void> {
    await this.storage.disconnect();
  }
}