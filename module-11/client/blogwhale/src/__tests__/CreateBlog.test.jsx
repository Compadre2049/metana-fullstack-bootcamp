import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CreateBlog from '../pages/CreateBlog';

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate
}));

describe('CreateBlog Component', () => {
    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        global.fetch = jest.fn();
        localStorage.clear();
        localStorage.setItem('token', 'fake-token');
        process.env.REACT_APP_BACKEND_ORIGIN = 'http://localhost:3000';
    });

    test('renders create blog form', () => {
        render(
            <BrowserRouter>
                <CreateBlog />
            </BrowserRouter>
        );

        expect(screen.getByText('Create New Blog Post')).toBeInTheDocument();
        expect(screen.getByLabelText('Title')).toBeInTheDocument();
        expect(screen.getByLabelText('Content')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Create Post' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    test('handles form submission successfully', async () => {
        const mockBlog = {
            _id: '123',
            title: 'Test Blog',
            content: 'Test content'
        };

        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockBlog)
            })
        );

        render(
            <BrowserRouter>
                <CreateBlog />
            </BrowserRouter>
        );

        // Fill out the form
        fireEvent.change(screen.getByLabelText('Title'), {
            target: { value: 'Test Blog' }
        });
        fireEvent.change(screen.getByLabelText('Content'), {
            target: { value: 'Test content' }
        });

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: 'Create Post' }));

        // Check if fetch was called with correct data
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/blogs',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer fake-token'
                    },
                    body: JSON.stringify({
                        title: 'Test Blog',
                        content: 'Test content'
                    })
                }
            );
        });

        // Check if navigation occurred
        expect(mockNavigate).toHaveBeenCalledWith('/blogs/123');
    });

    test('handles form submission error', async () => {
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: false,
                status: 400
            })
        );

        render(
            <BrowserRouter>
                <CreateBlog />
            </BrowserRouter>
        );

        // Fill out the form
        fireEvent.change(screen.getByLabelText('Title'), {
            target: { value: 'Test Blog' }
        });
        fireEvent.change(screen.getByLabelText('Content'), {
            target: { value: 'Test content' }
        });

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: 'Create Post' }));

        // Check if error message appears
        await waitFor(() => {
            expect(screen.getByText('Failed to create blog post')).toBeInTheDocument();
        });

        // Check if navigation didn't occur
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    test('cancel button navigates back to blogs', () => {
        render(
            <BrowserRouter>
                <CreateBlog />
            </BrowserRouter>
        );

        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(mockNavigate).toHaveBeenCalledWith('/blogs');
    });

    test('shows loading state during submission', async () => {
        // Mock a delayed response
        global.fetch.mockImplementationOnce(() =>
            new Promise(resolve =>
                setTimeout(() =>
                    resolve({
                        ok: true,
                        json: () => Promise.resolve({ _id: '123' })
                    }), 100)
            )
        );

        render(
            <BrowserRouter>
                <CreateBlog />
            </BrowserRouter>
        );

        // Fill out and submit the form
        fireEvent.change(screen.getByLabelText('Title'), {
            target: { value: 'Test Blog' }
        });
        fireEvent.change(screen.getByLabelText('Content'), {
            target: { value: 'Test content' }
        });
        fireEvent.click(screen.getByRole('button', { name: 'Create Post' }));

        // Check loading state
        expect(screen.getByText('Creating...')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Creating...' })).toBeDisabled();

        // Wait for submission to complete
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/blogs/123');
        });
    });
}); 