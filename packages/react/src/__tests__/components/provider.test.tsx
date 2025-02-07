import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AuthProvider } from '../../components/provider';
import { useAuth } from '../../hooks/useAuth';

const mockConfig = {
    providers: {
        google: {
            clientId: 'test-client-id',
            redirectUri: 'http://localhost:3000/callback'
        }
    }
};

function TestComponent() {
    const { isAuthenticated, isLoading, user, login } = useAuth();
    return (
        <div>
            <div data-testid="loading">{isLoading ? 'Loading' : 'Not Loading'}</div>
            <div data-testid="authenticated">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
            <div data-testid="user">{user?.name || 'No User'}</div>
            <button onClick={() => login('google')}>Login</button>
        </div>
    );
}

describe('AuthProvider', () => {
    it('provides initial auth state', () => {
        render(
            <AuthProvider config={mockConfig}>
                <TestComponent />
            </AuthProvider>
        );

        expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
        expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
        expect(screen.getByTestId('user')).toHaveTextContent('No User');
    });

    // Add more tests...
});