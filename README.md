# React Modern Auth

A modern, type-safe authentication library for React applications with built-in support for popular OAuth providers and customizable configurations.

## Features

- 🔒 Built-in support for popular OAuth providers (Google, GitHub, Microsoft)
- 🎨 Custom provider support
- 🔐 PKCE authentication flow
- 📦 Zero dependencies (except React)
- 💪 Full TypeScript support
- 🔄 Automatic token refresh
- 💾 Configurable storage (localStorage, sessionStorage, or memory)
- 🎯 Enterprise support (custom domains, tenants)

## Installation

```bash
npm install react-modern-auth
# or
yarn add react-modern-auth
# or
pnpm add react-modern-auth
```

## Quick Start

### 1. Configure Your Provider

```typescript
import { AuthProvider } from 'react-modern-auth';

const config = {
  providers: {
    google: {
      clientId: 'your-google-client-id',
      redirectUri: 'http://localhost:3000/callback',
      scope: 'openid profile email'
    }
  },
  // Optional common settings
  storage: {
    type: 'localStorage',
    prefix: 'myapp:auth:'
  },
  autoRefresh: {
    enabled: true,
    timeBuffer: 300 // refresh 5 minutes before expiry
  }
};

function App() {
  return (
    <AuthProvider config={config}>
      <YourApp />
    </AuthProvider>
  );
}
```

### 2. Use the Authentication Hook

```typescript
import { useAuth } from 'react-modern-auth';

function LoginButton() {
  const { login, isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return <div>Welcome, {user.name}!</div>;
  }

  return <button onClick={() => login('google')}>Login with Google</button>;
}
```

## Provider Configuration

### Google

```typescript
const config = {
  providers: {
    google: {
      clientId: 'your-client-id',
      redirectUri: 'http://localhost:3000/callback',
      scope: 'openid profile email',
      accessType: 'offline', // for refresh tokens
      prompt: 'consent'
    }
  }
};
```

### GitHub

```typescript
const config = {
  providers: {
    github: {
      clientId: 'your-client-id',
      redirectUri: 'http://localhost:3000/callback',
      scope: 'read:user user:email',
      // For GitHub Enterprise
      domain: 'github.yourcompany.com'
    }
  }
};
```

### Microsoft

```typescript
const config = {
  providers: {
    microsoft: {
      clientId: 'your-client-id',
      redirectUri: 'http://localhost:3000/callback',
      scope: 'openid profile email User.Read',
      // For specific tenant
      domain: 'your-tenant-id'
    }
  }
};
```

### Custom Provider

```typescript
const config = {
  providers: {
    custom: {
      clientId: 'your-client-id',
      redirectUri: 'http://localhost:3000/callback',
      authorizationUrl: 'https://auth.provider.com/authorize',
      tokenUrl: 'https://auth.provider.com/token',
      userInfoUrl: 'https://api.provider.com/userinfo',
      scope: 'openid profile email',
      // Map provider's user info response to standard format
      userInfoMapping: {
        id: 'sub',
        email: 'email',
        name: 'name',
        picture: 'picture'
      },
      // Additional parameters
      extraParams: {
        authorization: {
          audience: 'api://default'
        },
        token: {
          resource: 'https://api.provider.com'
        }
      },
      // Custom headers
      headers: {
        authorization: {
          'x-custom-header': 'value'
        }
      }
    }
  }
};
```

## Common Configuration Options

```typescript
const config = {
  // Provider configurations...
  
  // Storage configuration
  storage: {
    type: 'localStorage' | 'sessionStorage' | 'memory',
    prefix: 'auth:' // prefix for storage keys
  },

  // Auto refresh configuration
  autoRefresh: {
    enabled: boolean,
    timeBuffer: number // seconds before expiry to refresh
  },

  // Navigation configuration
  navigation: {
    loginSuccessPath: '/dashboard',
    logoutPath: '/login',
    preservePath: true // preserve current path after login
  }
};
```

## Hook API

The `useAuth` hook provides the following interface:

```typescript
interface AuthContextValue {
  // Authentication state
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: Error | null;

  // Authentication methods
  login: (provider: Provider) => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: Provider;
  raw: any; // Original provider response
}
```

## Development

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/react-modern-auth.git
cd react-modern-auth
```

2. Install dependencies:
```bash
pnpm install
```

3. Run tests:
```bash
pnpm test
```

### Building

```bash
pnpm build
```

This will create:
- CommonJS (`.js`)
- ES Modules (`.mjs`)
- TypeScript declarations (`.d.ts`)

### Testing

The project uses Vitest for testing. Test files are located in `src/__tests__`.

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch
```

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

## Security

For security concerns, please email supernova@superdev.one.

## Support

For support questions, please open an issue on GitHub.