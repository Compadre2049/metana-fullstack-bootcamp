import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Blogs from '../pages/Blogs';
import { useAuth } from '../context/AuthContext';

// Mock the auth context
jest.mock('../context/AuthContext', () => ({
    useAuth: jest.fn()
}));

describe('Blogs Component', () => {
    const mockBlogs = [
        {
            _id: '1',
            title: 'First Blog',
            content: 'This is the first blog content that is long enough to be truncated in the preview...',
            createdAt: '2024-01-01T00:00:00.000Z'
        },
        {
            _id: '2',
            title: 'Second Blog',
            content: 'This is the second blog content with enough characters to see the truncation...',
            createdAt: '2024-01-02T00:00:00.000Z'
        }
    ];

    beforeEach(() => {
        // Reset fetch mock before each test
        global.fetch = jest.fn();
        process.env.REACT_APP_BACKEND_ORIGIN = 'http://localhost:3000';
    });

    test('renders loading state initially (no blogs yet)', () => {
        // Mock fetch to never resolve
        global.fetch.mockImplementationOnce(() => new Promise(() => { }));

        useAuth.mockImplementation(() => ({
            isAuthenticated: false
        }));

        render(
            <BrowserRouter>
                <Blogs />
            </BrowserRouter>
        );

        expect(screen.getByText('Blogs')).toBeInTheDocument();
        expect(screen.queryByText('Create New Post')).not.toBeInTheDocument();
    });

    test('renders blogs when fetch succeeds', async () => {
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockBlogs)
            })
        );

        useAuth.mockImplementation(() => ({
            isAuthenticated: false
        }));

        render(
            <BrowserRouter>
                <Blogs />
            </BrowserRouter>
        );

        await waitFor(() => {
            // Check titles
            expect(screen.getByText('First Blog')).toBeInTheDocument();
            expect(screen.getByText('Second Blog')).toBeInTheDocument();

            // Check content using regex to match partial content
            const firstBlogContent = screen.getByText(/This is the first blog content/);
            const secondBlogContent = screen.getByText(/This is the second blog content/);
            expect(firstBlogContent).toBeInTheDocument();
            expect(secondBlogContent).toBeInTheDocument();

            // Check dates are present
            expect(screen.getAllByText(/Created:/)).toHaveLength(2);
        });

        // Verify links
        const links = screen.getAllByRole('link', { name: /Blog$/ });
        expect(links).toHaveLength(2);
        expect(links[0]).toHaveAttribute('href', '/blogs/1');
        expect(links[1]).toHaveAttribute('href', '/blogs/2');
    });

    test('shows error message when fetch fails', async () => {
        global.fetch.mockImplementationOnce(() =>
            Promise.reject(new Error('Failed to fetch blogs'))
        );

        useAuth.mockImplementation(() => ({
            isAuthenticated: false
        }));

        render(
            <BrowserRouter>
                <Blogs />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Error: Failed to fetch blogs')).toBeInTheDocument();
        });
    });

    test('shows Create New Post button when authenticated', async () => {
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockBlogs)
            })
        );

        useAuth.mockImplementation(() => ({
            isAuthenticated: true
        }));

        render(
            <BrowserRouter>
                <Blogs />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Create New Post')).toBeInTheDocument();
        });
    });

    test('hides Create New Post button when not authenticated', async () => {
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockBlogs)
            })
        );

        useAuth.mockImplementation(() => ({
            isAuthenticated: false
        }));

        render(
            <BrowserRouter>
                <Blogs />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.queryByText('Create New Post')).not.toBeInTheDocument();
        });
    });

    test('renders blog links correctly', async () => {
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockBlogs)
            })
        );

        useAuth.mockImplementation(() => ({
            isAuthenticated: false
        }));

        render(
            <BrowserRouter>
                <Blogs />
            </BrowserRouter>
        );

        await waitFor(() => {
            const blogLinks = screen.getAllByRole('link');
            expect(blogLinks).toHaveLength(2); // Two blog title links
            expect(blogLinks[0]).toHaveAttribute('href', '/blogs/1');
            expect(blogLinks[1]).toHaveAttribute('href', '/blogs/2');
        });
    });
}); 