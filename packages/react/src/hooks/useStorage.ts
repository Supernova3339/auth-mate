import { useCallback } from 'react';
import { StorageManager } from '@auth-mate/core';

export function useStorage(storage: StorageManager) {
    const getValue = useCallback((key: string) => {
        return storage.get(key);
    }, [storage]);

    const setValue = useCallback((key: string, value: string) => {
        storage.set(key, value);
    }, [storage]);

    const removeValue = useCallback((key: string) => {
        storage.remove(key);
    }, [storage]);

    const clearStorage = useCallback(() => {
        storage.clear();
    }, [storage]);

    return {
        getValue,
        setValue,
        removeValue,
        clearStorage
    };
}