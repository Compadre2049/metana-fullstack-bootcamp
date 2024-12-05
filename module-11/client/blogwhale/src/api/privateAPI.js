const BASE_URL = process.env.REACT_APP_BACKEND_ORIGIN;

export const getPrivateData = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_BACKEND_ORIGIN}/api/private`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch admin data');
        }

        return await response.json();
    } catch (error) {
        console.error('Private API Error:', error);
        throw error;
    }
};

// You can add more private API functions here
export const updatePrivateData = async (data) => {
    const token = localStorage.getItem('token');

    if (!token) {
        throw new Error('No authentication token found');
    }

    try {
        const response = await fetch(`${BASE_URL}/private`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Failed to update private data');
        }

        return response.json();
    } catch (error) {
        console.error('Private API Error:', error);
        throw new Error(error.message || 'Error updating private data');
    }
};