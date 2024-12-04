import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Blogs() {
    const [blogs, setBlogs] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${process.env.REACT_APP_BACKEND_ORIGIN}/api/blogs`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                if (data.success && Array.isArray(data.data)) {
                    setBlogs(data.data);
                } else {
                    throw new Error('Invalid data format received');
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    if (loading) {
        return <div className="container mx-auto px-4 py-8">Loading...</div>;
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 text-red-500">
                Error: {error}
            </div>
        );
    }

    if (!blogs || blogs.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Blogs</h1>
                    {isAuthenticated && (
                        <Link
                            to="/blogs/create"
                            className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Create New Post
                        </Link>
                    )}
                </div>
                <p>No blogs found</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Blogs</h1>
                {isAuthenticated && (
                    <Link
                        to="/blogs/create"
                        className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Create New Post
                    </Link>
                )}
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {blogs.map(blog => (
                    <div key={blog._id} className="bg-white p-6 rounded shadow">
                        <h2 className="text-xl font-semibold mb-2">
                            <Link to={`/blogs/${blog._id}`} className="text-blue-600 hover:underline">
                                {blog.title}
                            </Link>
                        </h2>
                        <p className="text-gray-600 mb-4">
                            {blog.content.substring(0, 150)}
                            {blog.content.length > 150 && '...'}
                        </p>
                        <div className="text-sm text-gray-500">
                            <p>Created: {new Date(blog.createdAt).toLocaleDateString()}</p>
                            {blog.user ? (
                                <p>By: {blog.user.name || 'Unknown'}</p>
                            ) : (
                                <p>By: No user data found</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Blogs;