import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PrismaStorage, PrismaStorageManager } from '../index';
import { PrismaClient } from '@prisma/client';

// Mock PrismaClient
vi.mock('@prisma/client', () => {
  const mockAuthEntry = {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
  };

  return {
    PrismaClient: vi.fn().mockImplementation(() => ({
      authEntry: mockAuthEntry,
      $disconnect: vi.fn(),
    })),
  };
});

describe('PrismaStorage', () => {
  let prisma: PrismaClient;
  let storage: PrismaStorage;

  beforeEach(() => {
    // Create a fresh instance for each test
    prisma = new PrismaClient();
    storage = new PrismaStorage({ prisma, prefix: 'test:' });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should get an item from storage', async () => {
    // Mock the findUnique method to return a value
    (prisma.authEntry.findUnique as any).mockResolvedValue({
      key: 'test:testKey',
      value: 'testValue',
      expiresAt: null,
    });

    const result = await storage.getItem('testKey');

    expect(prisma.authEntry.findUnique).toHaveBeenCalledWith({
      where: { key: 'test:testKey' },
    });
    expect(result).toBe('testValue');
  });

  it('should return null for non-existent keys', async () => {
    // Mock the findUnique method to return null
    (prisma.authEntry.findUnique as any).mockResolvedValue(null);

    const result = await storage.getItem('nonExistentKey');

    expect(prisma.authEntry.findUnique).toHaveBeenCalledWith({
      where: { key: 'test:nonExistentKey' },
    });
    expect(result).toBeNull();
  });

  it('should return null for expired keys', async () => {
    // Mock a response with an expired timestamp
    const expiredDate = new Date(Date.now() - 1000);
    (prisma.authEntry.findUnique as any).mockResolvedValue({
      key: 'test:expiredKey',
      value: 'expiredValue',
      expiresAt: expiredDate,
    });

    const result = await storage.getItem('expiredKey');

    expect(prisma.authEntry.findUnique).toHaveBeenCalledWith({
      where: { key: 'test:expiredKey' },
    });
    expect(result).toBeNull();
  });

  it('should set an item in storage', async () => {
    await storage.setItem('testKey', 'testValue');

    expect(prisma.authEntry.upsert).toHaveBeenCalledWith({
      where: { key: 'test:testKey' },
      update: {
        value: 'testValue',
        expiresAt: null,
        updatedAt: expect.any(Date),
      },
      create: {
        key: 'test:testKey',
        value: 'testValue',
        expiresAt: null,
      },
    });
  });

  it('should set an item with expiration when TTL is configured', async () => {
    const ttlStorage = new PrismaStorage({
      prisma,
      prefix: 'test:',
      ttl: 3600 // 1 hour
    });

    await ttlStorage.setItem('ttlKey', 'ttlValue');

    // The mock call should include an expiresAt date approximately 1 hour in the future
    const call = (prisma.authEntry.upsert as any).mock.calls[0][0];

    expect(call.where.key).toBe('test:ttlKey');
    expect(call.update.value).toBe('ttlValue');

    // Check that expiresAt is a Date object within a reasonable range
    const now = Date.now();
    const expiresAtTime = call.update.expiresAt.getTime();

    // Should be between now + 59 minutes and now + 61 minutes
    expect(expiresAtTime).toBeGreaterThan(now + 3540000);
    expect(expiresAtTime).toBeLessThan(now + 3660000);
  });

  it('should remove an item from storage', async () => {
    await storage.removeItem('testKey');

    expect(prisma.authEntry.delete).toHaveBeenCalledWith({
      where: { key: 'test:testKey' },
    });
  });

  it('should clear all items with the configured prefix', async () => {
    await storage.clear();

    expect(prisma.authEntry.deleteMany).toHaveBeenCalledWith({
      where: {
        key: {
          startsWith: 'test:',
        },
      },
    });
  });

  it('should get all keys', async () => {
    // Mock the findMany method to return several entries
    (prisma.authEntry.findMany as any).mockResolvedValue([
      { key: 'test:key1' },
      { key: 'test:key2' },
      { key: 'test:key3' },
    ]);

    const result = await storage.keys();

    expect(prisma.authEntry.findMany).toHaveBeenCalledWith({
      where: {
        key: {
          startsWith: 'test:',
        },
      },
      select: {
        key: true,
      },
    });

    expect(result).toEqual(['key1', 'key2', 'key3']);
  });

  it('should get the storage length', async () => {
    (prisma.authEntry.count as any).mockResolvedValue(3);

    const result = await storage.length();

    expect(prisma.authEntry.count).toHaveBeenCalledWith({
      where: {
        key: {
          startsWith: 'test:',
        },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: expect.any(Date) } },
        ],
      },
    });

    expect(result).toBe(3);
  });

  it('should get a key at a specific index', async () => {
    // Mock the keys() method
    vi.spyOn(storage, 'keys').mockResolvedValue(['key1', 'key2', 'key3']);

    const result = await storage.key(1);

    expect(storage.keys).toHaveBeenCalled();
    expect(result).toBe('key2');
  });

  it('should return null for an index out of bounds', async () => {
    vi.spyOn(storage, 'keys').mockResolvedValue(['key1', 'key2']);

    const result = await storage.key(5);

    expect(storage.keys).toHaveBeenCalled();
    expect(result).toBeNull();
  });
});

