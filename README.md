// @ts-nocheck
<p align="center">
  <img src="https://raw.githubusercontent.com/supernova3339/auth-mate/main/docs/logo.png" alt="Auth Mate Logo" width="120">
</p>

<h1 align="center">Auth Mate</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@auth-mate/react">
    <img src="https://img.shields.io/npm/v/@auth-mate/react?style=flat-square" alt="npm version">
  </a>
  <a href="https://github.com/supernova3339/auth-mate/actions">
    <img src="https://img.shields.io/github/actions/workflow/status/supernova3339/auth-mate/ci.yml?style=flat-square" alt="build status">
  </a>
  <a href="https://github.com/supernova3339/auth-mate/blob/main/LICENSE">
    <img src="https://img.shields.io/npm/l/@auth-mate/react?style=flat-square" alt="license">
  </a>
</p>

Auth Mate is a modern, type-safe authentication library for React applications with built-in support for popular OAuth providers and customizable configurations.

## Features

- 🔒 Built-in support for popular OAuth providers:
  - Google
  - GitHub 
  - Microsoft
- 🎨 Custom provider support
- 🔐 PKCE authentication flow
- 📦 Zero dependencies (except React)
- 💪 Full TypeScript support
- 🔄 Automatic token refresh
- 💾 Configurable storage options (localStorage, sessionStorage, memory)
- 🎯 Enterprise support (custom domains, tenants)

## Packages

- `@auth-mate/core` - Core utilities and types
- `@auth-mate/providers` - OAuth provider implementations
- `@auth-mate/react` - React components and hooks

## Installation

```bash
# Install with your preferred package manager
npm install @auth-mate/react
# or
pnpm add @auth-mate/react 
# or
yarn add @auth-mate/react
```

## Quick Start

```typescript
import { AuthProvider, useAuth } from '@auth-mate/react';

const config = {
  providers: {
    google: {
      clientId: 'your-client-id', 
      redirectUri: 'http://localhost:3000/callback'
    }
  }
};

function App() {
  return (
    <AuthProvider config={config}>
      <Router>
        <AppContent />
      </Router>  
    </AuthProvider>
  );
}

function LoginButton() {
  const { login, isAuthenticated, user } = useAuth();
  
  if (isAuthenticated) {
    return <div>Welcome, {user.name}!</div>;
  }
  
  return <button onClick={() => login('google')}>Login with Google</button>;
}
```

## Documentation

For detailed documentation and API reference, visit the [Auth Mate Docs](https://auth-mate.dev). ( coming soon! )

## Examples

Check out the [examples directory](https://github.com/supernova3339/auth-mate/tree/main/examples) for sample projects demonstrating various authentication flows and configurations. \
Please note, expamples are coming soon!

## Contributing

Contributions are welcome! Please read the [contributing guide](https://github.com/supernova3339/auth-mate/blob/main/CONTRIBUTING.md) to get started.

## License

This project is licensed under the [MIT License](https://github.com/supernova3339/auth-mate/blob/main/LICENSE).

## Support

For any questions or issues, please [open an issue](https://github.com/supernova3339/auth-mate/issues/new) on GitHub.