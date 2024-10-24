import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Blogs() {
    const [blogs, setBlogs] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`${process.env.REACT_APP_BACKEND_ORIGIN}/api/blogs`)
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => {
                        throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
                    });
                }
                return response.json();
            })
            .then(data => setBlogs(data))
            .catch(error => {
                console.error('Error fetching blogs:', error);
                setError(error.message);
            });
    }, []);

    if (error) return <div>Error: {error}</div>;
    if (blogs.length === 0) return <div>Loading...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Blogs</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {blogs.map(blog => (
                    <div key={blog._id} className="bg-white p-6 rounded shadow">
                        <h2 className="text-xl font-semibold mb-2">
                            <Link to={`/blogs/${blog._id}`} className="text-blue-600 hover:underline">{blog.title}</Link>
                        </h2>
                        <p className="text-gray-600 mb-4">{blog.content.substring(0, 100)}...</p>
                        <p className="text-sm text-gray-500">Created: {new Date(blog.createdAt).toLocaleDateString()}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Blogs;
