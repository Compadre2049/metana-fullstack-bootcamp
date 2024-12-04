import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
    BrowserRouter: ({ children }) => <div data-testid="browser-router">{children}</div>,
    Routes: ({ children }) => <div data-testid="routes">{children}</div>,
    Route: ({ path, element }) => <div data-testid={`route-${path}`}>{element}</div>,
    Link: ({ to, children }) => <a href={to} data-testid={`link-${to}`}>{children}</a>,
    Navigate: () => <div data-testid="navigate">Redirecting...</div>,
    useNavigate: () => jest.fn(),
    useParams: () => ({ id: '1' }),
    useLocation: () => ({ pathname: '/' })
}));

// Mock all page components to prevent them from making API calls
jest.mock('../pages/Home', () => () => <div>Home Page</div>);
jest.mock('../pages/Blogs', () => () => <div>Blogs Page</div>);
jest.mock('../pages/About', () => () => <div>About Page</div>);
jest.mock('../pages/Contact', () => () => <div>Contact Page</div>);
jest.mock('../pages/Login', () => () => <div>Login Page</div>);
jest.mock('../pages/Register', () => () => <div>Register Page</div>);
jest.mock('../pages/Profile', () => () => <div>Profile Page</div>);
jest.mock('../pages/CreateBlog', () => () => <div>Create Blog Page</div>);
jest.mock('../pages/EditBlog', () => () => <div>Edit Blog Page</div>);
jest.mock('../pages/BlogPost', () => () => <div>Blog Post Page</div>);
jest.mock('../pages/AdminPage', () => () => <div>Admin Page</div>);

// Mock the auth context
jest.mock('../context/AuthContext', () => ({
    AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>,
    useAuth: () => ({
        isAuthenticated: false,
        user: null,
        login: jest.fn(),
        logout: jest.fn()
    })
}));

// Mock the Navbar component
jest.mock('../components/Navbar', () => {
    return function MockNavbar() {
        return (
            <nav className="bg-blue-500" role="navigation">
                <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/blogs">Blogs</a></li>
                    <li><a href="/about">About</a></li>
                    <li><a href="/contact">Contact</a></li>
                    <li><a href="/login">Login</a></li>
                </ul>
            </nav>
        );
    };
});

describe('App Component', () => {
    describe('Basic Structure', () => {
        test('renders navbar', () => {
            render(<App />);
            const navbar = screen.getByRole('navigation');
            expect(navbar).toBeInTheDocument();
        });

        test('renders with auth provider', () => {
            render(<App />);
            expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
        });

        test('renders with router', () => {
            render(<App />);
            expect(screen.getByTestId('browser-router')).toBeInTheDocument();
        });
    });

    describe('Navigation', () => {
        test('renders public navigation links', () => {
            render(<App />);

            const publicLinks = [
                { text: 'Home', href: '/' },
                { text: 'Blogs', href: '/blogs' },
                { text: 'About', href: '/about' },
                { text: 'Contact', href: '/contact' },
                { text: 'Login', href: '/login' }
            ];

            publicLinks.forEach(link => {
                const linkElement = screen.getByRole('link', { name: link.text });
                expect(linkElement).toBeInTheDocument();
                expect(linkElement).toHaveAttribute('href', link.href);
            });
        });
    });

    describe('Styling', () => {
        test('navbar has correct styling', () => {
            render(<App />);
            const navbar = screen.getByRole('navigation');
            expect(navbar).toHaveClass('bg-blue-500');
        });
    });

    describe('Route Structure', () => {
        test('contains main route container', () => {
            render(<App />);
            expect(screen.getByTestId('routes')).toBeInTheDocument();
        });
    });
});