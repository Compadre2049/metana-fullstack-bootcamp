import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function Profile() {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Set initial name when component mounts or user changes
    useEffect(() => {
        if (user?.name) {
            setNewName(user.name);
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

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
            console.log('Update response:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update name');
            }

            updateUser({ ...user, name: newName });
            setIsEditing(false);
            setSuccess('Name updated successfully!');
        } catch (error) {
            console.error('Update error:', error);
            setError(error.message || 'Failed to update name. Please try again.');
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Profile</h1>

            <div className="bg-white shadow rounded-lg p-6">
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Email
                    </label>
                    <p className="text-gray-600">{user?.email}</p>
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Name
                    </label>
                    {isEditing ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="Enter new name"
                                required
                            />
                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setNewName(user?.name || '');
                                    }}
                                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="flex items-center justify-between">
                            <p className="text-gray-600">{user?.name || 'Loading...'}</p>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                            >
                                Edit
                            </button>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                        {success}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Profile;