import { getPrivateData, updatePrivateData } from '../api/privateAPI';

// Mock fetch globally
global.fetch = jest.fn();

// Mock console.error to avoid cluttering test output
console.error = jest.fn();

// Mock localStorage using jest.spyOn
const mockGetItem = jest.fn();
const mockSetItem = jest.fn();

Object.defineProperty(window, 'localStorage', {
    value: {
        getItem: mockGetItem,
        setItem: mockSetItem,
    },
    writable: true
});

describe('privateAPI', () => {
    const originalEnv = process.env;
    const BASE_URL = 'http://localhost:3001';
    const MOCK_TOKEN = 'mock-jwt-token';

    beforeAll(() => {
        process.env = {
            ...originalEnv,
            REACT_APP_BACKEND_ORIGIN: BASE_URL
        };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    beforeEach(() => {
        fetch.mockClear();
        console.error.mockClear();
        mockGetItem.mockClear();
        mockGetItem.mockReturnValue(MOCK_TOKEN);
    });

    describe('getPrivateData', () => {
        test('successfully fetches private data with valid token', async () => {
            const mockData = { secretData: 'private information' };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockData)
            });

            const result = await getPrivateData();

            expect(fetch).toHaveBeenCalledWith(
                `${BASE_URL}/api/private`,
                expect.objectContaining({
                    headers: {
                        'Authorization': `Bearer ${MOCK_TOKEN}`
                    }
                })
            );
            expect(result).toEqual(mockData);
        });

        test('handles unauthorized error', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 401
            });

            await expect(getPrivateData()).rejects.toThrow('Failed to fetch admin data');
            expect(console.error).toHaveBeenCalled();
        });

        test('handles network error', async () => {
            fetch.mockRejectedValueOnce(new Error('Network error'));

            await expect(getPrivateData()).rejects.toThrow('Network error');
            expect(console.error).toHaveBeenCalled();
        });

        test('checks if token is retrieved from localStorage', async () => {
            const mockData = { secretData: 'private information' };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockData)
            });

            await getPrivateData();
            expect(mockGetItem).toHaveBeenCalledWith('token');
        });
    });

    describe('updatePrivateData', () => {
        test('successfully updates private data with valid token', async () => {
            const mockData = { newData: 'updated information' };
            const mockResponse = { success: true, ...mockData };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            const result = await updatePrivateData(mockData);

            expect(fetch).toHaveBeenCalledWith(
                `${BASE_URL}/private`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${MOCK_TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(mockData)
                }
            );
            expect(result).toEqual(mockResponse);
        });

        test('throws error when no token is found', async () => {
            mockGetItem.mockReturnValueOnce(null);

            await expect(updatePrivateData({}))
                .rejects
                .toThrow('No authentication token found');
        });

        test('handles server error response', async () => {
            const errorMessage = 'Server error';
            fetch.mockResolvedValueOnce({
                ok: false,
                text: () => Promise.resolve(errorMessage)
            });

            await expect(updatePrivateData({}))
                .rejects
                .toThrow(errorMessage);
        });

        test('handles network error during update', async () => {
            fetch.mockRejectedValueOnce(new Error('Network error'));

            await expect(updatePrivateData({}))
                .rejects
                .toThrow('Network error');
            expect(console.error).toHaveBeenCalled();
        });

        test('sends correct headers and body format', async () => {
            const mockData = { test: 'data' };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ success: true })
            });

            await updatePrivateData(mockData);

            expect(fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${MOCK_TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(mockData)
                })
            );
        });
    });
}); 