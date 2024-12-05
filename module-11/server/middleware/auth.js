import jwt from 'jsonwebtoken';

export const isLoggedIn = (req, res, next) => {
    try {
        console.log('Headers:', req.headers); // Debug headers
        const token = req.headers.authorization?.split(' ')[1];
        console.log('Extracted token:', token); // Debug token

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Decoded token:', decoded); // Debug decoded token

            // Ensure decoded token has required fields
            if (!decoded.id) {
                throw new Error('Token missing user ID');
            }

            // Set user with proper ID field
            req.user = {
                _id: decoded.id, // Make sure to use the correct field name
                email: decoded.email,
                role: decoded.role
            };

            console.log('User set in request:', req.user); // Debug user object
            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expired'
                });
            }
            throw error;
        }
    } catch (error) {
        console.error('Auth error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

export const isAdmin = (req, res, next) => {
    try {
        console.log('Headers in isAdmin:', req.headers); // Debug headers
        const token = req.headers.authorization?.split(' ')[1];
        console.log('Token in isAdmin:', token); // Debug token

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Decoded token in isAdmin:', decoded); // Debug decoded token

            if (decoded.role !== 'admin') { // Check role instead of email
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized as admin'
                });
            }

            req.user = decoded;
            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expired'
                });
            }
            throw error;
        }
    } catch (error) {
        console.error('Admin auth error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};
