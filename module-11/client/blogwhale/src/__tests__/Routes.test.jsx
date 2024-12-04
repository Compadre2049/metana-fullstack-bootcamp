import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ROUTES } from '../routes/Routes';
import React from 'react';

// Mock all page components
jest.mock('../pages/Home', () => () => <div data-testid="home-page">Home Page</div>);
jest.mock('../pages/About', () => () => <div data-testid="about-page">About Page</div>);
jest.mock('../pages/Projects', () => () => <div data-testid="projects-page">Projects Page</div>);
jest.mock('../pages/Contact', () => () => <div data-testid="contact-page">Contact Page</div>);
jest.mock('../pages/Blogs', () => () => <div data-testid="blogs-page">Blogs Page</div>);
jest.mock('../pages/Login', () => () => <div data-testid="login-page">Login Page</div>);

describe('Routes Configuration', () => {
    afterEach(() => {
        cleanup();
    });

    test('contains all required routes', () => {
        const expectedRoutes = ['/', '/about', '/projects', '/contact', '/blogs', '/login'];
        const actualRoutes = ROUTES.map(route => route.path);
        expect(actualRoutes).toEqual(expectedRoutes);
    });

    test('each route has a valid element', () => {
        ROUTES.forEach(route => {
            expect(route.element).toBeTruthy();
            expect(React.isValidElement(route.element)).toBe(true);
        });
    });

    test('routes render correct components', () => {
        const testIdMap = {
            '/': 'home-page',
            '/about': 'about-page',
            '/projects': 'projects-page',
            '/contact': 'contact-page',
            '/blogs': 'blogs-page',
            '/login': 'login-page'
        };

        ROUTES.forEach(route => {
            render(
                <MemoryRouter>
                    {route.element}
                </MemoryRouter>
            );
            expect(screen.getByTestId(testIdMap[route.path])).toBeInTheDocument();
            cleanup();
        });
    });

    test('routes have unique paths', () => {
        const paths = ROUTES.map(route => route.path);
        const uniquePaths = [...new Set(paths)];
        expect(paths.length).toBe(uniquePaths.length);
    });

    test('all paths start with /', () => {
        ROUTES.forEach(route => {
            expect(route.path.startsWith('/')).toBe(true);
        });
    });

    test('route objects have required properties', () => {
        ROUTES.forEach(route => {
            expect(route).toHaveProperty('path');
            expect(route).toHaveProperty('element');
            expect(typeof route.path).toBe('string');
        });
    });

    test('paths are properly formatted', () => {
        ROUTES.forEach(route => {
            // Check for no trailing slashes (except root)
            if (route.path !== '/') {
                expect(route.path.endsWith('/')).toBe(false);
            }
            // Check for no double slashes
            expect(route.path.includes('//')).toBe(false);
            // Check for lowercase paths
            expect(route.path).toBe(route.path.toLowerCase());
        });
    });

    test('components render without crashing', () => {
        ROUTES.forEach(route => {
            expect(() => {
                render(
                    <MemoryRouter>
                        {route.element}
                    </MemoryRouter>
                );
            }).not.toThrow();
        });
    });
}); 