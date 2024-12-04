import { getAllBlogs, getBlogById, createBlog } from '../api/blogsAPI';

// Mock fetch globally
global.fetch = jest.fn();

// Mock console.error to avoid cluttering test output
console.error = jest.fn();

describe('blogsAPI', () => {
    const originalEnv = process.env;
    const BASE_URL = 'http://localhost:3001/api';

    beforeAll(() => {
        process.env = {
            ...originalEnv,
            REACT_APP_API_URL: BASE_URL
        };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    beforeEach(() => {
        fetch.mockClear();
        console.error.mockClear();
    });

    describe('getAllBlogs', () => {
        test('successfully fetches all blogs', async () => {
            const mockBlogs = [
                { id: 1, title: 'Blog 1' },
                { id: 2, title: 'Blog 2' }
            ];

            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockBlogs)
            });

            const result = await getAllBlogs();

            expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/blogs`);
            expect(result).toEqual(mockBlogs);
        });

        test('handles fetch error', async () => {
            fetch.mockRejectedValueOnce(new Error('Network error'));

            await expect(getAllBlogs()).rejects.toThrow('Network error');
            expect(console.error).toHaveBeenCalled();
        });

        test('handles non-ok response', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 500
            });

            await expect(getAllBlogs()).rejects.toThrow('Failed to fetch blogs');
        });
    });

    describe('getBlogById', () => {
        test('successfully fetches blog by id', async () => {
            const mockBlog = { id: 1, title: 'Test Blog' };
            const blogId = 1;

            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockBlog)
            });

            const result = await getBlogById(blogId);

            expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/blogs/${blogId}`);
            expect(result).toEqual(mockBlog);
        });

        test('handles fetch error for single blog', async () => {
            const blogId = 1;
            fetch.mockRejectedValueOnce(new Error('Network error'));

            await expect(getBlogById(blogId)).rejects.toThrow('Network error');
            expect(console.error).toHaveBeenCalled();
        });

        test('handles non-ok response for single blog', async () => {
            const blogId = 999;
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 404
            });

            await expect(getBlogById(blogId)).rejects.toThrow('Failed to fetch blog');
        });
    });

    describe('createBlog', () => {
        test('successfully creates a blog', async () => {
            const mockBlogData = { title: 'New Blog', content: 'Content' };
            const mockToken = 'test-token';
            const mockResponse = { id: 1, ...mockBlogData };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            });

            const result = await createBlog(mockBlogData, mockToken);

            expect(fetch).toHaveBeenCalledWith(
                `${BASE_URL}/blogs`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${mockToken}`
                    },
                    body: JSON.stringify(mockBlogData)
                }
            );
            expect(result).toEqual(mockResponse);
        });

        test('handles fetch error for blog creation', async () => {
            const mockBlogData = { title: 'New Blog', content: 'Content' };
            const mockToken = 'test-token';

            fetch.mockRejectedValueOnce(new Error('Network error'));

            await expect(createBlog(mockBlogData, mockToken)).rejects.toThrow('Network error');
            expect(console.error).toHaveBeenCalled();
        });

        test('handles non-ok response for blog creation', async () => {
            const mockBlogData = { title: 'New Blog', content: 'Content' };
            const mockToken = 'test-token';

            fetch.mockResolvedValueOnce({
                ok: false,
                status: 400
            });

            await expect(createBlog(mockBlogData, mockToken)).rejects.toThrow('Failed to create blog');
        });

        test('sends correct headers and body', async () => {
            const mockBlogData = { title: 'New Blog', content: 'Content' };
            const mockToken = 'test-token';

            fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ id: 1, ...mockBlogData })
            });

            await createBlog(mockBlogData, mockToken);

            expect(fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${mockToken}`
                    },
                    body: JSON.stringify(mockBlogData)
                })
            );
        });
    });
}); 