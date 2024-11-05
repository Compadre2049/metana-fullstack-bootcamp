import React, { useState, useEffect, useCallback } from 'react';
import { getPrivateData } from '../api/privateAPI';
import { useAuth } from '../context/AuthContext';

function AdminPage() {
    const [adminData, setAdminData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState('');
    const [updateMessage, setUpdateMessage] = useState(null);
    const { user, updateUser } = useAuth();

    const fetchAdminData = useCallback(async () => {
        try {
            const data = await getPrivateData();
            setAdminData(data);
            setLoading(false);
        } catch (error) {
            setError('Failed to load admin data');
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAdminData();
    }, [fetchAdminData]);

    const handleDeleteUser = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_BACKEND_ORIGIN}/api/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete user');
            }

            // Refresh the admin data after successful deletion
            await fetchAdminData();
        } catch (error) {
            setError('Failed to delete user');
        }
    };

    const handleUpdateName = async (e) => {
        e.preventDefault();
        setUpdateMessage(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_BACKEND_ORIGIN}/api/users/update-name`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name: newName })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update name');
            }

            updateUser({ ...user, name: newName });
            await fetchAdminData(); // Refresh the admin data
            setIsEditingName(false);
            setUpdateMessage({ type: 'success', text: 'Name updated successfully!' });
        } catch (error) {
            setUpdateMessage({ type: 'error', text: error.message });
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="max-w-6xl mx-auto p-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>

                {/* Admin Name Edit Section */}
                <div className="bg-white p-4 rounded-lg shadow">
                    {isEditingName ? (
                        <form onSubmit={handleUpdateName} className="flex items-center space-x-4">
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Enter new name"
                                className="border rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            <button
                                type="submit"
                                className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                            >
                                Save
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditingName(false);
                                    setNewName(user?.name || '');
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                Cancel
                            </button>
                        </form>
                    ) : (
                        <div className="flex items-center space-x-4">
                            <span>Admin Name: {user?.name}</span>
                            <button
                                onClick={() => {
                                    setIsEditingName(true);
                                    setNewName(user?.name || '');
                                }}
                                className="text-blue-500 hover:text-blue-700 text-sm"
                            >
                                Edit Name
                            </button>
                        </div>
                    )}

                    {updateMessage && (
                        <div className={`mt-2 text-sm ${updateMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                            {updateMessage.text}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Statistics Panel */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Blog Statistics</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span>Total Users:</span>
                            <span className="font-bold">{adminData?.statistics.totalUsers}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Total Blogs:</span>
                            <span className="font-bold">{adminData?.statistics.totalBlogs}</span>
                        </div>

                        <h3 className="text-lg font-semibold mt-6 mb-2">Most Active Authors</h3>
                        <div className="space-y-2">
                            {adminData?.statistics.blogsPerAuthor.map(author => (
                                <div key={author._id} className="flex justify-between items-center">
                                    <span>{author.author.name}</span>
                                    <span className="font-bold">{author.count} blogs</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* User Management Panel */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">User Management</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2">Name</th>
                                    <th className="text-left py-2">Email</th>
                                    <th className="text-right py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {adminData?.users.map(user => (
                                    <tr key={user._id} className="border-b">
                                        <td className="py-2">{user.name}</td>
                                        <td className="py-2">{user.email}</td>
                                        <td className="py-2 text-right">
                                            {user.email !== 'admin@example.com' && (
                                                <button
                                                    onClick={() => handleDeleteUser(user._id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminPage;