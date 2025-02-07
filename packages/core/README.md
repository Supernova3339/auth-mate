# @auth-mate/core

Core utilities and types for Auth Mate authentication library.

## Installation

```bash
npm install @auth-mate/core
# or
yarn add @auth-mate/core
# or
pnpm add @auth-mate/core
```

## Features

- Type definitions for Auth Mate configuration
- Crypto utilities for OAuth flows
- Storage management utilities
- Shared interfaces and types

## Usage

```typescript
import { StorageManager, generateState } from '@auth-mate/core';

// Create a storage manager
const storage = new StorageManager({
  type: 'localStorage',
  prefix: 'auth:'
});

// Generate OAuth state
const state = generateState('google');
```

## Documentation

For full documentation, visit [auth-mate.dev](https://auth-mate.dev). ( coming soon!)

## License

MIT