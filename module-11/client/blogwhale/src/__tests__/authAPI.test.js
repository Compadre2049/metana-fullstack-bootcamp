import { login } from '../api/authAPI';

// Mock fetch globally
global.fetch = jest.fn();

// Mock console methods to avoid cluttering test output
console.error = jest.fn();
console.log = jest.fn();

// Store original env
const originalEnv = process.env;

describe('authAPI - login', () => {
    // Set up environment before all tests
    beforeAll(() => {
        // Mock process.env
        process.env = {
            ...originalEnv,
            REACT_APP_BACKEND_ORIGIN: 'http://localhost:3001'
        };
    });

    // Restore original env after all tests
    afterAll(() => {
        process.env = originalEnv;
    });

    // Clear all mocks before each test
    beforeEach(() => {
        fetch.mockClear();
        console.error.mockClear();
        console.log.mockClear();
    });

    test('successful login returns token and user data', async () => {
        const mockResponse = {
            ok: true,
            json: () => Promise.resolve({
                token: 'test-token',
                user: {
                    id: 1,
                    name: 'Test User',
                    email: 'test@example.com',
                    role: 'user'
                }
            })
        };

        fetch.mockResolvedValueOnce(mockResponse);

        const credentials = {
            email: 'test@example.com',
            password: 'password123'
        };

        const result = await login(credentials);

        expect(fetch).toHaveBeenCalledWith(
            'http://localhost:3001/api/auth/login',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            }
        );

        expect(result).toEqual({
            token: 'test-token',
            user: {
                id: 1,
                name: 'Test User',
                email: 'test@example.com',
                role: 'user'
            }
        });
    });

    test('failed login throws error with message', async () => {
        const errorMessage = 'Invalid credentials';
        const mockResponse = {
            ok: false,
            json: () => Promise.resolve({
                message: errorMessage
            })
        };

        fetch.mockResolvedValueOnce(mockResponse);

        const credentials = {
            email: 'test@example.com',
            password: 'wrongpassword'
        };

        await expect(login(credentials)).rejects.toThrow(errorMessage);
    });

    test('network error is handled properly', async () => {
        const networkError = new Error('Network error');
        fetch.mockRejectedValueOnce(networkError);

        const credentials = {
            email: 'test@example.com',
            password: 'password123'
        };

        await expect(login(credentials)).rejects.toThrow('Network error');
        expect(console.error).toHaveBeenCalled();
    });

    test('malformed response throws error', async () => {
        const mockResponse = {
            ok: true,
            json: () => Promise.resolve({
                // Missing token and user data
            })
        };

        fetch.mockResolvedValueOnce(mockResponse);

        const credentials = {
            email: 'test@example.com',
            password: 'password123'
        };

        await expect(login(credentials)).rejects.toThrow();
    });

    test('handles server error with custom message', async () => {
        const mockResponse = {
            ok: false,
            json: () => Promise.resolve({
                message: 'Server error occurred'
            })
        };

        fetch.mockResolvedValueOnce(mockResponse);

        const credentials = {
            email: 'test@example.com',
            password: 'password123'
        };

        await expect(login(credentials)).rejects.toThrow('Server error occurred');
    });

    test('uses correct content type header', async () => {
        const mockResponse = {
            ok: true,
            json: () => Promise.resolve({
                token: 'test-token',
                user: {
                    id: 1,
                    name: 'Test User',
                    email: 'test@example.com',
                    role: 'user'
                }
            })
        };

        fetch.mockResolvedValueOnce(mockResponse);

        const credentials = {
            email: 'test@example.com',
            password: 'password123'
        };

        await login(credentials);

        expect(fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        );
    });

    test('logs error details on failure', async () => {
        const error = new Error('Test error');
        fetch.mockRejectedValueOnce(error);

        const credentials = {
            email: 'test@example.com',
            password: 'password123'
        };

        try {
            await login(credentials);
        } catch (e) {
            expect(console.error).toHaveBeenCalledWith(
                'Login error details:',
                expect.objectContaining({
                    error: error,
                    message: error.message
                })
            );
        }
    });
}); 