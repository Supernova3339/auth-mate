/**
 * Interface for storage adapters used by Auth Mate
 * This is based on the StorageInterface from the core package
 * but adapted for asynchronous operations required for database storage
 */
export interface StorageInterface {
  /**
   * Retrieve an item from storage
   * @param key The key to retrieve
   * @returns The value or null if not found
   */
  getItem(key: string): Promise<string | null>;

  /**
   * Store an item in storage
   * @param key The key to store under
   * @param value The value to store
   */
  setItem(key: string, value: string): Promise<void>;

  /**
   * Remove an item from storage
   * @param key The key to remove
   */
  removeItem(key: string): Promise<void>;

  /**
   * Clear all items in storage (with the configured prefix)
   */
  clear(): Promise<void>;

  /**
   * Get all keys in storage
   * @returns Array of keys
   */
  keys(): Promise<string[]>;

  /**
   * Get the number of items in storage
   * @returns The number of items
   */
  length(): Promise<number>;

  /**
   * Get the key at the specified index
   * @param index The index to retrieve
   * @returns The key at that index or null
   */
  key(index: number): Promise<string | null>;
}