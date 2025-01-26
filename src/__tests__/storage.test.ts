import { describe, it, expect, beforeEach } from 'vitest';
import { StorageManager } from '../storage';

describe('StorageManager', () => {
    let storage: StorageManager;

    beforeEach(() => {
        // Clear actual storage
        localStorage.clear();
        sessionStorage.clear();
    });

    describe('localStorage', () => {
        beforeEach(() => {
            storage = new StorageManager({ type: 'localStorage', prefix: 'test:' });
        });

        it('should store and retrieve values', () => {
            storage.set('key', 'value');
            expect(storage.get('key')).toBe('value');
            expect(localStorage.getItem('test:key')).toBe('value');
        });

        it('should remove values', () => {
            storage.set('key', 'value');
            storage.remove('key');
            expect(storage.get('key')).toBeNull();
            expect(localStorage.getItem('test:key')).toBeNull();
        });

        it('should clear all values with prefix', () => {
            storage.set('key1', 'value1');
            storage.set('key2', 'value2');
            localStorage.setItem('other', 'value');

            storage.clear();

            expect(localStorage.getItem('test:key1')).toBeNull();
            expect(localStorage.getItem('test:key2')).toBeNull();
            expect(storage.get('key1')).toBeNull();
            expect(storage.get('key2')).toBeNull();
            expect(localStorage.getItem('other')).toBe('value');
        });
    });

    describe('memory storage', () => {
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

        it('should clear all values with prefix', () => {
            storage.set('key1', 'value1');
            storage.set('key2', 'value2');

            // Access public memoryStorage property
            storage.memoryStorage.set('external', 'data');

            storage.clear();

            expect(storage.get('key1')).toBeNull();
            expect(storage.get('key2')).toBeNull();
            // Verify non-prefixed entry remains
            expect(storage.memoryStorage.get('external')).toBe('data');
        });
    });
});