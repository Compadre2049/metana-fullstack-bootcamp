import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Blogs from '../pages/Blogs';
import { useAuth } from '../context/AuthContext';

jest.mock('../context/AuthContext', () => ({
    useAuth: jest.fn()
}));

describe('Blogs Component', () => {
    const mockBlogsResponse = {
        success: true,
        data: [
            {
                _id: '1',
                title: 'First Blog',
                content: 'This is the first blog content that is long enough to be truncated in the preview...',
                createdAt: '2024-01-01T00:00:00.000Z',
                user: {
                    _id: 'user1',
                    name: 'John Doe'
                }
            },
            {
                _id: '2',
                title: 'Second Blog',
                content: 'This is the second blog content with enough characters to see the truncation...',
                createdAt: '2024-01-02T00:00:00.000Z',
                user: {
                    _id: 'user2',
                    name: 'Jane Doe'
                }
            }
        ]
    };

    beforeEach(() => {
        global.fetch = jest.fn();
        localStorage.clear();
        localStorage.setItem('token', 'fake-token');
    });

    test('renders loading state initially', () => {
        global.fetch.mockImplementationOnce(() => new Promise(() => { }));

        useAuth.mockImplementation(() => ({
            isAuthenticated: false
        }));

        render(
            <BrowserRouter>
                <Blogs />
            </BrowserRouter>
        );

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('renders blogs when fetch succeeds', async () => {
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockBlogsResponse)
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
            expect(screen.getByText('First Blog')).toBeInTheDocument();
            expect(screen.getByText('Second Blog')).toBeInTheDocument();
        });

        // Check for truncated content
        expect(screen.getByText(/This is the first blog content/)).toBeInTheDocument();
        expect(screen.getByText(/This is the second blog content/)).toBeInTheDocument();

        // Check for authors
        expect(screen.getByText('By: John Doe')).toBeInTheDocument();
        expect(screen.getByText('By: Jane Doe')).toBeInTheDocument();

        // Check for dates
        const date1 = new Date('2024-01-01').toLocaleDateString();
        const date2 = new Date('2024-01-02').toLocaleDateString();
        expect(screen.getByText(`Created: ${date1}`)).toBeInTheDocument();
        expect(screen.getByText(`Created: ${date2}`)).toBeInTheDocument();
    });

    test('shows error message when fetch fails', async () => {
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: false,
                status: 500,
                json: () => Promise.reject(new Error('HTTP error! status: 500'))
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
            expect(screen.getByText('Error: HTTP error! status: 500')).toBeInTheDocument();
        });
    });

    test('shows "No blogs found" when blogs array is empty', async () => {
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ success: true, data: [] })
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
            expect(screen.getByText('No blogs found')).toBeInTheDocument();
        });
    });

    test('shows Create New Post button when authenticated', async () => {
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockBlogsResponse)
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
            const createButton = screen.getByText('Create New Post');
            expect(createButton).toBeInTheDocument();
            expect(createButton.closest('a')).toHaveAttribute('href', '/blogs/create');
        });
    });
}); 