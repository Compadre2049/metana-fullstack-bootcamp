import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EditBlog from '../pages/EditBlog';

// Mock the router hooks
jest.mock('react-router-dom', () => ({
    useParams: jest.fn(),
    useNavigate: jest.fn()
}));

// Mock the auth context
jest.mock('../context/AuthContext', () => ({
    useAuth: jest.fn()
}));

describe('EditBlog Component', () => {
    const mockNavigate = jest.fn();
    const mockBlogData = {
        title: 'Test Blog',
        content: 'Test Content',
        author: { email: 'author@example.com' }
    };

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Setup router mocks
        useParams.mockReturnValue({ id: '123' });
        useNavigate.mockReturnValue(mockNavigate);

        // Setup auth mock
        useAuth.mockReturnValue({
            user: { email: 'author@example.com' },
            isAuthenticated: true
        });

        // Setup fetch mock
        global.fetch = jest.fn();
        localStorage.setItem('token', 'fake-token');
    });

    test('loads and displays blog data', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockBlogData)
        });

        render(<EditBlog />);

        expect(screen.getByText('Loading...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByLabelText('Title')).toHaveValue('Test Blog');
            expect(screen.getByLabelText('Content')).toHaveValue('Test Content');
        });
    });

    test('redirects if user is not authorized', async () => {
        // Set user as non-author
        useAuth.mockReturnValue({
            user: { email: 'other@example.com' },
            isAuthenticated: true
        });

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockBlogData)
        });

        render(<EditBlog />);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/blogs/123');
        });
    });

    test('handles form submission successfully', async () => {
        global.fetch
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockBlogData)
            })
            .mockResolvedValueOnce({
                ok: true
            });

        render(<EditBlog />);

        await waitFor(() => {
            expect(screen.getByLabelText('Title')).toBeInTheDocument();
        });

        // Update form fields
        await userEvent.clear(screen.getByLabelText('Title'));
        await userEvent.type(screen.getByLabelText('Title'), 'Updated Title');
        await userEvent.clear(screen.getByLabelText('Content'));
        await userEvent.type(screen.getByLabelText('Content'), 'Updated Content');

        // Submit form
        fireEvent.click(screen.getByText('Save Changes'));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/blogs/123'),
                expect.objectContaining({
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer fake-token'
                    },
                    body: JSON.stringify({
                        title: 'Updated Title',
                        content: 'Updated Content'
                    })
                })
            );
            expect(mockNavigate).toHaveBeenCalledWith('/blogs/123');
        });
    });

    test('handles fetch error', async () => {
        global.fetch.mockRejectedValueOnce(new Error('Fetch failed'));

        render(<EditBlog />);

        await waitFor(() => {
            expect(screen.getByText('Failed to load blog')).toBeInTheDocument();
        });
    });

    test('handles update error', async () => {
        global.fetch
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockBlogData)
            })
            .mockRejectedValueOnce(new Error('Update failed'));

        render(<EditBlog />);

        await waitFor(() => {
            expect(screen.getByLabelText('Title')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Save Changes'));

        await waitFor(() => {
            expect(screen.getByText('Failed to update blog')).toBeInTheDocument();
        });
    });

    test('cancel button navigates back to blog page', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockBlogData)
        });

        render(<EditBlog />);

        await waitFor(() => {
            expect(screen.getByText('Cancel')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Cancel'));
        expect(mockNavigate).toHaveBeenCalledWith('/blogs/123');
    });

    test('allows admin to edit any blog', async () => {
        useAuth.mockReturnValue({
            user: { email: 'admin@example.com' },
            isAuthenticated: true
        });

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockBlogData)
        });

        render(<EditBlog />);

        await waitFor(() => {
            expect(screen.getByLabelText('Title')).toHaveValue('Test Blog');
        });

        expect(mockNavigate).not.toHaveBeenCalled();
    });
}); 