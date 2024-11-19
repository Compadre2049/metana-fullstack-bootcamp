import { login as loginAPI } from '../src/api/authAPI';

export const login = async (email, password) => {
    try {
        const response = await loginAPI({ email, password });

        if (response.token) {
            // Store token in localStorage
            localStorage.setItem('token', response.token);
            // Store user info if needed
            localStorage.setItem('user', JSON.stringify(response.user));
            return response;
        }

        throw new Error('No token received');
    } catch (error) {
        throw error;
    }
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Additional cleanup if needed
};

export const getToken = () => {
    return localStorage.getItem('token');
};

export const isAuthenticated = () => {
    const token = getToken();
    return !!token;
}; 