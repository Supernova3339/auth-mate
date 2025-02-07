# @auth-mate/react

React authentication library with built-in provider support.

## Installation

```bash
npm install @auth-mate/react
# or
yarn add @auth-mate/react
# or
pnpm add @auth-mate/react
```

## Usage

```tsx
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
      <YourApp />
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

For full documentation, visit [auth-mate.dev](https://auth-mate.dev). ( coming soon! )

## License

MIT