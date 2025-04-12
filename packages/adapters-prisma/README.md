# @auth-mate/adapters-prisma

Prisma database adapter for Auth Mate authentication library. This adapter allows you to store authentication state in a database using Prisma ORM, providing persistence across sessions and devices.

## Installation

```bash
npm install @auth-mate/adapters-prisma
# or
yarn add @auth-mate/adapters-prisma
# or
pnpm add @auth-mate/adapters-prisma
```

You also need to have Prisma installed:

```bash
npm install prisma @prisma/client
# or
yarn add prisma @prisma/client
# or
pnpm add prisma @prisma/client
```

## Setup

### 1. Add the Auth Storage Model to Your Prisma Schema

Add the `AuthEntry` model to your Prisma schema:

```prisma
// prisma/schema.prisma
model AuthEntry {
  id         String   @id @default(cuid())
  key        String   @unique
  value      String
  expiresAt  DateTime?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([key])
}
```

### 2. Generate the Prisma Client

After adding the model, generate your Prisma client:

```bash
npx prisma generate
```

### 3. Run Migrations

Create and apply a migration:

```bash
npx prisma migrate dev --name add_auth_storage
```

## Usage with Auth Mate

### Basic Usage

```typescript
import { AuthProvider } from '@auth-mate/react';
import { PrismaClient } from '@prisma/client';
import { PrismaStorageManager } from '@auth-mate/adapters-prisma';

// Create a Prisma client instance
const prisma = new PrismaClient();

// Create a custom storage configuration using the Prisma adapter
const customStorage = {
  prisma: prisma,
  prefix: 'auth:',
  ttl: 60 * 60 * 24 * 7, // 7 days in seconds
};

// Configure Auth Mate to use the Prisma storage adapter
const authConfig = {
  providers: {
    google: {
      clientId: 'your-client-id',
      redirectUri: 'http://localhost:3000/callback'
    }
  },
  // Pass the PrismaStorageManager as a custom storage option
  customStorage: new PrismaStorageManager(customStorage)
};

function App() {
  return (
    <AuthProvider config={authConfig}>
      <YourApp />
    </AuthProvider>
  );
}
```

### Using an Existing Prisma Client

If you already have a Prisma client instance in your application, you can pass it to the adapter:

```typescript
import { PrismaStorage } from '@auth-mate/adapters-prisma';
import { prisma } from './your-prisma-client';

const storage = new PrismaStorage({
  prisma: prisma,
  prefix: 'custom-prefix:',
  ttl: 3600 // 1 hour in seconds
});
```

### Cleanup

Remember to disconnect the Prisma client when your application shuts down:

```typescript
// When your app is shutting down
await storage.disconnect();
```

## API Reference

### PrismaStorage

The `PrismaStorage` class implements the storage interface and interacts directly with the database.

#### Configuration Options

```typescript
interface PrismaStorageConfig {
  // An existing Prisma client instance to use
  prisma?: PrismaClient;
  
  // The prefix to use for storage keys (default: 'auth:')
  prefix?: string;
  
  // Default time-to-live for entries in seconds (default: null - no expiration)
  ttl?: number | null;
}
```

### PrismaStorageManager

The `PrismaStorageManager` provides a higher-level interface that can be used with Auth Mate, with automatic caching for better performance.

## License

MIT