import { render, screen } from '@testing-library/react';
import About from '../pages/About';

describe('About Component', () => {
    beforeEach(() => {
        render(<About />);
    });

    test('renders the main heading', () => {
        const heading = screen.getByRole('heading', {
            name: /about blogfrog/i,
            level: 1
        });
        expect(heading).toBeInTheDocument();
    });

    test('renders the introduction paragraph', () => {
        const intro = screen.getByText(/BlogFrog is a modern blogging platform/);
        expect(intro).toBeInTheDocument();
    });

    test('renders the features section', () => {
        const featuresHeading = screen.getByRole('heading', {
            name: /features/i,
            level: 2
        });
        expect(featuresHeading).toBeInTheDocument();

        // Check all feature list items
        const features = [
            'Easy-to-use blog creation and editing',
            'Secure user authentication',
            'Responsive design for all devices',
            'Admin dashboard for content management',
            'Clean and modern user interface'
        ];

        features.forEach(feature => {
            expect(screen.getByText(feature)).toBeInTheDocument();
        });
    });

    test('renders the mission section', () => {
        const missionHeading = screen.getByRole('heading', {
            name: /our mission/i,
            level: 2
        });
        expect(missionHeading).toBeInTheDocument();

        const missionText = screen.getByText(/Our mission is to provide a platform/);
        expect(missionText).toBeInTheDocument();
    });

    test('applies correct CSS classes', () => {
        // Test container classes
        const container = screen.getByRole('heading', { name: /about blogfrog/i }).parentElement;
        expect(container).toHaveClass('container', 'mx-auto', 'px-4', 'py-8', 'max-w-3xl');

        // Test heading classes
        const mainHeading = screen.getByRole('heading', { name: /about blogfrog/i });
        expect(mainHeading).toHaveClass('text-3xl', 'font-bold', 'mb-6');

        // Test section headings
        const sectionHeadings = screen.getAllByRole('heading', { level: 2 });
        sectionHeadings.forEach(heading => {
            expect(heading).toHaveClass('text-2xl', 'font-semibold', 'mb-4');
        });

        // Test paragraphs
        const paragraphs = screen.getAllByText(/.*/, { selector: 'p' });
        paragraphs.forEach(p => {
            expect(p).toHaveClass('text-gray-700');
        });
    });

    test('renders all sections in correct order', () => {
        const content = screen.getByRole('heading', { name: /about blogfrog/i }).parentElement;
        const sections = content.getElementsByTagName('section');

        expect(sections).toHaveLength(3);
        expect(sections[0]).toHaveTextContent(/BlogFrog is a modern blogging platform/);
        expect(sections[1]).toHaveTextContent(/Features/);
        expect(sections[2]).toHaveTextContent(/Our Mission/);
    });
}); 