import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Contact from '../pages/Contact';
import userConfig from '../userConfig';

// Mock console.log
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => { });

// Mock userConfig
jest.mock('../userConfig', () => ({
    user: {
        email: 'test@example.com',
        phone: '123-456-7890'
    },
    socialMedia: {
        twitter: 'https://twitter.com/test',
        linkedin: 'https://linkedin.com/test',
        github: ''  // Empty to test conditional rendering
    }
}));

describe('Contact Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders contact form with all fields', () => {
        render(<Contact />);

        expect(screen.getByText('Contact Us')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Message')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Send Message' })).toBeInTheDocument();
    });

    test('displays user contact information from config', () => {
        render(<Contact />);

        expect(screen.getByText('Email: test@example.com')).toBeInTheDocument();
        expect(screen.getByText('Phone: 123-456-7890')).toBeInTheDocument();
    });

    test('renders social media links correctly', () => {
        render(<Contact />);

        // Check that Twitter and LinkedIn links are present
        const twitterLink = screen.getByText('Twitter');
        const linkedinLink = screen.getByText('Linkedin');

        expect(twitterLink).toHaveAttribute('href', 'https://twitter.com/test');
        expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com/test');

        // GitHub link should not be present as the URL is empty
        expect(screen.queryByText('Github')).not.toBeInTheDocument();
    });

    test('handles form input changes', async () => {
        render(<Contact />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const messageInput = screen.getByLabelText('Message');

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john@example.com');
        await userEvent.type(messageInput, 'Test message');

        expect(nameInput).toHaveValue('John Doe');
        expect(emailInput).toHaveValue('john@example.com');
        expect(messageInput).toHaveValue('Test message');
    });

    test('handles form submission', async () => {
        render(<Contact />);

        // Fill out the form
        await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
        await userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
        await userEvent.type(screen.getByLabelText('Message'), 'Test message');

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: 'Send Message' }));

        // Check if console.log was called with the form data
        expect(mockConsoleLog).toHaveBeenCalledWith(
            'Form submitted:',
            expect.objectContaining({
                name: 'John Doe',
                email: 'john@example.com',
                message: 'Test message'
            })
        );
    });

    test('validates required fields', async () => {
        render(<Contact />);

        // Get form elements directly
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const messageInput = screen.getByLabelText('Message');
        const submitButton = screen.getByRole('button', { name: 'Send Message' });

        // Try to submit empty form
        await userEvent.click(submitButton);

        // Check required attributes
        expect(nameInput).toHaveAttribute('required');
        expect(emailInput).toHaveAttribute('required');
        expect(messageInput).toHaveAttribute('required');

        // Fill in one field at a time and verify others remain required
        await userEvent.type(nameInput, 'John Doe');
        expect(nameInput).toHaveValue('John Doe');
        expect(emailInput).toHaveAttribute('required');
        expect(messageInput).toHaveAttribute('required');

        await userEvent.type(emailInput, 'invalid'); // Invalid email
        expect(emailInput).toHaveAttribute('type', 'email');

        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'john@example.com'); // Valid email
        expect(emailInput).toHaveValue('john@example.com');

        // Message should still be required
        expect(messageInput).toHaveAttribute('required');

        // Fill in message
        await userEvent.type(messageInput, 'Test message');
        expect(messageInput).toHaveValue('Test message');

        // Now all fields should be filled
        expect(nameInput).toHaveValue('John Doe');
        expect(emailInput).toHaveValue('john@example.com');
        expect(messageInput).toHaveValue('Test message');
    });

    test('validates email format', () => {
        render(<Contact />);

        const emailInput = screen.getByLabelText('Email');

        // Check that the email input has type="email"
        expect(emailInput).toHaveAttribute('type', 'email');
    });

    test('applies correct CSS classes', () => {
        render(<Contact />);

        // Check container classes
        expect(screen.getByRole('heading', { name: 'Contact Us' }).parentElement)
            .toHaveClass('max-w-2xl', 'mx-auto', 'px-4', 'py-8');

        // Check form input classes
        const inputs = [
            screen.getByLabelText('Name'),
            screen.getByLabelText('Email'),
            screen.getByLabelText('Message')
        ];

        inputs.forEach(input => {
            expect(input).toHaveClass(
                'w-full',
                'px-3',
                'py-2',
                'border',
                'border-gray-300',
                'rounded',
                'focus:outline-none',
                'focus:ring-2',
                'focus:ring-blue-500'
            );
        });

        // Check submit button classes
        expect(screen.getByRole('button', { name: 'Send Message' }))
            .toHaveClass(
                'w-full',
                'py-2',
                'px-4',
                'bg-blue-500',
                'text-white',
                'rounded',
                'hover:bg-blue-600',
                'transition-colors'
            );
    });
}); 