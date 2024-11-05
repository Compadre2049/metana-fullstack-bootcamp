import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import { useAuth } from '../context/AuthContext';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate
}));

// Mock AuthContext
jest.mock('../context/AuthContext', () => ({
    useAuth: jest.fn()
}));

describe('Login Component', () => {
    const mockLogin = jest.fn();

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();
        useAuth.mockImplementation(() => ({
            login: mockLogin
        }));
    });

    test('renders login form', () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
        expect(screen.getByText('Register here')).toBeInTheDocument();
    });

    test('handles successful login', async () => {
        mockLogin.mockResolvedValueOnce();

        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        // Fill in the form
        fireEvent.change(screen.getByPlaceholderText('Email address'), {
            target: { value: 'test@example.com' }
        });
        fireEvent.change(screen.getByPlaceholderText('Password'), {
            target: { value: 'password123' }
        });

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

        // Verify login was called with correct credentials
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');

        // Verify navigation after successful login
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/blogs');
        });
    });

    test('handles login failure', async () => {
        const errorMessage = 'Invalid credentials';
        mockLogin.mockRejectedValueOnce(new Error(errorMessage));

        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        // Fill in the form
        fireEvent.change(screen.getByPlaceholderText('Email address'), {
            target: { value: 'test@example.com' }
        });
        fireEvent.change(screen.getByPlaceholderText('Password'), {
            target: { value: 'wrongpassword' }
        });

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

        // Verify error message is displayed
        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
        });

        // Verify navigation didn't occur
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    test('navigates to register page when clicking register link', () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        const registerLink = screen.getByText('Register here');
        expect(registerLink).toHaveAttribute('href', '/register');
    });

    test('requires email and password fields', () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        const emailInput = screen.getByPlaceholderText('Email address');
        const passwordInput = screen.getByPlaceholderText('Password');

        expect(emailInput).toBeRequired();
        expect(passwordInput).toBeRequired();
    });

    test('validates email format', () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        const emailInput = screen.getByPlaceholderText('Email address');
        expect(emailInput).toHaveAttribute('type', 'email');
    });
}); 