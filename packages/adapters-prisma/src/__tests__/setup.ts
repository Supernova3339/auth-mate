import { afterAll, afterEach, vi } from 'vitest';

// Setup global mocks for tests

// Mock console.error to not pollute test output
const originalConsoleError = console.error;
console.error = vi.fn();

// Restore console after tests
afterEach(() => {
  vi.clearAllMocks();
});

// Cleanup function to restore console.error when all tests are complete
// This is executed after all tests have run
afterAll(() => {
  console.error = originalConsoleError;
});