import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminPage from '../pages/AdminPage';
import { useAuth } from '../context/AuthContext';
import { getPrivateData } from '../api/privateAPI';

// Mock the modules
jest.mock('../context/AuthContext');
jest.mock('../api/privateAPI');

describe('AdminPage Component', () => {
    const mockUser = {
        name: 'Admin User',
        email: 'admin@example.com'
    };

    const mockAdminData = {
        statistics: {
            totalUsers: 5,
            totalBlogs: 10,
            blogsPerAuthor: [
                { _id: '1', author: { name: 'Author 1' }, count: 3 },
                { _id: '2', author: { name: 'Author 2' }, count: 2 }
            ]
        },
        users: [
            { _id: '1', name: 'User 1', email: 'user1@example.com' },
            { _id: '2', name: 'User 2', email: 'user2@example.com' },
            { _id: '3', name: 'Admin', email: 'admin@example.com' }
        ]
    };

    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        localStorage.setItem('token', 'fake-token');

        // Mock auth context
        useAuth.mockImplementation(() => ({
            user: mockUser,
            updateUser: jest.fn()
        }));

        // Mock getPrivateData
        getPrivateData.mockResolvedValue(mockAdminData);
    });

    test('renders loading state and then content', async () => {
        // Create a delayed version of getPrivateData
        getPrivateData.mockImplementationOnce(() =>
            new Promise(resolve =>
                setTimeout(() => resolve(mockAdminData), 100)
            )
        );

        let rendered;
        await act(async () => {
            rendered = render(<AdminPage />);
        });

        // Check for loading state
        expect(rendered.container.textContent).toContain('Loading');

        // Wait for and check the loaded content
        await waitFor(() => {
            expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
        });
    });

    test('renders admin dashboard with statistics', async () => {
        await act(async () => {
            render(<AdminPage />);
        });

        await waitFor(() => {
            expect(screen.getByText('Total Users:')).toBeInTheDocument();
            expect(screen.getByText('5')).toBeInTheDocument();
            expect(screen.getByText('Total Blogs:')).toBeInTheDocument();
            expect(screen.getByText('10')).toBeInTheDocument();
        });
    });

    test('handles user deletion', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true
            })
        );

        await act(async () => {
            render(<AdminPage />);
        });

        await waitFor(() => {
            expect(screen.getByText('User Management')).toBeInTheDocument();
        });

        await act(async () => {
            fireEvent.click(screen.getAllByText('Delete')[0]);
        });

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/users/1'),
                expect.objectContaining({
                    method: 'DELETE',
                    headers: {
                        'Authorization': 'Bearer fake-token'
                    }
                })
            );
        });
    });

    test('handles name update', async () => {
        const mockUpdateUser = jest.fn();
        useAuth.mockImplementation(() => ({
            user: mockUser,
            updateUser: mockUpdateUser
        }));

        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ name: 'New Admin Name' })
            })
        );

        await act(async () => {
            render(<AdminPage />);
        });

        await waitFor(() => {
            expect(screen.getByText(/Admin Name:/)).toBeInTheDocument();
        });

        // Click edit button
        await act(async () => {
            fireEvent.click(screen.getByText('Edit Name'));
        });

        // Clear and type new name
        const input = screen.getByPlaceholderText('Enter new name');
        await act(async () => {
            await userEvent.clear(input);
            await userEvent.type(input, 'New Admin Name');
        });

        // Submit form
        await act(async () => {
            fireEvent.click(screen.getByText('Save'));
        });

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/users/update-name'),
                expect.objectContaining({
                    method: 'PUT',
                    headers: {
                        'Authorization': 'Bearer fake-token',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name: 'New Admin Name' })
                })
            );
        });
    });

    test('handles error state', async () => {
        getPrivateData.mockRejectedValueOnce(new Error('Failed to load admin data'));

        await act(async () => {
            render(<AdminPage />);
        });

        await waitFor(() => {
            expect(screen.getByText('Error: Failed to load admin data')).toBeInTheDocument();
        });
    });

    test('displays most active authors', async () => {
        await act(async () => {
            render(<AdminPage />);
        });

        await waitFor(() => {
            expect(screen.getByText('Most Active Authors')).toBeInTheDocument();
            expect(screen.getByText('Author 1')).toBeInTheDocument();
            expect(screen.getByText('3 blogs')).toBeInTheDocument();
        });
    });
}); 