import { login, logout, getToken, isAuthenticated } from '../controllers/auth';
import { login as loginAPI } from '../api/authAPI';

// Mock the authAPI
jest.mock('../api/authAPI', () => ({
    login: jest.fn()
}));

// Mock localStorage
const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('Auth Controller', () => {
    const mockUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com'
    };

    const mockToken = 'test-token';

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
        mockLocalStorage.getItem.mockReturnValue(null);
    });

    describe('login', () => {
        test('successfully logs in user and stores token and user data', async () => {
            const mockResponse = {
                token: mockToken,
                user: mockUser
            };

            loginAPI.mockResolvedValueOnce(mockResponse);

            const response = await login('test@example.com', 'password');

            expect(loginAPI).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password'
            });

            expect(localStorage.setItem).toHaveBeenCalledWith('token', mockToken);
            expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
            expect(response).toEqual(mockResponse);
        });

        test('throws error when no token is received', async () => {
            loginAPI.mockResolvedValueOnce({ user: mockUser });

            await expect(login('test@example.com', 'password'))
                .rejects
                .toThrow('No token received');
        });

        test('throws error when API call fails', async () => {
            const error = new Error('Invalid credentials');
            loginAPI.mockRejectedValueOnce(error);

            await expect(login('test@example.com', 'password'))
                .rejects
                .toThrow('Invalid credentials');
        });

        test('handles network errors', async () => {
            const networkError = new Error('Network error');
            loginAPI.mockRejectedValueOnce(networkError);

            await expect(login('test@example.com', 'password'))
                .rejects
                .toThrow('Network error');
        });
    });

    describe('logout', () => {
        test('removes token and user data from localStorage', () => {
            logout();

            expect(localStorage.removeItem).toHaveBeenCalledWith('token');
            expect(localStorage.removeItem).toHaveBeenCalledWith('user');
            expect(localStorage.removeItem).toHaveBeenCalledTimes(2);
        });

        test('can be called multiple times safely', () => {
            logout();
            logout();

            expect(localStorage.removeItem).toHaveBeenCalledTimes(4);
        });
    });

    describe('getToken', () => {
        test('returns token from localStorage', () => {
            mockLocalStorage.getItem.mockReturnValueOnce(mockToken);

            const token = getToken();

            expect(localStorage.getItem).toHaveBeenCalledWith('token');
            expect(token).toBe(mockToken);
        });

        test('returns null when no token exists', () => {
            mockLocalStorage.getItem.mockReturnValueOnce(null);

            const token = getToken();

            expect(localStorage.getItem).toHaveBeenCalledWith('token');
            expect(token).toBeNull();
        });
    });

    describe('isAuthenticated', () => {
        test('returns true when token exists', () => {
            mockLocalStorage.getItem.mockReturnValueOnce(mockToken);

            const result = isAuthenticated();

            expect(result).toBe(true);
            expect(localStorage.getItem).toHaveBeenCalledWith('token');
        });

        test('returns false when no token exists', () => {
            mockLocalStorage.getItem.mockReturnValueOnce(null);

            const result = isAuthenticated();

            expect(result).toBe(false);
            expect(localStorage.getItem).toHaveBeenCalledWith('token');
        });

        test('returns false when token is empty string', () => {
            mockLocalStorage.getItem.mockReturnValueOnce('');

            const result = isAuthenticated();

            expect(result).toBe(false);
            expect(localStorage.getItem).toHaveBeenCalledWith('token');
        });
    });
}); 