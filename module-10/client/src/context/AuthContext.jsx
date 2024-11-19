import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginAPI } from '../api/authAPI';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Function to check if token is expired
    const isTokenExpired = (token) => {
        if (!token) return true;

        try {
            const [, payload] = token.split('.');
            const decodedPayload = JSON.parse(atob(payload));
            return decodedPayload.exp * 1000 < Date.now();
        } catch (error) {
            console.error('Token validation error:', error);
            return true;
        }
    };

    // Check token validity and user data
    const checkAuthStatus = () => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (!storedToken || !storedUser || isTokenExpired(storedToken)) {
            // Clear invalid or expired data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            return;
        }

        try {
            setUser(JSON.parse(storedUser));
        } catch (error) {
            console.error('User data parsing error:', error);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setUser(null);
        }
    };

    // Initial auth check
    useEffect(() => {
        checkAuthStatus();
        setLoading(false);
    }, []);

    // Periodic token check
    useEffect(() => {
        const interval = setInterval(checkAuthStatus, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await loginAPI({ email, password });

            if (response.token) {
                const userData = {
                    id: response.user.id,
                    name: response.user.name,
                    email: response.user.email,
                    role: response.user.role
                };

                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
                return response;
            }
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const updateUser = (updatedUser) => {
        const newUserData = { ...user, ...updatedUser };
        localStorage.setItem('user', JSON.stringify(newUserData));
        setUser(newUserData);
    };

    const value = {
        user,
        login,
        logout,
        isAuthenticated: !!user,
        updateUser
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};