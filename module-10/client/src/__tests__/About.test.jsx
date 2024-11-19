import { render, screen } from '@testing-library/react';
import About from '../pages/About';

describe('About Component', () => {
    beforeEach(() => {
        render(<About />);
    });

    test('renders the main heading', () => {
        const heading = screen.getByRole('heading', {
            name: /about blogwhale/i,
            level: 1
        });
        expect(heading).toBeInTheDocument();
    });

    test('renders the introduction paragraph', () => {
        const intro = screen.getByText(/BlogWhale is a modern blogging platform/);
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
        const container = document.querySelector('.container');
        expect(container).toHaveClass('container', 'mx-auto', 'px-4', 'py-8', 'max-w-3xl');

        // Test heading classes
        const mainHeading = screen.getByRole('heading', { name: /about blogwhale/i });
        expect(mainHeading).toHaveClass('text-3xl', 'font-bold', 'mb-6');

        // Test section headings
        const sectionHeadings = screen.getAllByRole('heading', { level: 2 });
        sectionHeadings.forEach(heading => {
            expect(heading).toHaveClass('text-2xl', 'font-semibold', 'mb-4');
        });

        // Test paragraphs
        const paragraphs = document.querySelectorAll('p');
        paragraphs.forEach(p => {
            expect(p).toHaveClass('text-gray-700', 'mb-4');
        });

        // Test feature list
        const list = document.querySelector('ul');
        expect(list).toHaveClass('list-disc', 'list-inside', 'text-gray-700', 'space-y-2');
    });

    test('renders all sections in correct order', () => {
        const sections = document.querySelectorAll('section');
        expect(sections).toHaveLength(3);

        // Check content of each section
        expect(sections[0]).toHaveTextContent(/BlogWhale is a modern blogging platform/);
        expect(sections[1]).toHaveTextContent(/Features/);
        expect(sections[2]).toHaveTextContent(/Our Mission/);

        // Check section spacing
        sections.forEach(section => {
            expect(section).toHaveClass('mb-8');
        });
    });
}); 