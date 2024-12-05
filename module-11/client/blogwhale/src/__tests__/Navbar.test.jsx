import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

// Mock AuthContext
jest.mock('../context/AuthContext', () => ({
    useAuth: jest.fn()
}));

describe('Navbar Component', () => {
    const mockLogout = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders common navigation links', () => {
        useAuth.mockImplementation(() => ({
            isAuthenticated: false,
            user: null,
            logout: mockLogout
        }));

        render(
            <BrowserRouter>
                <Navbar />
            </BrowserRouter>
        );

        // Check common links are always present
        expect(screen.getByText('Home')).toHaveAttribute('href', '/');
        expect(screen.getByText('Blogs')).toHaveAttribute('href', '/blogs');
        expect(screen.getByText('About')).toHaveAttribute('href', '/about');
        expect(screen.getByText('Contact')).toHaveAttribute('href', '/contact');
    });

    test('renders login link when not authenticated', () => {
        useAuth.mockImplementation(() => ({
            isAuthenticated: false,
            user: null,
            logout: mockLogout
        }));

        render(
            <BrowserRouter>
                <Navbar />
            </BrowserRouter>
        );

        expect(screen.getByText('Login')).toHaveAttribute('href', '/login');
        expect(screen.queryByText('Logout')).not.toBeInTheDocument();
        expect(screen.queryByText('Profile')).not.toBeInTheDocument();
        expect(screen.queryByText(/Welcome/)).not.toBeInTheDocument();
    });

    test('renders user navigation when authenticated as regular user', () => {
        useAuth.mockImplementation(() => ({
            isAuthenticated: true,
            user: { name: 'John Doe', email: 'john@example.com' },
            logout: mockLogout
        }));

        render(
            <BrowserRouter>
                <Navbar />
            </BrowserRouter>
        );

        expect(screen.getByText('Profile')).toHaveAttribute('href', '/profile');
        expect(screen.getByText('Logout')).toBeInTheDocument();
        expect(screen.getByText('Welcome, John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Admin Page')).not.toBeInTheDocument();
    });

    test('renders admin navigation when authenticated as admin', () => {
        useAuth.mockImplementation(() => ({
            isAuthenticated: true,
            user: { name: 'Admin', email: 'admin@example.com' },
            logout: mockLogout
        }));

        render(
            <BrowserRouter>
                <Navbar />
            </BrowserRouter>
        );

        expect(screen.getByText('Admin Page')).toHaveAttribute('href', '/admin');
        expect(screen.getByText('Logout')).toBeInTheDocument();
        expect(screen.getByText('Welcome, Admin')).toBeInTheDocument();
        expect(screen.queryByText('Profile')).not.toBeInTheDocument();
    });

    test('calls logout function when logout button is clicked', () => {
        useAuth.mockImplementation(() => ({
            isAuthenticated: true,
            user: { name: 'John Doe', email: 'john@example.com' },
            logout: mockLogout
        }));

        render(
            <BrowserRouter>
                <Navbar />
            </BrowserRouter>
        );

        const logoutButton = screen.getByText('Logout');
        fireEvent.click(logoutButton);
        expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    test('handles missing user name gracefully', () => {
        useAuth.mockImplementation(() => ({
            isAuthenticated: true,
            user: { email: 'john@example.com' }, // No name provided
            logout: mockLogout
        }));

        render(
            <BrowserRouter>
                <Navbar />
            </BrowserRouter>
        );

        expect(screen.queryByText(/Welcome/)).toBeInTheDocument();
    });

    test('applies correct CSS classes to navigation links', () => {
        useAuth.mockImplementation(() => ({
            isAuthenticated: false,
            user: null,
            logout: mockLogout
        }));

        render(
            <BrowserRouter>
                <Navbar />
            </BrowserRouter>
        );

        const homeLink = screen.getByText('Home');
        expect(homeLink).toHaveClass(
            'text-white',
            'hover:text-gray-200',
            'font-medium',
            'px-3',
            'py-2',
            'rounded-md',
            'transition',
            'duration-150',
            'ease-in-out'
        );
    });
});
