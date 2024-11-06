const BASE_URL = process.env.REACT_APP_BACKEND_ORIGIN;

export const getPrivateData = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
        throw new Error('No authentication token found');
    }

    try {
        const response = await fetch(`${BASE_URL}/private`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Failed to fetch private data');
        }

        return response.json();
    } catch (error) {
        console.error('Private API Error:', error);
        throw new Error(error.message || 'Error fetching private data');
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