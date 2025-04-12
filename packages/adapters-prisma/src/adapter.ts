import { PrismaClient } from '@prisma/client';
import type { StorageInterface } from './types';

export interface PrismaStorageConfig {
  /**
   * An existing Prisma client instance to use.
   * If not provided, a new client will be created.
   */
  prisma?: PrismaClient;

  /**
   * The prefix to use for storage keys.
   * This helps distinguish auth-mate entries from other data.
   * @default 'auth:'
   */
  prefix?: string;

  /**
   * Default time-to-live for entries in seconds.
   * Set to null for no expiration.
   * @default null
   */
  ttl?: number | null;
}

/**
 * PrismaStorage adapter for auth-mate that uses a Prisma database
 * to store authentication state.
 */
export class PrismaStorage implements StorageInterface {
  private client: PrismaClient;
  private prefix: string;
  private ttl: number | null;
  private ownsPrismaClient: boolean;

  /**
   * Create a new PrismaStorage instance.
   * @param config Configuration options for the storage adapter
   */
  constructor(config: PrismaStorageConfig = {}) {
    this.prefix = config.prefix || 'auth:';
    this.ttl = config.ttl !== undefined ? config.ttl : null;

    if (config.prisma) {
      this.client = config.prisma;
      this.ownsPrismaClient = false;
    } else {
      this.client = new PrismaClient();
      this.ownsPrismaClient = true;
    }
  }

  /**
   * Cleanup resources used by this adapter.
   * Call this when you're done using the adapter.
   */
  async disconnect(): Promise<void> {
    if (this.ownsPrismaClient) {
      await this.client.$disconnect();
    }
  }

  /**
   * Get the prefixed storage key
   * @param key The original key
   * @returns The key with the prefix applied
   */
  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  /**
   * Get a value from storage by key
   * @param key The key to retrieve
   * @returns The stored value or null if not found
   */
  async getItem(key: string): Promise<string | null> {
    const prefixedKey = this.getKey(key);

    try {
      // Fetch the entry and check if it's expired
      const entry = await this.client.authEntry.findUnique({
        where: { key: prefixedKey }
      });

      if (!entry) {
        return null;
      }

      // Check if the entry has expired
      if (entry.expiresAt && entry.expiresAt < new Date()) {
        // Remove the expired entry
        await this.removeItem(key);
        return null;
      }

      return entry.value;
    } catch (error) {
      console.error('PrismaStorage getItem error:', error);
      return null;
    }
  }

  /**
   * Store a value in the database
   * @param key The key to store
   * @param value The value to store
   */
  async setItem(key: string, value: string): Promise<void> {
    const prefixedKey = this.getKey(key);

    try {
      // Calculate expiration time if TTL is set
      const expiresAt = this.ttl ? new Date(Date.now() + this.ttl * 1000) : null;

      await this.client.authEntry.upsert({
        where: { key: prefixedKey },
        update: {
          value,
          expiresAt,
          updatedAt: new Date()
        },
        create: {
          key: prefixedKey,
          value,
          expiresAt
        }
      });
    } catch (error) {
      console.error('PrismaStorage setItem error:', error);
    }
  }

  /**
   * Remove an item from storage
   * @param key The key to remove
   */
  async removeItem(key: string): Promise<void> {
    const prefixedKey = this.getKey(key);

    try {
      await this.client.authEntry.delete({
        where: { key: prefixedKey }
      }).catch(() => {
        // Ignore if entry doesn't exist
      });
    } catch (error) {
      console.error('PrismaStorage removeItem error:', error);
    }
  }

  /**
   * Clear all items with the configured prefix
   */
  async clear(): Promise<void> {
    try {
      await this.client.authEntry.deleteMany({
        where: {
          key: {
            startsWith: this.prefix
          }
        }
      });
    } catch (error) {
      console.error('PrismaStorage clear error:', error);
    }
  }

  /**
   * Get all keys with the configured prefix
   * @returns Array of keys
   */
  async keys(): Promise<string[]> {
    try {
      const entries = await this.client.authEntry.findMany({
        where: {
          key: {
            startsWith: this.prefix
          }
        },
        select: {
          key: true
        }
      });

      return entries
        .map((entry: { key: string; }) => entry.key.substring(this.prefix.length))
        // Filter out expired entries (though ideally these would be cleaned up separately)
        .filter(async (key: string) => await this.getItem(key) !== null);
    } catch (error) {
      console.error('PrismaStorage keys error:', error);
      return [];
    }
  }

  /**
   * Get the number of stored items
   * @returns The count of stored items
   */
  async length(): Promise<number> {
    try {
      const count = await this.client.authEntry.count({
        where: {
          key: {
            startsWith: this.prefix
          },
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        }
      });

      return count;
    } catch (error) {
      console.error('PrismaStorage length error:', error);
      return 0;
    }
  }

  /**
   * Get a key at a specific index
   * @param index The index to get
   * @returns The key at that index or null
   */
  async key(index: number): Promise<string | null> {
    try {
      const keys = await this.keys();
      return keys[index] || null;
    } catch (error) {
      console.error('PrismaStorage key error:', error);
      return null;
    }
  }
}