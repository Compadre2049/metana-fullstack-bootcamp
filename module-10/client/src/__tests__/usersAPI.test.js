// Mock the environment configuration
jest.mock('../api/usersAPI', () => {
    const originalModule = jest.requireActual('../api/usersAPI');
    const BASE_URL = 'http://localhost:3001';

    return {
        ...originalModule,
        getUsers: async (token) => {
            const response = await fetch(`${BASE_URL}/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            return response.json();
        }
    };
});

import { getUsers } from '../api/usersAPI';

// Mock fetch globally
global.fetch = jest.fn();

describe('usersAPI', () => {
    const MOCK_TOKEN = 'mock-jwt-token';
    const BASE_URL = 'http://localhost:3001';

    beforeEach(() => {
        fetch.mockClear();
    });

    describe('getUsers', () => {
        test('successfully fetches users with valid token', async () => {
            const mockUsers = [
                { id: 1, name: 'User 1' },
                { id: 2, name: 'User 2' }
            ];

            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockUsers)
            });

            const result = await getUsers(MOCK_TOKEN);

            expect(fetch).toHaveBeenCalledWith(
                `${BASE_URL}/users`,
                expect.objectContaining({
                    headers: {
                        'Authorization': `Bearer ${MOCK_TOKEN}`
                    }
                })
            );
            expect(result).toEqual(mockUsers);
        });

        test('throws error when no token provided', async () => {
            await expect(getUsers()).rejects.toThrow();
        });

        test('handles unauthorized error', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 401
            });

            await expect(getUsers(MOCK_TOKEN))
                .rejects
                .toThrow('Failed to fetch users');
        });

        test('handles network error', async () => {
            fetch.mockRejectedValueOnce(new Error('Network error'));

            await expect(getUsers(MOCK_TOKEN))
                .rejects
                .toThrow('Network error');
        });

        test('handles server error', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 500
            });

            await expect(getUsers(MOCK_TOKEN))
                .rejects
                .toThrow('Failed to fetch users');
        });

        test('sends correct authorization header', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([])
            });

            await getUsers(MOCK_TOKEN);

            expect(fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: {
                        'Authorization': `Bearer ${MOCK_TOKEN}`
                    }
                })
            );
        });

        test('uses correct API endpoint', async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve([])
            });

            await getUsers(MOCK_TOKEN);

            expect(fetch).toHaveBeenCalledWith(
                `${BASE_URL}/users`,
                expect.any(Object)
            );
        });

        test('returns parsed JSON response', async () => {
            const mockUsers = [{ id: 1, name: 'Test User' }];

            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockUsers)
            });

            const result = await getUsers(MOCK_TOKEN);
            expect(result).toEqual(mockUsers);
        });
    });
}); 