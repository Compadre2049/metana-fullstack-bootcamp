const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const getAllBlogs = async () => {
    try {
        const response = await fetch(`${BASE_URL}/blogs`);
        if (!response.ok) {
            throw new Error('Failed to fetch blogs');
        }
        return response.json();
    } catch (error) {
        console.error('Error fetching blogs:', error);
        throw error;
    }
};

export const getBlogById = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}/blogs/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch blog');
        }
        return response.json();
    } catch (error) {
        console.error('Error fetching blog:', error);
        throw error;
    }
};

export const createBlog = async (blogData, token) => {
    try {
        const response = await fetch(`${BASE_URL}/blogs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(blogData)
        });
        if (!response.ok) {
            throw new Error('Failed to create blog');
        }
        return response.json();
    } catch (error) {
        console.error('Error creating blog:', error);
        throw error;
    }
};