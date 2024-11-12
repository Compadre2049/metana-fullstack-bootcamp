import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function BlogPost() {
    const [blog, setBlog] = useState(null);
    const [error, setError] = useState(null);
    const { id } = useParams();

    useEffect(() => {
        const abortController = new AbortController();

        fetch(`${process.env.REACT_APP_BACKEND_ORIGIN}/api/blogs/${id}`, {
            signal: abortController.signal
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Fetched blog data:', data);
                setBlog(data);
            })
            .catch(error => {
                if (error.name !== 'AbortError') {
                    console.error('Error fetching blog:', error);
                    setError('Failed to load blog post');
                }
            });

        return () => {
            abortController.abort();
        };
    }, [id]);

    if (error) return <div className="text-red-500">{error}</div>;
    if (!blog) return <div className="text-gray-500">Loading...</div>;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Link to="/blogs" className="text-blue-500 hover:underline mb-4 inline-block">&larr; Back to Blogs</Link>
            <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>
            <p className="text-gray-600 mb-6">{blog.content}</p>
            <div className="text-sm text-gray-500">
                <p>Created: {formatDate(blog.createdAt)}</p>
                <p>Last Updated: {formatDate(blog.updatedAt)}</p>
            </div>
        </div>
    );
}

export default BlogPost;
