import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BlogPost from '../pages/BlogPost';

// Mock modules
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({ id: '1' }),
    useNavigate: () => mockNavigate
}));

// Mock AuthContext
jest.mock('../context/AuthContext', () => ({
    useAuth: () => ({
        isAuthenticated: false,
        user: null
    })
}));

describe('BlogPost Component', () => {
    const mockBlogResponse = {
        success: true,
        data: {
            _id: '1',
            title: 'Test Blog',
            content: 'Test content',
            user: {
                _id: '123',
                name: 'John Doe',
                email: 'test@example.com'
            },
            createdAt: '2024-01-01T00:00:00.000Z'
        }
    };

    beforeEach(() => {
        global.fetch = jest.fn();
        mockNavigate.mockClear();
        localStorage.clear();
        localStorage.setItem('token', 'fake-token');
    });

    it('renders loading state and then blog post content', async () => {
        // Mock successful blog fetch
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockBlogResponse)
        });

        render(
            <BrowserRouter>
                <BlogPost />
            </BrowserRouter>
        );

        // Check for loading skeleton
        expect(document.querySelector('.animate-pulse')).toBeInTheDocument();

        // Check blog content after loading
        await waitFor(() => {
            expect(screen.getByText('Test Blog')).toBeInTheDocument();
            expect(screen.getByText('Test content')).toBeInTheDocument();
            expect(screen.getByText('By John Doe')).toBeInTheDocument();
        });
    });

    it('handles failed blog fetch', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            status: 404
        });

        render(
            <BrowserRouter>
                <BlogPost />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Blog post not found')).toBeInTheDocument();
            expect(screen.getByText('Return to Blogs')).toBeInTheDocument();
        });
    });

    it('shows and handles delete flow for author', async () => {
        // Mock authenticated user as author
        jest.spyOn(require('../context/AuthContext'), 'useAuth')
            .mockImplementation(() => ({
                isAuthenticated: true,
                user: {
                    id: '123',
                    role: 'normal'
                }
            }));

        // Mock successful blog fetch and delete
        global.fetch
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockBlogResponse)
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ success: true })
            });

        render(
            <BrowserRouter>
                <BlogPost />
            </BrowserRouter>
        );

        // Wait for blog to load
        await waitFor(() => {
            expect(screen.getByText('Test Blog')).toBeInTheDocument();
        });

        // Click the initial delete button (in the blog view)
        const initialDeleteButton = screen.getAllByRole('button').find(
            button => button.textContent === 'Delete' &&
                !button.className.includes('text-sm')
        );
        fireEvent.click(initialDeleteButton);

        // Check modal content
        expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();

        // Click the confirm delete button (in the modal)
        const confirmDeleteButton = screen.getAllByRole('button').find(
            button => button.textContent === 'Delete' &&
                button.className.includes('text-sm')
        );
        fireEvent.click(confirmDeleteButton);

        // Verify navigation after delete
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/blogs');
        });
    });
}); 