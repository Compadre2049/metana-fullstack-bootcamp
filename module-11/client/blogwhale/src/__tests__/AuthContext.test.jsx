import React from 'react';
import { render, act, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { login as loginAPI } from '../api/authAPI';

// Mock the authAPI
jest.mock('../api/authAPI', () => ({
    login: jest.fn()
}));

// Mock console.error to reduce noise in tests
console.error = jest.fn();

// Mock localStorage
const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Test component to access auth context
const TestComponent = () => {
    const auth = useAuth();
    return (
        <div>
            <div data-testid="user">{auth.user ? JSON.stringify(auth.user) : 'no-user'}</div>
            <div data-testid="isAuthenticated">{String(auth.isAuthenticated)}</div>
            <button onClick={() => auth.login('test@example.com', 'password')}>Login</button>
            <button onClick={auth.logout}>Logout</button>
        </div>
    );
};

describe('AuthContext', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        // Clear localStorage mock implementations
        mockLocalStorage.getItem.mockImplementation(() => null);
    });

    afterEach(() => {
        jest.useRealTimers();
        console.error.mockClear();
    });

    test('provides initial unauthenticated state', () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        expect(screen.getByTestId('user')).toHaveTextContent('no-user');
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    });

    test('handles successful login', async () => {
        const mockUser = {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            role: 'user'
        };

        const mockResponse = {
            token: 'header.eyJleHAiOjk5OTk5OTk5OTl9.signature', // Valid future timestamp
            user: mockUser
        };

        loginAPI.mockResolvedValueOnce(mockResponse);

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await act(async () => {
            screen.getByText('Login').click();
        });

        await waitFor(() => {
            expect(localStorage.setItem).toHaveBeenCalledWith('token', mockResponse.token);
            expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
            expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
        });
    });

    test('handles logout', async () => {
        const mockUser = {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            role: 'user'
        };

        mockLocalStorage.getItem.mockImplementation((key) => {
            if (key === 'user') return JSON.stringify(mockUser);
            if (key === 'token') return 'header.eyJleHAiOjk5OTk5OTk5OTl9.signature';
            return null;
        });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        act(() => {
            screen.getByText('Logout').click();
        });

        expect(localStorage.removeItem).toHaveBeenCalledWith('token');
        expect(localStorage.removeItem).toHaveBeenCalledWith('user');
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    });

    test('validates expired tokens', () => {
        const expiredToken = 'header.eyJleHAiOjE2MTY3MjMyMDB9.signature';
        mockLocalStorage.getItem.mockImplementation((key) => {
            if (key === 'token') return expiredToken;
            if (key === 'user') return JSON.stringify({ name: 'Test User' });
            return null;
        });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
        expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    });

    test('handles periodic token check', () => {
        const validToken = 'header.eyJleHAiOjk5OTk5OTk5OTl9.signature';
        mockLocalStorage.getItem.mockImplementation((key) => {
            if (key === 'token') return validToken;
            if (key === 'user') return JSON.stringify({ name: 'Test User' });
            return null;
        });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        act(() => {
            jest.advanceTimersByTime(60000); // Advance 1 minute
        });

        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('token');
    });

    test('handles invalid stored user data', () => {
        mockLocalStorage.getItem.mockImplementation((key) => {
            if (key === 'user') return 'invalid-json';
            if (key === 'token') return 'header.eyJleHAiOjk5OTk5OTk5OTl9.signature';
            return null;
        });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
        expect(localStorage.removeItem).toHaveBeenCalledWith('user');
        expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    });

    test('updates user data', async () => {
        const mockUser = {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            role: 'user'
        };

        mockLocalStorage.getItem.mockImplementation((key) => {
            if (key === 'user') return JSON.stringify(mockUser);
            if (key === 'token') return 'header.eyJleHAiOjk5OTk5OTk5OTl9.signature';
            return null;
        });

        const TestUpdateComponent = () => {
            const { updateUser, user } = useAuth();
            return (
                <div>
                    <div data-testid="userName">{user?.name}</div>
                    <button onClick={() => updateUser({ name: 'Updated Name' })}>
                        Update
                    </button>
                </div>
            );
        };

        render(
            <AuthProvider>
                <TestUpdateComponent />
            </AuthProvider>
        );

        act(() => {
            screen.getByText('Update').click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('userName')).toHaveTextContent('Updated Name');
            expect(localStorage.setItem).toHaveBeenCalledWith(
                'user',
                expect.stringContaining('Updated Name')
            );
        });
    });
}); 