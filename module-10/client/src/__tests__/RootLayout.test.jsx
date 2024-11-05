import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RootLayout from '../components/RootLayout';

// Mock child components
jest.mock('../components/Navbar', () => {
    return function MockNavbar() {
        return <nav data-testid="mock-navbar">Mock Navbar</nav>;
    };
});

jest.mock('../components/Footer', () => {
    return function MockFooter() {
        return <footer data-testid="mock-footer">Mock Footer</footer>;
    };
});

// Mock Outlet component
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    Outlet: () => <div data-testid="mock-outlet">Mock Outlet Content</div>
}));

describe('RootLayout Component', () => {
    const renderRootLayout = () => {
        return render(
            <BrowserRouter>
                <RootLayout />
            </BrowserRouter>
        );
    };

    test('renders without crashing', () => {
        expect(() => renderRootLayout()).not.toThrow();
    });

    test('renders all main components', () => {
        renderRootLayout();
        expect(screen.getByTestId('mock-navbar')).toBeInTheDocument();
        expect(screen.getByTestId('mock-outlet')).toBeInTheDocument();
        expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    });

    test('has correct structure and order', () => {
        renderRootLayout();
        const rootDiv = screen.getByTestId('mock-navbar').parentElement;
        const children = Array.from(rootDiv.children);

        expect(children[0]).toBe(screen.getByTestId('mock-navbar'));
        expect(children[1]).toContainElement(screen.getByTestId('mock-outlet'));
        expect(children[2]).toBe(screen.getByTestId('mock-footer'));
    });

    test('main content area has correct styling', () => {
        renderRootLayout();
        const main = screen.getByRole('main');
        expect(main).toHaveClass(
            'flex-grow',
            'container',
            'mx-auto',
            'px-4',
            'py-8'
        );
    });

    test('root container has correct styling', () => {
        renderRootLayout();
        const rootDiv = screen.getByTestId('mock-navbar').parentElement;
        expect(rootDiv).toHaveClass('flex', 'flex-col', 'min-h-screen');
    });

    test('renders outlet content in main section', () => {
        renderRootLayout();
        const main = screen.getByRole('main');
        const outlet = screen.getByTestId('mock-outlet');
        expect(main).toContainElement(outlet);
    });

    test('maintains correct component hierarchy', () => {
        renderRootLayout();
        const rootDiv = screen.getByTestId('mock-navbar').parentElement;

        // Check direct children count
        expect(rootDiv.children).toHaveLength(3);

        // Check main content wrapper
        const main = screen.getByRole('main');
        expect(main.children).toHaveLength(1);
        expect(main.firstChild).toBe(screen.getByTestId('mock-outlet'));
    });

    test('components receive correct props', () => {
        renderRootLayout();

        // Check if components are rendered with their test IDs
        expect(screen.getByTestId('mock-navbar')).toBeInTheDocument();
        expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
        expect(screen.getByTestId('mock-outlet')).toBeInTheDocument();
    });
}); 