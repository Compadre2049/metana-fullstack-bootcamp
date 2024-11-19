import jwt from 'jsonwebtoken';
import { isLoggedIn, isAdmin } from '../middleware/auth.js';
import { jest } from '@jest/globals';

describe('Auth Middleware', () => {
    let mockReq;
    let mockRes;
    let nextFunction;

    beforeEach(() => {
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
            const token = jwt.sign({
                id: '123',
                email: 'test@example.com',
                role: 'user'
            }, process.env.JWT_SECRET);

            mockReq.headers.authorization = `Bearer ${token}`;

            isLoggedIn(mockReq, mockRes, nextFunction);

            expect(nextFunction).toHaveBeenCalled();
            expect(mockReq.user).toBeDefined();
            expect(mockReq.user._id).toBe('123');
        });

        it('should return 401 when no token provided', () => {
            isLoggedIn(mockReq, mockRes, nextFunction);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(nextFunction).not.toHaveBeenCalled();
        });
    });

    describe('isAdmin Middleware', () => {
        it('should pass for admin user', () => {
            const token = jwt.sign({
                id: '123',
                email: 'admin@example.com',
                role: 'admin'
            }, process.env.JWT_SECRET);

            mockReq.headers.authorization = `Bearer ${token}`;
            isAdmin(mockReq, mockRes, nextFunction);

            expect(nextFunction).toHaveBeenCalled();
        });

        it('should return 403 for non-admin user', () => {
            const token = jwt.sign({
                id: '123',
                email: 'user@example.com',
                role: 'user'
            }, process.env.JWT_SECRET);

            mockReq.headers.authorization = `Bearer ${token}`;
            isAdmin(mockReq, mockRes, nextFunction);

            expect(mockRes.status).toHaveBeenCalledWith(403);
        });
    });
}); 