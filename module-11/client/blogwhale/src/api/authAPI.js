const BASE_URL = process.env.REACT_APP_BACKEND_ORIGIN;

export const login = async (credentials) => {
    try {
        const response = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();
        console.log('Server response:', {
            fullData: data,
            token: data.token,
            user: data.user,
            dataType: typeof data,
            hasUser: 'user' in data,
            hasToken: 'token' in data
        });

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        return {
            token: data.token,
            user: {
                id: data.user.id,
                name: data.user.name,
                email: data.user.email,
                role: data.user.role
            }
        };
    } catch (error) {
        console.error('Login error details:', {
            error,
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
};