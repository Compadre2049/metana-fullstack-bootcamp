import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Blogs() {
    const [blogs, setBlogs] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${process.env.REACT_APP_BACKEND_ORIGIN}/blogs`)
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                setBlogs(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching blogs:', error);
                setError(error.message);
                setLoading(false);
            });
    }, []);

    if (error) return (
        <div className="text-red-600 p-4">Error: {error}</div>
    );

    if (loading) return (
        <div className="text-gray-600 p-4">Loading...</div>
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Blogs</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {blogs.map(blog => (
                    <div key={blog._id} className="bg-white p-6 rounded shadow">
                        <h2 className="text-xl font-semibold mb-2">
                            <Link to={`/blogs/${blog._id}`} className="text-blue-600 hover:underline">
                                {blog.title}
                            </Link>
                        </h2>
                        <p className="text-gray-600 mb-4">
                            {blog.content?.substring(0, 100)}...
                        </p>
                        <p className="text-sm text-gray-500">
                            Created: {new Date(blog.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Blogs;