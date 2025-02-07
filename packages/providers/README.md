# @auth-mate/providers

OAuth provider implementations for Auth Mate authentication library.

## Installation

```bash
npm install @auth-mate/providers
# or
yarn add @auth-mate/providers
# or
pnpm add @auth-mate/providers
```

## Supported Providers

- Google
- GitHub
- Microsoft
- Custom providers

## Usage

```typescript
import { createProvider } from '@auth-mate/providers';

const provider = createProvider('google', {
  clientId: 'your-client-id',
  redirectUri: 'http://localhost:3000/callback',
  scope: 'openid profile email'
});

// Get authorization URL
const authUrl = await provider.getAuthUrl();

// Handle callback
const tokens = await provider.handleCallback(code);

// Get user info
const user = await provider.getUserInfo(tokens.access_token);
```

## Documentation

For full documentation, visit [auth-mate.dev](https://auth-mate.dev).

## License

MIT