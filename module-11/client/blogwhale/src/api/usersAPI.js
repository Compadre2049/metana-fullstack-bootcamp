const BASE_URL = process.env.REACT_APP_API_URL

export const getUsers = async (token) => {
    const response = await fetch(`${BASE_URL}/users`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error('Failed to fetch users');
    }
    return response.json();
};

// More user methods will be added later 