describe('PrismaStorageManager', () => {
  let prisma: PrismaClient;
  let manager: PrismaStorageManager;

  beforeEach(async () => {
    // Create a fresh instance for each test
    prisma = new PrismaClient();

    // Mock initial data for initialization
    (prisma.authEntry.keys as any) = vi.fn().mockResolvedValue([]);
    (prisma.authEntry.findMany as any).mockResolvedValue([]);

    manager = new PrismaStorageManager({ prisma, prefix: 'test:' });

    // Wait for initialization to complete
    await new Promise(resolve => setTimeout(resolve, 10));
  });

  afterEach(async () => {
    await manager.disconnect();
    vi.clearAllMocks();
  });

  it('should get an item from storage', async () => {
    // Mock the storage to return a value directly for the first call
    vi.spyOn(manager as any, 'ensureInitialized').mockResolvedValue(undefined);

    // Initially the item won't be in the cache
    (prisma.authEntry.findUnique as any).mockResolvedValue({
      key: 'test:cacheKey',
      value: 'cachedValue',
      expiresAt: null,
    });

    const result = await manager.get('cacheKey');

    expect(result).toBe('cachedValue');
    expect(prisma.authEntry.findUnique).toHaveBeenCalledWith({
      where: { key: 'test:cacheKey' },
    });

    // Second call should use the cache
    (prisma.authEntry.findUnique as any).mockClear();

    const cachedResult = await manager.get('cacheKey');

    expect(cachedResult).toBe('cachedValue');
    expect(prisma.authEntry.findUnique).not.toHaveBeenCalled();
  });

  it('should set an item in storage and update cache', async () => {
    vi.spyOn(manager as any, 'ensureInitialized').mockResolvedValue(undefined);

    await manager.set('setKey', 'setValue');

    // Check that it's in the database
    expect(prisma.authEntry.upsert).toHaveBeenCalledWith({
      where: { key: 'test:setKey' },
      update: expect.objectContaining({
        value: 'setValue',
      }),
      create: expect.objectContaining({
        key: 'test:setKey',
        value: 'setValue',
      }),
    });

    // Value should be in cache immediately
    const result = await manager.get('setKey');
    expect(result).toBe('setValue');
    expect(prisma.authEntry.findUnique).not.toHaveBeenCalled();
  });

  it('should remove an item from storage and cache', async () => {
    vi.spyOn(manager as any, 'ensureInitialized').mockResolvedValue(undefined);

    // First set an item
    await manager.set('removeKey', 'removeValue');

    // Then remove it
    await manager.remove('removeKey');

    // Check that delete was called
    expect(prisma.authEntry.delete).toHaveBeenCalledWith({
      where: { key: 'test:removeKey' },
    });

    // Item should be gone from cache too
    (prisma.authEntry.findUnique as any).mockResolvedValue(null);

    const result = await manager.get('removeKey');
    expect(result).toBeNull();
  });

  it('should clear all items', async () => {
    vi.spyOn(manager as any, 'ensureInitialized').mockResolvedValue(undefined);

    // Set multiple items
    await manager.set('key1', 'value1');
    await manager.set('key2', 'value2');

    // Clear all
    await manager.clear();

    // Check that deleteMany was called
    expect(prisma.authEntry.deleteMany).toHaveBeenCalledWith({
      where: {
        key: {
          startsWith: 'test:',
        },
      },
    });

    // Items should be gone from cache
    (prisma.authEntry.findUnique as any).mockResolvedValue(null);

    const result1 = await manager.get('key1');
    const result2 = await manager.get('key2');

    expect(result1).toBeNull();
    expect(result2).toBeNull();
  });
});