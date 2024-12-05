import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CreateBlog from '../pages/CreateBlog';
import { useAuth } from '../context/AuthContext';

// Mock AuthContext
jest.mock('../context/AuthContext', () => ({
    useAuth: jest.fn()
}));

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate
}));

describe('CreateBlog Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn();
        localStorage.clear();
        localStorage.setItem('token', 'fake-token');
        process.env.REACT_APP_BACKEND_ORIGIN = 'http://localhost:3000';

        // Mock authenticated user for all tests
        useAuth.mockImplementation(() => ({
            isAuthenticated: true
        }));
    });

    test('renders create blog form', () => {
        render(
            <BrowserRouter>
                <CreateBlog />
            </BrowserRouter>
        );

        expect(screen.getByText('Create New Blog Post')).toBeInTheDocument();
        expect(screen.getByLabelText(/Title/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Content/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Create Post' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    test('handles form submission successfully', async () => {
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    success: true,
                    data: { _id: '123' }
                })
            })
        );

        render(
            <BrowserRouter>
                <CreateBlog />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/Title/), {
            target: { value: 'Test Blog' }
        });
        fireEvent.change(screen.getByLabelText(/Content/), {
            target: { value: 'Test content' }
        });

        fireEvent.click(screen.getByRole('button', { name: 'Create Post' }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                'http://localhost:3000/api/blogs',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer fake-token'
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        title: 'Test Blog',
                        content: 'Test content'
                    })
                }
            );
        });

        expect(mockNavigate).toHaveBeenCalledWith('/blogs');
    });

    test('handles form submission error', async () => {
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: false,
                json: () => Promise.resolve({
                    success: false,
                    message: 'Failed to create blog post'
                })
            })
        );

        render(
            <BrowserRouter>
                <CreateBlog />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/Title/), {
            target: { value: 'Test Blog' }
        });
        fireEvent.change(screen.getByLabelText(/Content/), {
            target: { value: 'Test content' }
        });

        fireEvent.click(screen.getByRole('button', { name: 'Create Post' }));

        await waitFor(() => {
            expect(screen.getByText('Failed to create blog post')).toBeInTheDocument();
        });

        expect(mockNavigate).not.toHaveBeenCalled();
    });

    test('redirects to login when not authenticated', () => {
        useAuth.mockImplementation(() => ({
            isAuthenticated: false
        }));

        render(
            <BrowserRouter>
                <CreateBlog />
            </BrowserRouter>
        );

        expect(mockNavigate).toHaveBeenCalledWith('/login');
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
        global.fetch.mockImplementationOnce(() =>
            new Promise(resolve =>
                setTimeout(() =>
                    resolve({
                        ok: true,
                        json: () => Promise.resolve({
                            success: true,
                            data: { _id: '123' }
                        })
                    }), 100)
            )
        );

        render(
            <BrowserRouter>
                <CreateBlog />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/Title/), {
            target: { value: 'Test Blog' }
        });
        fireEvent.change(screen.getByLabelText(/Content/), {
            target: { value: 'Test content' }
        });
        fireEvent.click(screen.getByRole('button', { name: 'Create Post' }));

        expect(screen.getByRole('button', { name: 'Creating...' })).toBeDisabled();

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/blogs');
        });
    });
}); 