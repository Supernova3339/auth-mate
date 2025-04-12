import { PrismaClient } from '@prisma/client';
import { PrismaStorage, PrismaStorageManager } from '../src';

async function testPrismaAdapter() {
  console.log('🔍 Testing Prisma Adapter for Auth Mate...');

  // Create a new Prisma client
  const prisma = new PrismaClient();
  console.log('✅ Prisma client created');

  try {
    // Test basic PrismaStorage adapter
    console.log('\n📦 Testing PrismaStorage...');
    const storage = new PrismaStorage({
      prisma,
      prefix: 'test:',
      ttl: 60 // 1 minute expiration for testing
    });

    // Test setting an item
    console.log('  Setting item: test-key -> test-value');
    await storage.setItem('test-key', 'test-value');

    // Test getting an item
    const value = await storage.getItem('test-key');
    console.log(`  Getting item: test-key = ${value}`);

    if (value !== 'test-value') {
      throw new Error('Values do not match!');
    }

    // Test listing keys
    const keys = await storage.keys();
    console.log(`  All keys: ${keys.join(', ')}`);

    // Test storage length
    const count = await storage.length();
    console.log(`  Storage count: ${count}`);

    // Test removing an item
    console.log('  Removing item: test-key');
    await storage.removeItem('test-key');

    const removedValue = await storage.getItem('test-key');
    console.log(`  Value after removal: ${removedValue === null ? 'null' : removedValue}`);

    if (removedValue !== null) {
      throw new Error('Item was not removed!');
    }

    console.log('✅ Basic PrismaStorage tests passed');

    // Test PrismaStorageManager
    console.log('\n🧠 Testing PrismaStorageManager with caching...');
    const manager = new PrismaStorageManager({
      prisma,
      prefix: 'manager:',
      ttl: 60
    });

    // Test setting multiple items
    console.log('  Setting multiple items');
    await manager.set('key1', 'value1');
    await manager.set('key2', 'value2');
    await manager.set('key3', 'value3');

    // Test getting items (should be cached)
    console.log('  Getting items (should use cache)');
    const val1 = await manager.get('key1');
    const val2 = await manager.get('key2');
    const val3 = await manager.get('key3');

    console.log(`  Values: ${val1}, ${val2}, ${val3}`);

    if (val1 !== 'value1' || val2 !== 'value2' || val3 !== 'value3') {
      throw new Error('Cache values do not match!');
    }

    // Test clearing all items
    console.log('  Clearing all items');
    await manager.clear();

    // Check if items are cleared
    const clearedVal = await manager.get('key1');
    console.log(`  Value after clear: ${clearedVal === null ? 'null' : clearedVal}`);

    if (clearedVal !== null) {
      throw new Error('Items were not cleared!');
    }

    console.log('✅ PrismaStorageManager tests passed');

    // Clean up
    await manager.disconnect();
    console.log('\n🧹 Cleanup completed');

    console.log('\n✨ All tests passed! The Prisma adapter is working correctly.');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Disconnect Prisma client
    await prisma.$disconnect();
  }
}

// Run the tests
testPrismaAdapter().catch(console.error);