import jwt from 'jsonwebtoken';
import { isLoggedIn, isAdmin } from '../middleware/auth.js';
import { jest } from '@jest/globals';

describe('Auth Middleware', () => {
    let mockReq;
    let mockRes;
    let nextFunction;

    beforeEach(() => {
        // Reset mocks before each test
        mockReq = {
            headers: {},
            user: null
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        nextFunction = jest.fn();
        process.env.JWT_SECRET = 'test_secret';
    });

    describe('isLoggedIn Middleware', () => {
        it('should pass valid token and set user', () => {
            const token = jwt.sign({ id: '123', email: 'test@example.com' }, process.env.JWT_SECRET);
            mockReq.headers.authorization = `Bearer ${token}`;

            isLoggedIn(mockReq, mockRes, nextFunction);

            expect(nextFunction).toHaveBeenCalled();
            expect(mockReq.user).toBeDefined();
            expect(mockReq.user.email).toBe('test@example.com');
        });

        it('should return 401 when no token provided', () => {
            isLoggedIn(mockReq, mockRes, nextFunction);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'No token provided'
            });
            expect(nextFunction).not.toHaveBeenCalled();
        });

        it('should return 401 for expired token', () => {
            const token = jwt.sign(
                { id: '123', email: 'test@example.com' },
                process.env.JWT_SECRET,
                { expiresIn: '0s' }
            );
            mockReq.headers.authorization = `Bearer ${token}`;

            isLoggedIn(mockReq, mockRes, nextFunction);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Token expired'
            });
            expect(nextFunction).not.toHaveBeenCalled();
        });

        it('should return 401 for invalid token', () => {
            mockReq.headers.authorization = 'Bearer invalid_token';

            isLoggedIn(mockReq, mockRes, nextFunction);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid token'
            });
            expect(nextFunction).not.toHaveBeenCalled();
        });
    });

    describe('isAdmin Middleware', () => {
        it('should pass for admin user', () => {
            const token = jwt.sign({ id: '123', email: 'admin@example.com' }, process.env.JWT_SECRET);
            mockReq.headers.authorization = `Bearer ${token}`;

            isAdmin(mockReq, mockRes, nextFunction);

            expect(nextFunction).toHaveBeenCalled();
            expect(mockReq.user).toBeDefined();
            expect(mockReq.user.email).toBe('admin@example.com');
        });

        it('should return 403 for non-admin user', () => {
            const token = jwt.sign({ id: '123', email: 'user@example.com' }, process.env.JWT_SECRET);
            mockReq.headers.authorization = `Bearer ${token}`;

            isAdmin(mockReq, mockRes, nextFunction);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Not authorized as admin'
            });
            expect(nextFunction).not.toHaveBeenCalled();
        });

        it('should return 401 when no token provided', () => {
            isAdmin(mockReq, mockRes, nextFunction);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'No token provided'
            });
            expect(nextFunction).not.toHaveBeenCalled();
        });

        it('should return 401 for expired token', () => {
            const token = jwt.sign(
                { id: '123', email: 'admin@example.com' },
                process.env.JWT_SECRET,
                { expiresIn: '0s' }
            );
            mockReq.headers.authorization = `Bearer ${token}`;

            isAdmin(mockReq, mockRes, nextFunction);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Token expired'
            });
            expect(nextFunction).not.toHaveBeenCalled();
        });

        it('should return 401 for invalid token', () => {
            mockReq.headers.authorization = 'Bearer invalid_token';

            isAdmin(mockReq, mockRes, nextFunction);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid token'
            });
            expect(nextFunction).not.toHaveBeenCalled();
        });
    });
}); 