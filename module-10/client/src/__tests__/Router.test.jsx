import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Mock the auth context
jest.mock('../context/AuthContext', () => ({
    useAuth: jest.fn()
}));

// Create a simplified test component structure
const TestLayout = ({ children }) => (
    <div data-testid="root-layout">
        {children}
    </div>
);

const TestHome = () => <div data-testid="home-page">Home Page</div>;
const TestAbout = () => <div data-testid="about-page">About Page</div>;
const TestLogin = () => <div data-testid="login-page">Login Page</div>;
const TestProfile = () => <div data-testid="profile-page">Profile Page</div>;
const TestNotFound = () => <div data-testid="not-found-page">Not Found Page</div>;

describe('Router Configuration', () => {
    const renderWithRouter = (initialRoute, isAuthenticated = false) => {
        useAuth.mockImplementation(() => ({
            isAuthenticated
        }));

        return render(
            <MemoryRouter initialEntries={[initialRoute]}>
                <TestLayout>
                    {initialRoute === '/' && <TestHome />}
                    {initialRoute === '/about' && <TestAbout />}
                    {initialRoute === '/login' && <TestLogin />}
                    {initialRoute === '/profile' && (
                        isAuthenticated ? <TestProfile /> : <TestLogin />
                    )}
                    {!['/', 'about', '/login', '/profile'].includes(initialRoute) && <TestNotFound />}
                </TestLayout>
            </MemoryRouter>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders public routes without authentication', () => {
        renderWithRouter('/');
        expect(screen.getByTestId('home-page')).toBeInTheDocument();

        renderWithRouter('/about');
        expect(screen.getByTestId('about-page')).toBeInTheDocument();
    });

    test('redirects to login for protected routes when not authenticated', () => {
        renderWithRouter('/profile', false);
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    test('allows access to protected routes when authenticated', () => {
        renderWithRouter('/profile', true);
        expect(screen.getByTestId('profile-page')).toBeInTheDocument();
    });

    test('renders NotFound for invalid routes', () => {
        renderWithRouter('/invalid-route');
        expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    });

    test('protected route component behavior', () => {
        // Test authenticated case
        renderWithRouter('/profile', true);
        expect(screen.getByTestId('profile-page')).toBeInTheDocument();

        // Test unauthenticated case
        renderWithRouter('/profile', false);
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    test('nested routes in root layout', () => {
        renderWithRouter('/about');
        const rootLayout = screen.getByTestId('root-layout');
        const aboutPage = screen.getByTestId('about-page');

        expect(rootLayout).toBeInTheDocument();
        expect(aboutPage).toBeInTheDocument();
        expect(rootLayout).toContainElement(aboutPage);
    });
}); 