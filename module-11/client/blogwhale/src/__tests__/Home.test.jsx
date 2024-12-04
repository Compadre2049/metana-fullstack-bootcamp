import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';

// Helper function to render with Router
const renderWithRouter = (component) => {
    return render(
        <BrowserRouter>
            {component}
        </BrowserRouter>
    );
};

describe('Home Component', () => {
    test('renders welcome message', () => {
        renderWithRouter(<Home />);
        const heading = screen.getByRole('heading', {
            name: /welcome to blogfrog/i,
            level: 1
        });
        expect(heading).toBeInTheDocument();
    });

    test('renders subheading text', () => {
        renderWithRouter(<Home />);
        const subheading = screen.getByText(
            /explore our latest articles and stay informed!/i
        );
        expect(subheading).toBeInTheDocument();
    });

    test('renders View Blogs link', () => {
        renderWithRouter(<Home />);
        const link = screen.getByRole('link', { name: /view blogs/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/blogs');
    });

    test('applies correct CSS classes', () => {
        renderWithRouter(<Home />);

        // Check container class
        const container = screen.getByRole('heading', {
            name: /welcome to blogfrog/i
        }).parentElement;
        expect(container).toHaveClass('text-center');

        // Check heading classes
        const heading = screen.getByRole('heading', {
            name: /welcome to blogfrog/i
        });
        expect(heading).toHaveClass('text-4xl', 'font-bold', 'mb-4');

        // Check subheading classes
        const subheading = screen.getByText(
            /explore our latest articles and stay informed!/i
        );
        expect(subheading).toHaveClass('text-xl', 'text-gray-600', 'mb-8');

        // Check link classes
        const link = screen.getByRole('link', { name: /view blogs/i });
        expect(link).toHaveClass(
            'bg-blue-500',
            'text-white',
            'px-4',
            'py-2',
            'rounded',
            'hover:bg-blue-600'
        );
    });

    test('has correct heading hierarchy', () => {
        renderWithRouter(<Home />);
        const headings = screen.getAllByRole('heading');
        expect(headings).toHaveLength(1);
        expect(headings[0]).toHaveTextContent(/welcome to blogfrog/i);
        expect(headings[0].tagName).toBe('H1');
    });

    test('link is clickable and has correct attributes', () => {
        renderWithRouter(<Home />);
        const link = screen.getByRole('link', { name: /view blogs/i });

        expect(link).toBeEnabled();
        expect(link).not.toHaveAttribute('target'); // Should not open in new tab
        expect(link).not.toHaveAttribute('rel'); // No special rel attributes needed
    });
}); 