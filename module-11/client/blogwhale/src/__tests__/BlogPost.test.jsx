import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BlogPost from '../pages/BlogPost';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({ id: '1' }),
    useNavigate: () => jest.fn()
}));

// Mock AuthContext
jest.mock('../context/AuthContext', () => ({
    useAuth: () => ({
        isAuthenticated: false,
        user: null
    })
}));

describe('BlogPost Component', () => {
    const mockBlog = {
        _id: '1',
        title: 'Test Blog',
        content: 'Test content',
        user: {
            _id: '123',
            name: 'John Doe',
            email: 'test@example.com'
        },
        createdAt: '2024-01-01T00:00:00.000Z'
    };

    beforeEach(() => {
        // Reset fetch mock before each test
        global.fetch = jest.fn();
        process.env.REACT_APP_BACKEND_ORIGIN = 'http://localhost:3000';
    });

    test('renders loading state initially', () => {
        global.fetch.mockImplementationOnce(() => new Promise(() => { }));

        render(
            <BrowserRouter>
                <BlogPost />
            </BrowserRouter>
        );

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('renders blog post when fetch succeeds', async () => {
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockBlog)
            })
        );

        render(
            <BrowserRouter>
                <BlogPost />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Blog')).toBeInTheDocument();
            expect(screen.getByText('Test content')).toBeInTheDocument();
            expect(screen.getByText('By John Doe')).toBeInTheDocument();
            expect(screen.getByText(/Created:/)).toBeInTheDocument();
        });
    });

    test('renders error message when fetch fails', async () => {
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: false
            })
        );

        render(
            <BrowserRouter>
                <BlogPost />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Failed to load blog post')).toBeInTheDocument();
        });
    });

    test('shows edit and delete buttons for author', async () => {
        // Mock auth context to return authenticated user
        jest.spyOn(require('../context/AuthContext'), 'useAuth')
            .mockImplementation(() => ({
                isAuthenticated: true,
                user: { email: 'test@example.com' }
            }));

        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    ...mockBlog,
                    author: { email: 'test@example.com' }
                })
            })
        );

        render(
            <BrowserRouter>
                <BlogPost />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Edit')).toBeInTheDocument();
            expect(screen.getByText('Delete')).toBeInTheDocument();
        });
    });

    test('shows delete confirmation modal', async () => {
        // Mock auth context to return authenticated user
        jest.spyOn(require('../context/AuthContext'), 'useAuth')
            .mockImplementation(() => ({
                isAuthenticated: true,
                user: { email: 'test@example.com' }
            }));

        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    ...mockBlog,
                    author: { email: 'test@example.com' }
                })
            })
        );

        render(
            <BrowserRouter>
                <BlogPost />
            </BrowserRouter>
        );

        await waitFor(() => {
            const deleteButton = screen.getByText('Delete');
            fireEvent.click(deleteButton);
        });

        expect(screen.getByText('Delete Blog')).toBeInTheDocument();
        expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    test('handles delete confirmation', async () => {
        const mockNavigate = jest.fn();
        jest.spyOn(require('react-router-dom'), 'useNavigate')
            .mockImplementation(() => mockNavigate);

        jest.spyOn(require('../context/AuthContext'), 'useAuth')
            .mockImplementation(() => ({
                isAuthenticated: true,
                user: { email: 'test@example.com' }
            }));

        global.fetch
            .mockImplementationOnce(() => // GET blog
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        ...mockBlog,
                        author: { email: 'test@example.com' }
                    })
                })
            )
            .mockImplementationOnce(() => // DELETE blog
                Promise.resolve({ ok: true })
            );

        render(
            <BrowserRouter>
                <BlogPost />
            </BrowserRouter>
        );

        // Wait for blog to load and click the initial delete button
        await waitFor(() => {
            // Get the delete button in the main view (not in modal)
            const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
            const mainDeleteButton = deleteButtons.find(button =>
                button.className.includes('bg-red-500 text-white px-4 py-2 rounded')
            );
            fireEvent.click(mainDeleteButton);
        });

        // Click the delete button in the modal
        const modalDeleteButtons = screen.getAllByRole('button', { name: 'Delete' });
        const confirmDeleteButton = modalDeleteButtons.find(button =>
            button.className.includes('px-4 py-2 text-sm font-medium text-white bg-red-500')
        );
        fireEvent.click(confirmDeleteButton);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/blogs');
        });
    });
}); 