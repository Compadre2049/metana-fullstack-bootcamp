import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NotFound from '../pages/NotFound';

// Helper function to render with Router
const renderWithRouter = (component) => {
    return render(
        <BrowserRouter>
            {component}
        </BrowserRouter>
    );
};

describe('NotFound Component', () => {
    test('renders 404 heading', () => {
        renderWithRouter(<NotFound />);
        const heading = screen.getByRole('heading', {
            name: /404/i,
            level: 1
        });
        expect(heading).toBeInTheDocument();
    });

    test('renders error message', () => {
        renderWithRouter(<NotFound />);
        const message = screen.getByText(/page not found/i);
        expect(message).toBeInTheDocument();
    });

    test('renders home link', () => {
        renderWithRouter(<NotFound />);
        const link = screen.getByRole('link', { name: /go home/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/');
    });

    test('applies correct CSS classes', () => {
        renderWithRouter(<NotFound />);

        // Check container classes
        const container = screen.getByRole('heading', { name: /404/i }).parentElement;
        expect(container).toHaveClass(
            'flex',
            'flex-col',
            'items-center',
            'justify-center',
            'min-h-[70vh]'
        );

        // Check heading classes
        const heading = screen.getByRole('heading', { name: /404/i });
        expect(heading).toHaveClass(
            'text-6xl',
            'font-bold',
            'text-gray-800',
            'mb-4'
        );

        // Check error message classes
        const message = screen.getByText(/page not found/i);
        expect(message).toHaveClass(
            'text-2xl',
            'text-gray-600',
            'mb-8'
        );

        // Check link classes
        const link = screen.getByRole('link', { name: /go home/i });
        expect(link).toHaveClass(
            'px-4',
            'py-2',
            'bg-blue-500',
            'text-white',
            'rounded',
            'hover:bg-blue-600',
            'transition-colors'
        );
    });

    test('has correct heading hierarchy', () => {
        renderWithRouter(<NotFound />);
        const headings = screen.getAllByRole('heading');
        expect(headings).toHaveLength(1);
        expect(headings[0]).toHaveTextContent('404');
        expect(headings[0].tagName).toBe('H1');
    });

    test('link is clickable and has correct attributes', () => {
        renderWithRouter(<NotFound />);
        const link = screen.getByRole('link', { name: /go home/i });

        expect(link).toBeEnabled();
        expect(link).not.toHaveAttribute('target'); // Should not open in new tab
        expect(link).not.toHaveAttribute('rel'); // No special rel attributes needed
    });

    test('maintains semantic structure', () => {
        renderWithRouter(<NotFound />);

        // Check the order of elements
        const container = screen.getByRole('heading', { name: /404/i }).parentElement;
        const children = container.children;

        expect(children[0].tagName).toBe('H1'); // First child is heading
        expect(children[1].tagName).toBe('P'); // Second child is paragraph
        expect(children[2].tagName).toBe('A'); // Third child is link
    });
}); 