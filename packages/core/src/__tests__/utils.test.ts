import { describe, it, expect, beforeEach } from 'vitest';
import { StorageManager } from '../utils/storage';

describe('StorageManager', () => {
    let storage: StorageManager;

    beforeEach(() => {
        storage = new StorageManager({ type: 'memory', prefix: 'test:' });
    });

    it('should store and retrieve values', () => {
        storage.set('key', 'value');
        expect(storage.get('key')).toBe('value');
    });

    it('should remove values', () => {
        storage.set('key', 'value');
        storage.remove('key');
        expect(storage.get('key')).toBeNull();
    });

    it('should clear all values', () => {
        storage.set('key1', 'value1');
        storage.set('key2', 'value2');
        storage.clear();
        expect(storage.get('key1')).toBeNull();
        expect(storage.get('key2')).toBeNull();
    });

    it('should handle non-existent keys', () => {
        expect(storage.get('nonexistent')).toBeNull();
    });

    it('should respect prefix in key operations', () => {
        storage.set('test', 'value');
        expect(storage.get('test')).toBe('value');
        // The actual storage key should include the prefix
        const rawStorage = storage as any;
        expect(rawStorage.storage.getItem('test:test')).toBe('value');
    });
});