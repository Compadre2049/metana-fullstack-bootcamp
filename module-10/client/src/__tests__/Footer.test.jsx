import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '../components/Footer';

// Create a mock for userConfig
const mockUserConfig = {
    user: {
        name: 'Test User',
        email: 'test@example.com'
    },
    socialMedia: {
        github: 'https://github.com/testuser',
        linkedin: 'https://linkedin.com/in/testuser',
        twitter: ''
    }
};

// Mock the userConfig module
jest.mock('../userConfig', () => ({
    __esModule: true,
    default: {
        user: {
            name: 'Test User',
            email: 'test@example.com'
        },
        socialMedia: {
            github: 'https://github.com/testuser',
            linkedin: 'https://linkedin.com/in/testuser',
            twitter: ''
        }
    }
}));

describe('Footer Component', () => {
    beforeEach(() => {
        jest.resetModules();
    });

    test('renders user name in copyright notice', () => {
        render(<Footer />);
        expect(screen.getByText(/© 2024 Test User/)).toBeInTheDocument();
        expect(screen.getByText(/All rights reserved/)).toBeInTheDocument();
    });

    test('renders user email', () => {
        render(<Footer />);
        expect(screen.getByText(/Contact: test@example.com/)).toBeInTheDocument();
    });

    test('renders social media links for non-empty URLs', () => {
        render(<Footer />);

        const githubLink = screen.getByText('Github');
        const linkedinLink = screen.getByText('Linkedin');

        expect(githubLink).toBeInTheDocument();
        expect(linkedinLink).toBeInTheDocument();
        expect(githubLink).toHaveAttribute('href', 'https://github.com/testuser');
        expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com/in/testuser');
        expect(screen.queryByText('Twitter')).not.toBeInTheDocument();
    });

    test('social media links have correct attributes', () => {
        render(<Footer />);

        const socialLinks = screen.getAllByRole('link');
        socialLinks.forEach(link => {
            expect(link).toHaveAttribute('target', '_blank');
            expect(link).toHaveAttribute('rel', 'noopener noreferrer');
            expect(link).toHaveClass('text-blue-500', 'hover:text-blue-700');
        });
    });

    test('does not render social media section when all URLs are empty', () => {
        // Override the mock for this specific test
        jest.mock('../userConfig', () => ({
            __esModule: true,
            default: {
                user: {
                    name: 'Test User',
                    email: 'test@example.com'
                },
                socialMedia: {
                    github: '',
                    linkedin: '',
                    twitter: ''
                }
            }
        }));

        // Force a re-render with new mock
        jest.isolateModules(() => {
            const Footer = require('../components/Footer').default;
            render(<Footer />);
            const socialLinks = screen.queryAllByRole('link');
            expect(socialLinks).toHaveLength(0);
        });
    });

    test('footer has correct styling classes', () => {
        render(<Footer />);
        const footer = screen.getByRole('contentinfo');
        expect(footer).toHaveClass('bg-gray-200', 'text-black', 'p-4', 'mt-8');

        const container = footer.firstChild;
        expect(container).toHaveClass('container', 'mx-auto', 'text-center');
    });

    test('handles missing user data gracefully', () => {
        // Override the mock for this specific test
        jest.mock('../userConfig', () => ({
            __esModule: true,
            default: {
                user: {},
                socialMedia: {}
            }
        }));

        // Force a re-render with new mock
        jest.isolateModules(() => {
            const Footer = require('../components/Footer').default;
            render(<Footer />);
            expect(screen.queryByText(/© 2024/)).not.toBeInTheDocument();
            expect(screen.queryByText(/Contact:/)).not.toBeInTheDocument();
        });
    });

    test('capitalizes social media platform names', () => {
        render(<Footer />);
        const githubLink = screen.getByText('Github');
        const linkedinLink = screen.getByText('Linkedin');

        expect(githubLink).toBeInTheDocument();
        expect(linkedinLink).toBeInTheDocument();
    });
}); 