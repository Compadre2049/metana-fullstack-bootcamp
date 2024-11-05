import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Register from '../pages/Register';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate
}));

// Increase Jest timeout
jest.setTimeout(10000);

const renderWithRouter = (component) => {
    return render(
        <BrowserRouter>
            {component}
        </BrowserRouter>
    );
};

describe('Register Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn();
    });

    test('renders registration form', () => {
        renderWithRouter(<Register />);
        expect(screen.getByPlaceholderText('Full Name')).toBeInTheDocument();
    });

    test('handles successful registration', async () => {
        const mockResponse = { message: 'Registration successful' };
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockResponse)
            })
        );

        renderWithRouter(<Register />);

        await userEvent.type(screen.getByPlaceholderText('Full Name'), 'John Doe');
        await userEvent.type(screen.getByPlaceholderText('Email address'), 'john@example.com');
        await userEvent.type(screen.getByPlaceholderText('Password'), 'password123');
        await userEvent.type(screen.getByPlaceholderText('Confirm Password'), 'password123');

        await userEvent.click(screen.getByRole('button', { name: /register/i }));

        await waitFor(() => {
            expect(screen.getByText('Registration successful! Redirecting to login...')).toBeInTheDocument();
        });

        // Wait for navigation
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        }, { timeout: 3000 });
    });

    test('shows error when passwords do not match', async () => {
        renderWithRouter(<Register />);

        await userEvent.type(screen.getByPlaceholderText('Password'), 'password123');
        await userEvent.type(screen.getByPlaceholderText('Confirm Password'), 'password456');
        await userEvent.click(screen.getByRole('button', { name: /register/i }));

        await waitFor(() => {
            expect(screen.getByText("Passwords don't match")).toBeInTheDocument();
        });
    });

    test('handles registration error from server', async () => {
        const mockError = { error: 'Email already exists' };
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: false,
                json: () => Promise.resolve(mockError)
            })
        );

        renderWithRouter(<Register />);

        await userEvent.type(screen.getByPlaceholderText('Full Name'), 'John Doe');
        await userEvent.type(screen.getByPlaceholderText('Email address'), 'john@example.com');
        await userEvent.type(screen.getByPlaceholderText('Password'), 'password123');
        await userEvent.type(screen.getByPlaceholderText('Confirm Password'), 'password123');

        await userEvent.click(screen.getByRole('button', { name: /register/i }));

        await waitFor(() => {
            expect(screen.getByText('Email already exists')).toBeInTheDocument();
        });
    });

    test('validates required fields', () => {
        renderWithRouter(<Register />);
        const submitButton = screen.getByRole('button', { name: /register/i });
        fireEvent.click(submitButton);
        expect(screen.getByPlaceholderText('Full Name')).toBeRequired();
    });

    test('disables submit button while loading', async () => {
        const mockResponse = new Promise(resolve =>
            setTimeout(() =>
                resolve({
                    ok: true,
                    json: () => Promise.resolve({ message: 'Success' })
                }), 100)
        );
        global.fetch.mockImplementationOnce(() => mockResponse);

        renderWithRouter(<Register />);

        await userEvent.type(screen.getByPlaceholderText('Password'), 'password123');
        await userEvent.type(screen.getByPlaceholderText('Confirm Password'), 'password123');

        const submitButton = screen.getByRole('button', { name: /register/i });
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(submitButton).toBeDisabled();
            expect(submitButton).toHaveClass('opacity-50');
        });
    });

    test('renders sign in link', () => {
        renderWithRouter(<Register />);

        const signInLink = screen.getByText('Sign in here');
        expect(signInLink).toBeInTheDocument();
        expect(signInLink).toHaveAttribute('href', '/login');
    });

    test('applies correct CSS classes', () => {
        renderWithRouter(<Register />);

        // Check container classes
        const container = screen.getByRole('heading', { name: /create your account/i }).parentElement.parentElement;
        expect(container).toHaveClass('max-w-md', 'w-full', 'space-y-8');

        // Check form classes
        const form = screen.getByRole('button', { name: /register/i }).closest('form');
        expect(form).toHaveClass('mt-8', 'space-y-6');

        // Check input classes
        const nameInput = screen.getByPlaceholderText('Full Name');
        expect(nameInput).toHaveClass(
            'appearance-none',
            'rounded-none',
            'relative',
            'block',
            'w-full',
            'px-3',
            'py-2',
            'border',
            'border-gray-300'
        );
    });
}); 