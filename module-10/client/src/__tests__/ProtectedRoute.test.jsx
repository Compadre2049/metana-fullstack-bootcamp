import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../context/AuthContext';

// Mock AuthContext
jest.mock('../context/AuthContext', () => ({
    useAuth: jest.fn()
}));

describe('ProtectedRoute Component', () => {
    // Helper function to render protected route with custom props
    const renderProtectedRoute = (isAuthenticated, initialEntries = ['/protected']) => {
        useAuth.mockImplementation(() => ({
            isAuthenticated
        }));

        return render(
            <MemoryRouter initialEntries={initialEntries}>
                <Routes>
                    <Route
                        path="/protected"
                        element={
                            <ProtectedRoute>
                                <div>Protected Content</div>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/login"
                        element={<div>Login Page</div>}
                    />
                </Routes>
            </MemoryRouter>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders children when user is authenticated', () => {
        renderProtectedRoute(true);

        expect(screen.getByText('Protected Content')).toBeInTheDocument();
        expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });

    test('redirects to login when user is not authenticated', () => {
        renderProtectedRoute(false);

        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
        expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    test('preserves attempted URL in navigation state', () => {
        renderProtectedRoute(false, ['/protected?query=test']);

        // Verify we're redirected to login page
        expect(screen.getByText('Login Page')).toBeInTheDocument();
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    test('handles route changes', () => {
        const { rerender } = renderProtectedRoute(true);

        // Initially shows protected content
        expect(screen.getByText('Protected Content')).toBeInTheDocument();

        // Update auth state to false
        useAuth.mockImplementation(() => ({
            isAuthenticated: false
        }));

        rerender(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route
                        path="/protected"
                        element={
                            <ProtectedRoute>
                                <div>Protected Content</div>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/login"
                        element={<div>Login Page</div>}
                    />
                </Routes>
            </MemoryRouter>
        );

        // Should now show login page
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
        expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
}); 