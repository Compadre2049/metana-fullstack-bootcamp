import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function BlogPost() {
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const { id } = useParams();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBlog = async () => {
            if (id === 'create') return;

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${process.env.REACT_APP_BACKEND_ORIGIN}/api/blogs/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(
                        response.status === 404
                            ? 'Blog post not found'
                            : 'Failed to fetch blog'
                    );
                }

                const data = await response.json();
                if (!data.success) {
                    throw new Error(data.message || 'Failed to fetch blog');
                }

                setBlog(data.data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBlog();
    }, [id]);

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await fetch(`${process.env.REACT_APP_BACKEND_ORIGIN}/api/blogs/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to delete blog');
            }

            navigate('/blogs');
        } catch (error) {
            setError(error.message);
        } finally {
            setShowDeleteModal(false);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
    };

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto p-4">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto p-4">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p>{error}</p>
                    <Link to="/blogs" className="text-red-700 underline mt-2 inline-block">
                        Return to Blogs
                    </Link>
                </div>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="max-w-2xl mx-auto p-4">
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                    <p>Blog post not found</p>
                    <Link to="/blogs" className="text-yellow-700 underline mt-2 inline-block">
                        Return to Blogs
                    </Link>
                </div>
            </div>
        );
    }

    const isAuthor = isAuthenticated && (
        user?.id === blog.user?._id ||
        user?.role === 'admin'
    );

    const formattedDate = new Date(blog.createdAt).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <>
            <div className="max-w-2xl mx-auto p-4">
                <Link to="/blogs" className="text-blue-500 hover:underline mb-4 inline-block">
                    ← Back to Blogs
                </Link>

                <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>

                <div className="text-gray-600 mb-4">
                    By {blog.user?.name || 'Unknown Author'}
                </div>

                <p className="text-gray-600 mb-6">{blog.content}</p>

                <div className="text-sm text-gray-500">
                    <p>Created: {formattedDate}</p>
                    {blog.updatedAt && (
                        <p>Last Updated: {new Date(blog.updatedAt).toLocaleString()}</p>
                    )}
                </div>

                {isAuthor && (
                    <div className="mt-6 space-x-4">
                        <Link
                            to={`/blogs/edit/${id}`}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Edit
                        </Link>
                        <button
                            onClick={handleDeleteClick}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                            Delete
                        </button>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                        <h2 className="text-xl font-bold mb-4">Delete Blog</h2>
                        <p className="mb-6">
                            Are you sure you want to delete "{blog.title}"? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={handleDeleteCancel}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default BlogPost;
