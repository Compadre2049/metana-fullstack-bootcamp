import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAuth } from '../context/AuthContext';
import Profile from '../pages/Profile';

// Mock the auth context
jest.mock('../context/AuthContext', () => ({
    useAuth: jest.fn()
}));

describe('Profile Component', () => {
    const mockUser = {
        email: 'test@example.com',
        name: 'Test User'
    };

    const mockUpdateUser = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockImplementation(() => ({
            user: mockUser,
            updateUser: mockUpdateUser
        }));
        localStorage.setItem('token', 'fake-token');
    });

    test('renders user information', () => {
        render(<Profile />);

        expect(screen.getByText('Email')).toBeInTheDocument();
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
        expect(screen.getByText('Name')).toBeInTheDocument();
        expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    test('shows edit form when edit button is clicked', async () => {
        render(<Profile />);

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        expect(screen.getByPlaceholderText('Enter new name')).toBeInTheDocument();
        expect(screen.getByText('Save')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    test('handles successful name update', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ name: 'New Name' })
            })
        );

        render(<Profile />);

        // Click edit button
        await userEvent.click(screen.getByText('Edit'));

        // Update name
        const input = screen.getByPlaceholderText('Enter new name');
        await userEvent.clear(input);
        await userEvent.type(input, 'New Name');

        // Submit form
        await userEvent.click(screen.getByText('Save'));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/users/update-name'),
                expect.objectContaining({
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer fake-token'
                    },
                    body: JSON.stringify({ name: 'New Name' })
                })
            );
            expect(mockUpdateUser).toHaveBeenCalledWith({
                ...mockUser,
                name: 'New Name'
            });
            expect(screen.getByText('Name updated successfully!')).toBeInTheDocument();
        });
    });

    test('handles update error', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                json: () => Promise.resolve({ message: 'Update failed' })
            })
        );

        render(<Profile />);

        await userEvent.click(screen.getByText('Edit'));
        await userEvent.click(screen.getByText('Save'));

        await waitFor(() => {
            expect(screen.getByText('Update failed')).toBeInTheDocument();
        });
    });

    test('cancels edit mode', async () => {
        render(<Profile />);

        await userEvent.click(screen.getByText('Edit'));
        const input = screen.getByPlaceholderText('Enter new name');
        await userEvent.clear(input);
        await userEvent.type(input, 'Cancelled Name');

        await userEvent.click(screen.getByText('Cancel'));

        expect(screen.queryByPlaceholderText('Enter new name')).not.toBeInTheDocument();
        expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    test('validates required name field', async () => {
        render(<Profile />);

        await userEvent.click(screen.getByText('Edit'));
        const input = screen.getByPlaceholderText('Enter new name');
        await userEvent.clear(input);

        expect(input).toBeRequired();
    });

    test('applies correct CSS classes', () => {
        render(<Profile />);

        // Check container classes
        expect(screen.getByRole('heading', { name: /profile/i }).parentElement)
            .toHaveClass('max-w-2xl', 'mx-auto', 'p-4');

        // Check form container classes when editing
        fireEvent.click(screen.getByText('Edit'));
        const form = screen.getByPlaceholderText('Enter new name').closest('form');
        expect(form).toHaveClass('space-y-4');

        // Check input classes
        const input = screen.getByPlaceholderText('Enter new name');
        expect(input).toHaveClass(
            'shadow',
            'appearance-none',
            'border',
            'rounded',
            'w-full',
            'py-2',
            'px-3',
            'text-gray-700',
            'leading-tight',
            'focus:outline-none',
            'focus:shadow-outline'
        );
    });

    test('shows loading state when user is not loaded', () => {
        useAuth.mockImplementation(() => ({
            user: null,
            updateUser: mockUpdateUser
        }));

        render(<Profile />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
}); 